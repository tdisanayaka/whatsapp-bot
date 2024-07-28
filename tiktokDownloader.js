const TikTokScraper = require('tiktok-scraper');
const fs = require('fs');

async function downloadTikTokVideo(url) {
    try {
        const videoMeta = await TikTokScraper.getVideoMeta(url);
        const videoBuffer = await TikTokScraper.downloadVideo(url);

        const fileName = `tiktok_${Date.now()}.mp4`;
        fs.writeFileSync(fileName, videoBuffer);

        console.log(`TikTok video downloaded as ${fileName}`);
        return fileName;
    } catch (error) {
        console.error('Error downloading TikTok video:', error);
        throw error;
    }
}

module.exports = downloadTikTokVideo;
