const { default: makeWASocket, useMultiFileAuthState } = require('@adiwajshing/baileys-md');
const P = require('pino');
const downloadTikTokVideo = require('./tiktokDownloader');
const downloadFacebookVideo = require('./facebookDownloader');
const downloadYouTubeVideo = require('./youtubeDownloader');

const startSock = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        auth: state,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            if (shouldReconnect) {
                startSock();
            }
        } else if (connection === 'open') {
            console.log('opened connection');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && m.type === 'notify') {
            const { text } = msg.message.conversation;
            const command = text.split(' ')[0];
            const url = text.split(' ')[1];

            if (command === '.menu') {
                await sock.sendMessage(msg.key.remoteJid, { text: '.menu, .tiktok <url>, .fb <url>, .ytmp3 <url>, .ytmp4 <url>' });
            } else if (command === '.tiktok' && url) {
                const videoFile = await downloadTikTokVideo(url);
                await sock.sendMessage(msg.key.remoteJid, { video: { url: videoFile }, caption: 'Here is your TikTok video!' });
            } else if (command === '.fb' && url) {
                const videoFile = await downloadFacebookVideo(url);
                await sock.sendMessage(msg.key.remoteJid, { video: { url: videoFile }, caption: 'Here is your Facebook video!' });
            } else if ((command === '.ytmp3' || command === '.ytmp4') && url) {
                const format = command === '.ytmp3' ? 'mp3' : 'mp4';
                const videoFile = await downloadYouTubeVideo(url, format);
                const mediaType = format === 'mp3' ? { audio: { url: videoFile } } : { video: { url: videoFile } };
                await sock.sendMessage(msg.key.remoteJid, { ...mediaType, caption: `Here is your YouTube ${format} file!` });
            } else {
                await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid command or URL' });
            }
        }
    });

    return sock;
};

startSock();
