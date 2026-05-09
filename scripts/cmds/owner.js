const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "owner",
    author: "Tokodori", 
    role: 0,
    shortDescription: "Displays Saiful Islam's information.",
    longDescription: "Sends owner's bio, social links, and a video attachment.",
    category: "information",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    // Baby, let's use a standard 'cache' folder
    const cacheDir = path.join(__dirname, 'cache');
    const videoPath = path.join(cacheDir, 'owner_video.mp4');

    try {
      // Step 1: Create folder if it doesn't exist
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const ownerInfo = {
        name: '𝐒𝐀𝐈𝐅𝐔𝐋 𝐈𝐒𝐋𝐀𝐌',
        nick: '𝐒𝐈𝐅𝐔',
        age: '21',
        study: 'Honours 2nd Year (Management)',
        location: 'Dhaka, Bangladesh 🇧🇩',
        fb: 'https://www.facebook.com/saiful.404.st',
        github: 'github.com/mikasa-4x'
      };

      const videoUrl = 'https://files.catbox.moe/463j4x.mp4';

      // Step 2: Download the video
      const res = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(videoPath, Buffer.from(res.data, 'binary'));

      const message = `╭──────『 𝐎𝐖𝐍𝐄𝐑 』──────⦿\n` +
                      `├‣ 𝐍𝐚𝐦𝐞: ${ownerInfo.name}\n` +
                      `├‣ 𝐍𝐢𝐜𝐤: ${ownerInfo.nick}\n` +
                      `├‣ 𝐀𝐠𝐞: ${ownerInfo.age}\n` +
                      `├‣ 𝐒𝐭𝐮𝐝𝐲: ${ownerInfo.study}\n` +
                      `├‣ 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧: ${ownerInfo.location}\n` +
                      `├──────『 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 』──────◊\n` +
                      `├‣ 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤: ${ownerInfo.fb}\n` +
                      `├‣ 𝐆𝐢𝐭𝐡𝐮𝐛: ${ownerInfo.github}\n` +
                      `╰────────────╼⦿`;

      // Step 3: Send the message
      return api.sendMessage({
        body: message,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, (err) => {
        if (err) console.error(err);
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); // Cleanup
      }, event.messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage(`Error: ${error.message}, Baby!`, event.threadID);
    }
  },
};
