const { getStreamsFromAttachment } = global.utils;

function formatTime(timestamp) {
  try {
    return new Date(Number(timestamp)).toLocaleString("en-GB", {
      timeZone: "Asia/Dhaka",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (_) {
    return "Unknown";
  }
}

async function react(api, emoji, messageID) {
  try {
    await api.setMessageReaction(emoji, messageID, () => {}, true);
  } catch (_) {}
}

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "2.4",
    author: "NTKhang",
    countDown: 5,
    role: 0, // ✅ 0 = everyone (replies will work for all)
    description: {
      vi: "Gửi thông báo từ admin đến all box",
      en: "Send notification from admin to all box"
    },
    category: "owner",
    guide: {
      en: "{pn} <message>"
    },
    envConfig: {
      delayPer𝐆𝐫𝐨𝐮𝐩: 250
    }
  },

  langs: {
    en: {
      missingMessage: "⚠️ Please enter a message",
      adminOnly: "❌ Only bot admins can send notifications.",
      notificationBody:
        "╭─────────────────╮\n   🌸 MIKASA  BABY 🌸\n   📢 NOTICE FROM ADMIN\n╰─────────────────╯\n\n%1\n\n─────────────────────\n↩️ Reply to this message to send a message directly to admin",
      replyFromGroup:
        "╭─────────────────╮\n  📥 NEW  REPLY\n╰─────────────────╯\n\n👤 From: %1\n🆔 UID: %2\n👥 Group: %3\n📌 TID: %4\n🕐 Time: %5\n\n💬 Message:\n%6\n\n📎 Attachments: %7\n\n─────────────────────\n↩️ Reply to this message to respond back to %1",
      replyFromAdmin:
        "╭─────────────────╮\n  📤 ADMIN  REPLIED\n╰─────────────────╯\n\n👤 To: %1\n🕐 Time: %2\n\n💬 Message:\n%3",
      notAdmin: "❌ Only bot admins can reply here"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, getLang }) {
    // ✅ শুধু বট অ্যাডমিনরাই নোটিফিকেশন পাঠাতে পারবে
    const botAdmins = global.GoatBot.config?.adminBot || [];
    if (!botAdmins.includes(event.senderID)) {
      return message.reply(getLang("adminOnly"));
    }

    const { delayPerGroup } = envCommands[commandName];
    if (!args[0])
      return message.reply(getLang("missingMessage"));

    const formSend = {
      body: getLang("notificationBody", args.join(" ")),
      attachment: await getStreamsFromAttachment(
        [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
      )
    };

    const botID = api.getCurrentUserID();
    const threadList = await api.getThreadList(200, null, ["INBOX"]);
    const allThreadID = threadList
      .filter(t => t.isGroup && t.participantIDs?.includes(botID))
      .map(t => t.threadID);

    const adminThreadID = event.threadID;

    for (const tid of allThreadID) {
      try {
        const sentMsg = await api.sendMessage(formSend, tid);

        global.GoatBot.onReply.set(sentMsg.messageID, {
          commandName: "notification",
          messageID: sentMsg.messageID,
          adminThreadID: adminThreadID,
          fromThreadID: tid,
          type: "fromGroup"
        });
      } catch (_) {
        // ignore single group failure, continue with rest
      }
      await new Promise(resolve => setTimeout(resolve, delayPerGroup));
    }

    // ✅ broadcast শেষ হলে admin এর command message এ reaction দিয়ে confirm
    await react(api, "✅", event.messageID);
  },

  onReply: async function ({ api, event, Reply, usersData, threadsData, getLang }) {
    if (event.senderID === api.getCurrentUserID()) return;

    if (Reply.type === "fromGroup") {
      try {
        const senderName = await usersData.getName(event.senderID);

        let threadName = Reply.fromThreadID;
        try {
          const threadInfo = await threadsData.get(Reply.fromThreadID);
          threadName = threadInfo?.threadName || Reply.fromThreadID;
        } catch (_) {}

        const attachmentList = (event.attachments || []).filter(i =>
          ["photo", "png", "animated_image", "video", "audio"].includes(i.type)
        );
        const attachment = await getStreamsFromAttachment(attachmentList);

        const attachmentInfo = attachmentList.length > 0
          ? `${attachmentList.length} file(s) [${attachmentList.map(a => a.type).join(", ")}]`
          : "None";

        const adminMsg = await api.sendMessage(
          {
            body: getLang("replyFromGroup")
              .replace("%1", senderName)
              .replace("%2", event.senderID)
              .replace("%3", threadName)
              .replace("%4", Reply.fromThreadID)
              .replace("%5", formatTime(event.timestamp))
              .replace("%6", event.body || "(no text)")
              .replace("%7", attachmentInfo)
              .replace("%1", senderName),
            attachment: attachment?.length ? attachment : undefined
          },
          Reply.adminThreadID
        );

        // 👉 admin এর পরের reply যেন এই user এর exact message কে quote করে যায়
        global.GoatBot.onReply.set(adminMsg.messageID, {
          commandName: "notification",
          messageID: adminMsg.messageID,
          adminThreadID: Reply.adminThreadID,
          fromThreadID: Reply.fromThreadID,
          targetUserID: event.senderID,
          targetName: senderName,
          userReplyMessageID: event.messageID,
          type: "fromAdmin"
        });

        global.GoatBot.onReply.set(Reply.messageID, {
          ...Reply,
          type: "fromGroup"
        });

        // ✅ user এর message এ success reaction
        await react(api, "✅", event.messageID);
      } catch (_) {
        // ❌ failed reaction
        await react(api, "❌", event.messageID);
      }
    }

    else if (Reply.type === "fromAdmin") {
      const botAdmins = global.GoatBot.config?.adminBot || [];
      if (!botAdmins.includes(event.senderID)) {
        return api.sendMessage(getLang("notAdmin"), event.threadID);
      }

      try {
        const attachmentList = (event.attachments || []).filter(i =>
          ["photo", "png", "animated_image", "video", "audio"].includes(i.type)
        );
        const attachment = await getStreamsFromAttachment(attachmentList);

        const bodyMsg = {
          body: getLang("replyFromAdmin")
            .replace("%1", Reply.targetName || "User")
            .replace("%2", formatTime(event.timestamp))
            .replace("%3", event.body || "(no text)"),
          attachment: attachment?.length ? attachment : undefined,
          mentions: [{ tag: "", id: Reply.targetUserID }]
        };

        // 👉 user এর original reply message এর উপর "reply" (quote) হিসেবে যাবে
        const sendArgs = Reply.userReplyMessageID
          ? [bodyMsg, Reply.fromThreadID, Reply.userReplyMessageID]
          : [bodyMsg, Reply.fromThreadID];

        const adminMsg = await api.sendMessage(...sendArgs);

        global.GoatBot.onReply.set(adminMsg.messageID, {
          commandName: "notification",
          messageID: adminMsg.messageID,
          adminThreadID: Reply.adminThreadID,
          fromThreadID: Reply.fromThreadID,
          type: "fromGroup"
        });

        global.GoatBot.onReply.set(Reply.messageID, {
          ...Reply,
          type: "fromAdmin"
        });

        // ✅ admin এর message এ success reaction
        await react(api, "✅", event.messageID);
      } catch (_) {
        // ❌ failed reaction
        await react(api, "❌", event.messageID);
      }
    }
  }
};
