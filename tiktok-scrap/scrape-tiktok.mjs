import { chromium } from 'playwright';
import fs from 'fs/promises';

async function scrapeTikTokFavorites() {
  const browser = await chromium.launch({ headless: false }); // headless:false to see the process
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Go to TikTok login page
    await page.goto('https://www.tiktok.com/login');
    
    // Wait for manual login since TikTok has strong bot detection
    console.log('Please login manually...');
    await page.waitForSelector('[data-e2e="profile-icon"]', { timeout: 300000 }); // 5 minute timeout for login
    
    // Navigate to favorites
    await page.goto('https://www.tiktok.com/favorites');
    
    // Wait for videos to load
    await page.waitForSelector('[data-e2e="user-post-item"]');

    const favorites = [];
    let previousHeight = 0;

    // Scroll and collect videos
    while (true) {
      const videos = await page.$$('[data-e2e="user-post-item"]');
      
      for (const video of videos) {
        const videoLink = await video.$eval('a', el => el.href);
        const description = await video.$eval('[data-e2e="user-post-item-desc"]', el => el.textContent)
          .catch(() => ''); // Some videos might not have descriptions

        // Only add if not already in favorites
        if (!favorites.some(f => f.url === videoLink)) {
          favorites.push({
            url: videoLink,
            description,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Scroll down
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      
      // Check if we've reached the bottom
      const currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      if (currentHeight === previousHeight) {
        break;
      }
      previousHeight = currentHeight;

      // Wait for new content to load
      await page.waitForTimeout(1000);
    }

    // Save to JSON file
    await fs.writeFile(
      'tiktok-favorites.json', 
      JSON.stringify(favorites, null, 2)
    );

    console.log(`Saved ${favorites.length} favorites to tiktok-favorites.json`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

scrapeTikTokFavorites();