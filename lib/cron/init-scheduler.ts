import cron from 'node-cron';

let schedulerInitialized = false;

export function initializeScheduler() {
  // Only initialize once
  if (schedulerInitialized) {
    return;
  }
  schedulerInitialized = true;

  console.log('\n' + '='.repeat(60));
  console.log('🚀 CRON SCHEDULER INITIALIZING...');
  console.log('='.repeat(60) + '\n');

  // Schedule task to run every 5 minutes
  const task = cron.schedule('*/5 * * * *', async () => {
    const now = new Date();
    const timeStr = now.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    console.log(`\n⏰ [${timeStr}] CRON: Checking scheduled emails...`);

    try {
      // Call the cron endpoint
      const response = await fetch('http://localhost:3000/api/cron/send-emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-key'}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(`❌ CRON: API returned status ${response.status}`);
        return;
      }

      const data = await response.json();

      // Show summary
      if (data.summary) {
        const { usersChecked, ideasGenerated, emailsSent, skipped, errors } = data.summary;
        
        console.log(`📊 CRON SUMMARY:`);
        console.log(`   - Users checked: ${usersChecked}`);
        console.log(`   - Ideas generated: ${ideasGenerated}`);
        console.log(`   - Emails sent: ${emailsSent}`);
        console.log(`   - Skipped: ${skipped}`);
        console.log(`   - Errors: ${errors}`);

        if (emailsSent > 0) {
          console.log(`\n✅ SUCCESS: ${emailsSent} email(s) sent!`);
        } else if (skipped > 0) {
          console.log(`⏭️  No emails at this time (waiting for scheduled times)`);
        }
      }
    } catch (error) {
      console.error(`❌ CRON ERROR:`, error instanceof Error ? error.message : error);
    }
  });

  console.log('✅ CRON SCHEDULER STARTED');
  console.log('   Frequency: Every 5 minutes');
  console.log('   Status: ACTIVE ✓');
  console.log('   Checking scheduled emails automatically...\n');
  console.log('='.repeat(60) + '\n');

  // Return the task so it can be stopped if needed
  return task;
}