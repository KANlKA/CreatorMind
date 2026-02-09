"use client";

import React from 'react';
import CardSwap, { Card } from './card-swap';
import { Circle, Lightbulb, Activity } from 'lucide-react';

export function AnimatedFeatures() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      {/* Left: Descriptive Text */}
      <div className="max-w-xl">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 ">
          Stop guessing. Start knowing.
        </h2>
        <p className="text-lg text-gray-400 mb-6 leading-relaxed">
          CreatorMind transforms your channel data into actionable insights. We analyze every video, every comment, and every pattern to tell you exactly what your audience wants next.
        </p>
        <p className="text-lg text-gray-400 leading-relaxed">
          No more throwing ideas at the wall. Every recommendation is backed by your own performance data and audience signals.
        </p>
        <p className="text-lg text-gray-400 leading-relaxed mt-4">
            We don't guess what might work. We analyze what has worked, what your audience is asking for, and what they'll engage with next.
        </p>
        <p className="text-lg text-gray-400 leading-relaxed mt-4">
            We turn thousands of comments into clarity. Every comment gets automatically categorized—requests, questions, praise, confusion—so you can see exactly what your audience wants more of. Combined with format analysis showing which video styles keep viewers watching longest, and topic gap identification revealing what's missing from your content, you get a complete picture of untapped opportunities sitting right in front of you.
        </p>
      </div>

      {/* Right: Animated Cards */}
      <div style={{ height: '600px', position: 'relative', marginTop: '-10px' }}>
        <CardSwap
          cardDistance={60}
          verticalDistance={70}
          delay={5000}
          pauseOnHover={true}
          width={450}
          height={350}
        >

        {/* Card 1 */}
        <Card>
          <div className="h-full flex flex-col bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">

            {/* Header (centered vertically) */}
            <div className="flex items-center gap-3 px-6 h-10">
              <Circle className="h-6 w-6 text-white fill-white" />
              <h3 className="text-lg font-normal text-white/90">
Deep Analysis</h3>
            </div>

            {/* Divider */}
            <div className="h-0.5 w-full bg-white" />

            {/* Image Background Section */}
            <div className="relative flex-1">

              <img
                src="/rays.jpg"
                alt="feature visual"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/50" />

              <div className="relative p-6 text-white/70">
                We analyze ALL your videos, comments, and patterns to understand what truly works for YOUR channel.
              </div>

            </div>

          </div>
        </Card>

        {/* Card 2 */}
        <Card>
          <div className="h-full flex flex-col bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">

            <div className="flex items-center gap-3 px-6 h-10">
              <Lightbulb className="h-5 w-5 text-white" />
              <h3 className="text-lg font-normal text-white/90">
Top 5 Ideas Weekly</h3>
            </div>

            <div className="h-0.5 w-full bg-white" />

            <div className="relative flex-1">

              <img
                src="/rays.jpg"
                alt="feature visual"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/50" />

              <div className="relative p-6 text-white/70">
                Every week, get 5 video ideas backed by evidence from your own audience and performance data.
              </div>

            </div>

          </div>
        </Card>

        {/* Card 3 */}
        <Card>
          <div className="h-full flex flex-col bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">

            <div className="flex items-center gap-3 px-6 h-10">
              <Activity className="h-5 w-5 text-white" />
              <h3 className="text-lg font-normal text-white/90">Predict Performance</h3>
            </div>

            <div className="h-0.5 w-full bg-white" />

            <div className="relative flex-1">

              <img
                src="/rays.jpg"
                alt="feature visual"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/50" />

              <div className="relative p-6 text-white/70">
                See predicted engagement for each idea with confidence scores based on your historical data.
              </div>

            </div>

          </div>
        </Card>

      </CardSwap>
      </div>

    </div>
  );
}
