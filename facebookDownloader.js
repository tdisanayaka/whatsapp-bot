const fbDownloader = require('fb-video-downloader');
const fs = require('fs');

async function downloadFacebookVideo(url) {
    try {
        const res = await fbDownloader.getVideo(url);

        const fileName = `facebook_${Date.now()}.mp4`;
        const response = await axios({
            url: res.download.hd,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(fileName);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Facebook video downloaded as ${fileName}`);
                resolve(fileName);
            });
            writer.on('error', (error) => {
                console.error('Error downloading Facebook video:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error downloading Facebook video:', error);
        throw error;
    }
}

module.exports = downloadFacebookVideo;
