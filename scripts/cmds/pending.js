const fs = require("fs");

const formatText = (text) => {
  const map = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣',
    'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭',
    'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉',
    'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓',
    'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝒁',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(char => map[char] || char).join('');
};

module.exports = {
  config: {
    name: "pending",
    aliases: ["pen", "pend", "approve"],
    version: "2.5",
    author: "♡ SAIF ♡",
    countDown: 5,
    role: 2,
    shortDescription: formatText("Manage pending requests Baby"),
    longDescription: formatText("System to approve or decline group/user join requests Baby"),
    category: "admin"
  },

  onReply: async function ({ message, api, event, Reply }) {
    const { author, pending, messageID } = Reply;
    if (String(event.senderID) !== String(author)) return;

    const { body, threadID } = event;

    // ── Cancel ──────────────────────────────────────────────
    if (body.trim().toLowerCase() === "c") {
      return api.editMessage(
        formatText("❌ Operation cancelled successfully Baby 🐇"),
        messageID
      );
    }

    // ── Parse indexes ────────────────────────────────────────
    const indexes = body.split(/\s+/).map(Number).filter(n => !isNaN(n));

    if (indexes.length === 0) {
      return api.editMessage(
        formatText("⚠ Invalid selection! Please provide a valid number from the list Baby 🦋"),
        messageID
      );
    }

    // ── Processing edit ──────────────────────────────────────
    await api.editMessage(
      formatText("⏳ Processing approvals... Please wait a moment Baby 🐇"),
      messageID
    );

    let successCount = 0;
    let failCount = 0;

    for (const idx of indexes) {
      if (idx <= 0 || idx > pending.length) continue;
      const target = pending[idx - 1];
      try {
        await api.sendMessage(
          formatText("✅ Request Approved! You can now use the bot services Baby 🐇💌\n✨ Type /help to see commands! 🦄"),
          target.threadID
        );
        await api.changeNickname(
          formatText(`${global.GoatBot.config.nickNameBot || "BOT SYSTEM"}`),
          target.threadID,
          api.getCurrentUserID()
        );
        successCount++;
      } catch (_) {
        failCount++;
      }
    }

    const remaining = pending.filter((_, i) => !indexes.includes(i + 1));

    // ── Final edit on list msg ───────────────────────────────
    return api.editMessage(
      formatText(`🎉 Task Completed Baby!\n\n✅ Approved: ${successCount}\n❌ Failed: ${failCount}\n📂 Remaining in queue: ${remaining.length} Baby 💖`),
      messageID
    );
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const adminBot = global.GoatBot.config.adminBot || [];

    // sender এর msg এ reply করে একটাই msg send
    const sent = await api.sendMessage(
      formatText("⏳ Fetching pending requests... Baby 🐇"),
      threadID,
      messageID
    );
    const mid = sent.messageID;

    // ── Access check ─────────────────────────────────────────
    if (!adminBot.includes(senderID)) {
      return api.editMessage(
        formatText("⚠ Access Denied! This command is reserved for Bot Administrators only Baby 🐇"),
        mid
      );
    }

    try {
      const spam    = (await api.getThreadList(100, null, ["OTHER"]))   || [];
      const pending = (await api.getThreadList(100, null, ["PENDING"])) || [];
      const allList = [...spam, ...pending];

      // ── Empty queue ──────────────────────────────────────
      if (allList.length === 0) {
        return api.editMessage(
          formatText("📭 PENDING QUEUE EMPTY\n\n") +
          formatText("There are no pending requests to review right now Baby! 🥹\n") +
          formatText("Your system is running clean! 🎀"),
          mid
        );
      }

      // ── Build list ───────────────────────────────────────
      let msg = formatText("📑 PENDING REQUEST LIST Baby\n") + "━━━━━━━━━━━━━━━━━━\n\n";

      for (let i = 0; i < allList.length; i++) {
        const item = allList[i];
        const name = item.name || (await usersData.getName(item.threadID)) || "Unknown Entity";
        const type = item.isGroup ? "👥 [Group]" : "👤 [Private]";
        msg += `${i + 1}. ${type} » ${name}\n🆔 ${item.threadID}\n\n`;
      }

      msg += "━━━━━━━━━━━━━━━━━━\n";
      msg += formatText(`🎀 Total Requests: ${allList.length}\n`);
      msg += formatText(`✨ Reply with the index number to approve Baby 🐇\n`);
      msg += formatText(`❌ Reply 'c' to cancel this session Baby 💌`);

      // ── Edit with final list ─────────────────────────────
      await api.editMessage(msg, mid);

      global.GoatBot.onReply.set(mid, {
        commandName: this.config.name,
        messageID: mid,
        author: senderID,
        pending: allList,
      });

    } catch (error) {
      return api.editMessage(
        formatText("❌ Critical system error while fetching pending list Baby!"),
        mid
      );
    }
  },
};
