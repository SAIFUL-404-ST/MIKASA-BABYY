const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "info",
    version: "1.0",
    author: "Saif",
    countDown: 20,
    role: 0,
    shortDescription: { en: "Bot & Owner Info" },
    longDescription: { en: "Shows bot and owner information" },
    category: "information",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, usersData, threadsData }) {
    // ── Owner Info ──
    const owner = {
      fullName:  "Mohammad Saiful Islam",
      nickname:  "Saif",
      birthday:  "25 January 2005",
      blood:     "O+",
      city:      "Gaibandha, Bangladesh",
      hobby:     "Tourism ",
      color:     "Black 🖤",
      anime:     "AOT + Naruto ⚔️",
      dream:     "Europe ",
      mood:      "Happy Alltime 😊",
      coding:    "Loves Coding 💻",
      song:      "Tu Hain Kahan 🎵",
      watching:  "Gojo | MHA | Solo Leveling ✨",
      quote:     "Focus on career, not girls.\nGf is temporary, success is permanent 💯",
      wa:        "01823772045",
      fb:        "https://www.facebook.com/61567256940629",
      messenger: "https://m.me/61567256940629",
      github:    "https://github.com/mikasa-4x",
      tg:        "https://t.me/@S41FUL0",
      ig:        "https://www.instagram.com/saiful-404-st",
      tiktok:    "simplekingsaif",
      youtube:   "unpossible"
    };

    // ── Bot Info ──
    const totalCmds  = global.GoatBot.commands.size || 0;
    const mem        = process.memoryUsage();
    const ramUsed    = (mem.rss / 1024 / 1024).toFixed(2);
    const heapUsed   = (mem.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotal  = (mem.heapTotal / 1024 / 1024).toFixed(2);

    let totalUsers = 0, totalGroups = 0;
    try {
      totalUsers  = (await usersData.getAll()).length;
      totalGroups = (await threadsData.getAll()).length;
    } catch (_) {}

    const uptime   = process.uptime();
    const days     = Math.floor(uptime / 86400);
    const hours    = Math.floor((uptime % 86400) / 3600);
    const minutes  = Math.floor((uptime % 3600) / 60);
    const seconds  = Math.floor(uptime % 60);
    const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const now  = moment().tz('Asia/Dhaka');
    const date = now.format('DD MMMM YYYY');
    const time = now.format('hh:mm:ss A');

    const link = "https://files.catbox.moe/463j4x.mp4";

    const body =
`╔══════════════════════╗
   👤 OWNER INFORMATION
╚══════════════════════╝

📛 Full Name   : ${owner.fullName}
🏷️ Nickname    : ${owner.nickname}
🎂 Birthday    : ${owner.birthday}
🩸 Blood Group : ${owner.blood}
📍 City        : ${owner.city}
🎯 Dream       : ${owner.dream}
🎨 Fav Color   : ${owner.color}
⚔️ Fav Anime   : ${owner.anime}
🌍 Hobby       : ${owner.hobby}
💻 Passion     : ${owner.coding}
😊 Mood        : ${owner.mood}
🎵 Listening   : ${owner.song}
📺 Watching    : ${owner.watching}

💬 Quote:
"${owner.quote}"

╔══════════════════════╗
   🔗 SOCIAL LINKS
╚══════════════════════╝

📱 WhatsApp  : ${owner.wa}
👤 Facebook  : ${owner.fb}
💬 Messenger : ${owner.messenger}
🐙 GitHub    : ${owner.github}
✈️ Telegram  : ${owner.tg}
📸 Instagram : ${owner.ig}
🎵 TikTok    : ${owner.tiktok}
▶️ YouTube   : ${owner.youtube}

╔══════════════════════╗
   🤖 BOT INFORMATION
╚══════════════════════╝

🤖 Bot Name    : ${global.GoatBot.config.nickNameBot}
🔑 Prefix      : ${global.GoatBot.config.prefix}
📦 Version     : ${global.GoatBot.config.version || "1.0.0"}
🌐 Language    : JavaScript (Node.js)
🚀 Hosted On   : Render
⚙️ Commands    : ${totalCmds}
👥 Total Users : ${totalUsers}
💬 Total Groups: ${totalGroups}
🧠 RAM Used    : ${ramUsed} MB
📊 Heap        : ${heapUsed} / ${heapTotal} MB
⏱️ Uptime      : ${uptimeStr}

📅 Date        : ${date}
🕐 Time        : ${time}

══════════════════════════`;

    let stream = null;
    try {
      stream = await global.utils.getStreamFromURL(link);
    } catch (e) {
      console.log("⚠️ Info video load failed:", e.message);
    }

    message.reply({
      body,
      ...(stream && { attachment: stream })
    });
  },

  onChat: async function ({ event, message, usersData, threadsData }) {
    if (event.body && event.body.toLowerCase() === "info") {
      this.onStart({ message, usersData, threadsData });
    }
  }
};
