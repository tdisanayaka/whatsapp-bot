const ytdl = require('ytdl-core');
const fs = require('fs');

async function downloadYouTubeVideo(url, format = 'mp4') {
    try {
        const fileName = `youtube_${Date.now()}.${format}`;
        const video = ytdl(url, { format: format === 'mp3' ? 'audioonly' : 'video' });

        video.pipe(fs.createWriteStream(fileName));
        
        return new Promise((resolve, reject) => {
            video.on('end', () => {
                console.log(`YouTube video downloaded as ${fileName}`);
                resolve(fileName);
            });
            video.on('error', (error) => {
                console.error('Error downloading YouTube video:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error downloading YouTube video:', error);
        throw error;
    }
}

module.exports = downloadYouTubeVideo;
