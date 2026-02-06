import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";
import Comment from "@/models/Comment";
import { fetchAllVideos, fetchVideoComments } from "./fetcher";
import { getTranscript } from "./transcript";
import { analyzeVideo, analyzeComment } from "@/lib/ai/analyzer";

// In-memory progress tracking
interface SyncProgress {
  userId: string;
  totalVideos: number;
  processedVideos: number;
  currentVideo: string;
  status: 'fetching' | 'analyzing' | 'completed' | 'failed';
}

const progressMap = new Map<string, SyncProgress>();

export function getSyncProgress(userId: string): SyncProgress | null {
  return progressMap.get(userId) || null;
}

export async function initiateChannelSync(
  userId: string,
  channelId: string,
  accessToken: string
) {
  try {
    await connectDB();

    console.log(`[SYNC] Initiating sync for user ${userId}`);

    // Update user status to syncing
    await User.findByIdAndUpdate(userId, { syncStatus: "syncing" });

    // Run sync in background (don't await)
    syncChannelData(userId, channelId, accessToken).catch(async (error) => {
      console.error("[SYNC] Background sync error:", error);
      await User.findByIdAndUpdate(userId, { syncStatus: "failed" });
      progressMap.set(userId, {
        userId,
        totalVideos: 0,
        processedVideos: 0,
        currentVideo: 'Failed',
        status: 'failed',
      });
    });

    return { success: true };
  } catch (error) {
    console.error("[SYNC] Error initiating sync:", error);
    throw error;
  }
}

async function syncChannelData(
  userId: string,
  channelId: string,
  accessToken: string
) {
  try {
    console.log(`[SYNC] Starting sync for user ${userId}, channel ${channelId}`);

    // Initialize progress
    progressMap.set(userId, {
      userId,
      totalVideos: 0,
      processedVideos: 0,
      currentVideo: 'Fetching videos...',
      status: 'fetching',
    });

    // Fetch all videos
    const videos = await fetchAllVideos(channelId, accessToken);
    console.log(`Fetched ${videos.length} videos`);

    // Update progress with total count
    progressMap.set(userId, {
      userId,
      totalVideos: videos.length,
      processedVideos: 0,
      currentVideo: 'Starting analysis...',
      status: 'analyzing',
    });

    let processedCount = 0;

    // Process each video
    for (const videoData of videos) {
      try {
        // Update progress
        progressMap.set(userId, {
          userId,
          totalVideos: videos.length,
          processedVideos: processedCount,
          currentVideo: videoData.title,
          status: 'analyzing',
        });

        // Check if video already exists
        const existingVideo = await Video.findOne({ videoId: videoData.videoId });

        // Calculate engagement rate
        const rawEngagement =
          Math.log(videoData.likes + videoData.commentCount + 1) /
          Math.log(videoData.views + 1);

        const engagementRate = Math.min(rawEngagement, 1);
        let video;

        if (existingVideo) {
          console.log(`Video ${videoData.videoId} already exists, updating with fresh data...`);

          // Update existing video with latest metrics
          video = await Video.findByIdAndUpdate(
            existingVideo._id,
            {
              views: videoData.views,
              likes: videoData.likes,
              commentCount: videoData.commentCount,
              engagementRate,
              analyzedAt: new Date(),
            },
            { new: true }
          );
        } else {
          console.log(`Creating new video ${videoData.videoId}...`);

          // Fetch transcript for new videos
          const transcript = await getTranscript(videoData.videoId);

          // Analyze video with AI for new videos
          const analysis = await analyzeVideo({
            title: videoData.title,
            description: videoData.description,
            transcript,
          });

          // Create new video
          video = await Video.create({
            userId,
            videoId: videoData.videoId,
            title: videoData.title,
            description: videoData.description,
            publishedAt: new Date(videoData.publishedAt),
            duration: videoData.duration,
            views: videoData.views,
            likes: videoData.likes,
            commentCount: videoData.commentCount,
            engagementRate,
            viewVelocity: 0, // TODO: Calculate based on publish date
            analysis,
            transcript,
            thumbnailUrl: videoData.thumbnailUrl,
            analyzedAt: new Date(),
          });
        }

        // Fetch ALL comments (no limit)
        const comments = await fetchVideoComments(
          videoData.videoId,
          Infinity, // Fetch all comments
          accessToken
        );

        console.log(`Fetched ${comments.length} comments for video ${videoData.videoId}`);

        // Ensure video exists before processing comments
        if (!video) {
          console.error(`Failed to create/update video ${videoData.videoId}, skipping comments`);
          processedCount++;
          continue;
        }

        // Process comments (only add new ones)
        for (const commentData of comments) {
          try {
            // Check if comment already exists
            const existingComment = await Comment.findOne({
              commentId: commentData.commentId
            });

            if (existingComment) {
              // Update existing comment likes
              await Comment.findByIdAndUpdate(existingComment._id, {
                likes: commentData.likes,
                userId,
              });
            } else {
              // Create new comment
              const commentAnalysis = await analyzeComment(commentData.text);

              await Comment.create({
                userId,
                videoId: video._id,
                commentId: commentData.commentId,
                authorName: commentData.authorName,
                text: commentData.text,
                likes: commentData.likes,
                publishedAt: new Date(commentData.publishedAt),
                sentiment: commentAnalysis.sentiment,
                intent: commentAnalysis.intent,
                topics: commentAnalysis.topics,
                analyzedAt: new Date(),
              });
            }
          } catch (error) {
            console.error(`Error processing comment ${commentData.commentId}:`, error);
          }
        }

        processedCount++;
        console.log(`Processed ${processedCount}/${videos.length} videos`);

        // Rate limiting: wait 500ms between videos
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error processing video ${videoData.videoId}:`, error);
      }
    }

    // Update progress to completed
    progressMap.set(userId, {
      userId,
      totalVideos: videos.length,
      processedVideos: videos.length,
      currentVideo: 'Completed!',
      status: 'completed',
    });

    // Update user status
    await User.findByIdAndUpdate(userId, {
      syncStatus: "completed",
      lastSyncedAt: new Date(),
    });

    console.log(`Sync completed for user ${userId}`);
  } catch (error) {
    console.error("Sync error:", error);
    progressMap.set(userId, {
      userId,
      totalVideos: 0,
      processedVideos: 0,
      currentVideo: 'Failed',
      status: 'failed',
    });
    await User.findByIdAndUpdate(userId, { syncStatus: "failed" });
    throw error;
  }
}