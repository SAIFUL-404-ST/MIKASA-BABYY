const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const { getTime, getStreamFromURL } = global.utils;
const fs = require("fs");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "13.0",
    author: "♡—͟͞͞𝐓𝐀𝐌𝐈𝐌 ⸙",
    category: "events"
  },

  langs: {
    en: {
      session1: "𝐆𝐨𝐨𝐝 𝐌𝐨𝐫𝐧𝐢𝐧𝐠 ☕",
      session2: "𝐆𝐨𝐨𝐝 𝐍𝐨𝐨𝐧 ☀️",
      session3: "𝐆𝐨𝐨𝐝 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧 🌤️",
      session4: "𝐆𝐨𝐨𝐝 𝐄𝐯𝐞𝐧𝐢𝐧𝐠 🌆",
      session5: "𝐆𝐨𝐨𝐝 𝐍𝐢𝐠𝐡𝐭 🌙"
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {

    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const prefix = global.utils.getPrefix(threadID);
    const addedParticipants = event.logMessageData?.addedParticipants || [];
    const botID = String(api.getCurrentUserID());
    const { nickNameBot } = global.GoatBot.config;

    await threadsData.set(threadID, { "settings.sendWelcomeMessage": true });

    const hours = parseInt(getTime("HH"));
    const session =
      hours <= 10 ? getLang("session1") :
      hours <= 12 ? getLang("session2") :
      hours <= 18 ? getLang("session3") :
      hours <= 20 ? getLang("session4") :
      getLang("session5");

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //         🤖  BOT JOIN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const botAdded = addedParticipants.some(u => String(u.userFbId) === botID);

    if (botAdded) {
      if (nickNameBot) {
        await api.changeNickname(nickNameBot, threadID, botID).catch(() => {});
      }

      const threadInfo = await api.getThreadInfo(threadID).catch(() => null);
      if (!threadInfo) return;

      const botJoinMedia = await getStreamFromURL("https://files.catbox.moe/juupsu.mp4").catch(() => null);

      return message.send({
        body:
`✦ ─────────────────────── ✦
   🦋  𝐁𝐎𝐓 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘  🎀
✦ ─────────────────────── ✦

  » 𝐆𝐫𝐞𝐞𝐭𝐢𝐧𝐠   : 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮 𝐀𝐥𝐚𝐢𝐤𝐮𝐦 🕊️
  » 𝐒𝐞𝐬𝐬𝐢𝐨𝐧  : ${session}
  » 𝐆𝐫𝐨𝐮𝐩    : ${B(threadInfo.threadName)}
  » 𝐌𝐞𝐦𝐛𝐞𝐫𝐬  : ${B(threadInfo.participantIDs.length)} 𝐩𝐞𝐨𝐩𝐥𝐞

  ─────────────────────────
  ➜ 𝐏𝐫𝐞𝐟𝐢𝐱   :  [ ${B(prefix)} ]
  ➜ 𝐇𝐞𝐥𝐩     : ${B(prefix)}𝐡𝐞𝐥𝐩
  ─────────────────────────
🎀 𝐓𝐡𝐚𝐧𝐤𝐬 𝐅𝐨𝐫 𝐀𝐝𝐝𝐢𝐧𝐠 𝐌𝐞 !`,
        attachment: botJoinMedia ? [botJoinMedia] : []
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //        👥  MEMBER JOIN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (!global.temp.welcomeEvent[threadID]) {
      global.temp.welcomeEvent[threadID] = { data: [], timeout: null };
    }

    global.temp.welcomeEvent[threadID].data.push(...addedParticipants);
    clearTimeout(global.temp.welcomeEvent[threadID].timeout);

    global.temp.welcomeEvent[threadID].timeout = setTimeout(async () => {

      const threadData = await threadsData.get(threadID);
      const bannedUsers = threadData.data?.banned?.users || [];
      const threadInfo = await api.getThreadInfo(threadID).catch(() => null);
      if (!threadInfo) return;

      const validUsers = [];
      const mentions = [];

      for (const u of global.temp.welcomeEvent[threadID].data) {
        if (bannedUsers.some(b => String(b.id) === String(u.userFbId))) continue;
        validUsers.push(u);
        mentions.push({ tag: u.fullName, id: u.userFbId });
      }

      if (!validUsers.length) return;

      const adderID = event.author;
      const adderInfo = await api.getUserInfo(adderID).catch(() => ({}));
      const adderName = adderInfo[adderID]?.name || "Guardian";

      // For multiple members, use first member for card
      const newMember = validUsers[0];
      const memberNames = validUsers.map(u => u.fullName).join(", ");

      // Build welcome card image
      let cardStream = null;
      try {
        cardStream = await buildWelcomeCard({
          memberName: memberNames,
          memberUID: newMember.userFbId,
          adderName,
          adderUID: adderID,
          groupName: threadInfo.threadName,
          session
        });
      } catch (e) {
        console.error("[welcome] card error:", e.message);
      }

      await message.send({
        body:
`✦ ─────────────────────── ✦
   🧸  𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐓𝐇𝐄 𝐆𝐑𝐎𝐔𝐏  🖇️
✦ ─────────────────────── ✦

  🪄 𝐌𝐞𝐦𝐛𝐞𝐫  : ${validUsers.map(u => B(u.fullName)).join(", ")} 👋
  🖇️ 𝐒𝐞𝐬𝐬𝐢𝐨𝐧  : ${session}
  🦋 𝐆𝐫𝐨𝐮𝐩    : ${B(threadInfo.threadName)}

  ─────────────────────────
  🎀 𝐀𝐝𝐝𝐞𝐝 𝐛𝐲 : ${B(adderName)}
  ─────────────────────────
💫 𝐄𝐧𝐣𝐨𝐲 𝐘𝐨𝐮𝐫 𝐒𝐭𝐚𝐲 𝐇𝐞𝐫𝐞 !`,
        mentions,
        attachment: cardStream ? [cardStream] : []
      });

      delete global.temp.welcomeEvent[threadID];
    }, 1500);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   Welcome Card Builder
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function buildWelcomeCard({ memberName, memberUID, adderName, adderUID, groupName, session }) {
  const W = 900, H = 420;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // ── Background ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   "#0a0a0f");
  bg.addColorStop(0.5, "#0d0d1a");
  bg.addColorStop(1,   "#050510");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Cyber grid lines ──
  ctx.strokeStyle = "rgba(0, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // ── Glowing border ──
  ctx.save();
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 18;
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 2;
  roundRect(ctx, 10, 10, W - 20, H - 20, 18);
  ctx.stroke();
  ctx.restore();

  // ── Inner accent border ──
  ctx.strokeStyle = "rgba(0,255,255,0.15)";
  ctx.lineWidth = 1;
  roundRect(ctx, 18, 18, W - 36, H - 36, 13);
  ctx.stroke();

  // ── Top accent bar ──
  const topBar = ctx.createLinearGradient(0, 0, W, 0);
  topBar.addColorStop(0,   "transparent");
  topBar.addColorStop(0.3, "#00ffff");
  topBar.addColorStop(0.7, "#7b2fff");
  topBar.addColorStop(1,   "transparent");
  ctx.fillStyle = topBar;
  ctx.fillRect(30, 28, W - 60, 2);

  // ── WELCOME text header ──
  ctx.save();
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#00ffff";
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✦  W E L C O M E  T O  T H E  G R O U P  ✦", W / 2, 58);
  ctx.restore();

  // ── Group name ──
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  const shortGroup = groupName.length > 45 ? groupName.slice(0, 44) + "…" : groupName;
  ctx.fillText(shortGroup, W / 2, 80);
  ctx.restore();

  // ── Session tag ──
  ctx.save();
  ctx.fillStyle = "rgba(123,47,255,0.25)";
  roundRect(ctx, W / 2 - 90, 90, 180, 26, 13);
  ctx.fill();
  ctx.strokeStyle = "rgba(123,47,255,0.6)";
  ctx.lineWidth = 1;
  roundRect(ctx, W / 2 - 90, 90, 180, 26, 13);
  ctx.stroke();
  ctx.fillStyle = "#c084fc";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(session, W / 2, 108);
  ctx.restore();

  // ── Divider ──
  ctx.strokeStyle = "rgba(0,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 130); ctx.lineTo(W - 50, 130);
  ctx.stroke();

  // ── Avatar positions ──
  const avatarY   = 215;  // center Y of avatars
  const avatarR   = 75;   // radius
  const memberX   = 200;
  const adderX    = W - 200;

  // ── Load avatars ──
  const memberAvatarURL = `https://graph.facebook.com/${memberUID}/picture?width=256&height=256&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const adderAvatarURL  = `https://graph.facebook.com/${adderUID}/picture?width=256&height=256&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const [memberImg, adderImg] = await Promise.all([
    loadImage(memberAvatarURL).catch(() => null),
    loadImage(adderAvatarURL).catch(() => null)
  ]);

  // ── Draw avatar function ──
  const drawAvatar = (img, cx, cy, r, glowColor, label, sublabel) => {
    // Glow ring
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 30;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Outer ring
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Clip + draw avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    if (img) {
      ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = "#1a1a2e";
      ctx.fill();
      ctx.fillStyle = glowColor;
      ctx.font = `bold ${r}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label.charAt(0).toUpperCase(), cx, cy);
    }
    ctx.restore();

    // Name label below avatar
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const shortLabel = label.length > 18 ? label.slice(0, 17) + "…" : label;
    ctx.fillText(shortLabel, cx, cy + r + 14);
    ctx.restore();

    // Sub-label (role)
    ctx.save();
    ctx.fillStyle = glowColor;
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(sublabel, cx, cy + r + 33);
    ctx.restore();
  };

  drawAvatar(memberImg, memberX, avatarY, avatarR, "#00ffff", memberName, "ɴᴇᴡ ᴍᴇᴍʙᴇʀ");
  drawAvatar(adderImg,  adderX,  avatarY, avatarR, "#7b2fff", adderName,  "ᴀᴅᴅᴇᴅ ʙʏ");

  // ── Center connector ──
  const midX = W / 2;

  // Dotted line between avatars
  ctx.save();
  ctx.setLineDash([6, 6]);
  const lineGrad = ctx.createLinearGradient(memberX + avatarR + 12, avatarY, adderX - avatarR - 12, avatarY);
  lineGrad.addColorStop(0, "#00ffff");
  lineGrad.addColorStop(1, "#7b2fff");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(memberX + avatarR + 12, avatarY);
  ctx.lineTo(adderX - avatarR - 12, avatarY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Center icon
  ctx.save();
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 15;
  ctx.fillStyle = "#0a0a0f";
  ctx.beginPath();
  ctx.arc(midX, avatarY, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(midX, avatarY, 28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "22px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🤝", midX, avatarY);
  ctx.restore();

  // ── Bottom divider ──
  ctx.strokeStyle = "rgba(0,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, H - 55); ctx.lineTo(W - 50, H - 55);
  ctx.stroke();

  // ── Footer ──
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("💫  Enjoy Your Stay Here  •  TAMIM BOT", W / 2, H - 32);
  ctx.restore();

  // ── Bottom accent bar ──
  const botBar = ctx.createLinearGradient(0, 0, W, 0);
  botBar.addColorStop(0,   "transparent");
  botBar.addColorStop(0.3, "#7b2fff");
  botBar.addColorStop(0.7, "#00ffff");
  botBar.addColorStop(1,   "transparent");
  ctx.fillStyle = botBar;
  ctx.fillRect(30, H - 30, W - 60, 2);

  // Return as stream
  const tmpPath = path.join("/tmp", `welcome_${Date.now()}.png`);
  const buffer  = canvas.toBuffer("image/png");
  fs.writeFileSync(tmpPath, buffer);
  const stream  = fs.createReadStream(tmpPath);
  stream.on("close", () => { try { fs.unlinkSync(tmpPath); } catch {} });
  return stream;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   Rounded Rect Helper
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   Unicode Bold Converter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function B(text) {
  const m = {
    a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",
    h:"𝐡",i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",
    o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"𝐮",
    v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
    A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",
    H:"𝐇",I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",
    O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",
    V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
    0:"𝟎",1:"𝟏",2:"𝟐",3:"𝟑",4:"𝟒",
    5:"𝟓",6:"𝟔",7:"𝟕",8:"𝟖",9:"𝟗"
  };
  return String(text).split("").map(c => m[c] || c).join("");
															 }
