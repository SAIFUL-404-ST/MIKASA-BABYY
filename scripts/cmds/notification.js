const { getStreamsFromAttachment } = global.utils;

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify", "noti"],
		version: "3.2",
		author: "NTKhang (Styled by Saif)",
		countDown: 5,
		role: 2,
		category: "owner",
		envConfig: { delayPerGroup: 250 }
	},

	langs: {
		en: {
			missingMessage: "⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞",
			sendingNotification: "📡 𝐒𝐞𝐧𝐝𝐢𝐧𝐠 𝐭𝐨 %1 𝐠𝐫𝐨𝐮𝐩𝐬...",
			sentNotification: "✅ 𝐒𝐞𝐧𝐭 𝐭𝐨 %1 𝐠𝐫𝐨𝐮𝐩𝐬"
		}
	},

	onStart: async function({ message, api, event, args, envCommands, threadsData, usersData, getLang }) {
		const { delayPerGroup } = envCommands.notification;

		const replied = event.messageReply;
		const hasText = args[0];
		const hasReply = replied && (replied.body || replied.attachments?.length);

		if (!hasText && !hasReply) return message.reply(getLang("missingMessage"));

		let msgBody = "";
		if (hasText) msgBody = args.join(" ");
		else if (replied?.body) msgBody = replied.body;

		const allAttachments = [
			...(event.attachments || []),
			...(replied?.attachments || [])
		].filter(i => ["photo", "png", "animated_image", "video", "audio"].includes(i.type));

		const now = new Date();
		const timeStr = now.toLocaleString("en-US", {
			month: "2-digit",
			day: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true
		});

		const allThreadID = (await threadsData.getAll()).filter(
			t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
		);

		const formSend = {
			body:
`╔═════════════════════╗
   🌸 𝐌𝐈𝐊𝐀𝐒𝐀 𝐁𝐀𝐁𝐘 𝐍𝐎𝐓𝐈𝐂𝐄
╚══════════════════════╝

📌 𝐌𝐞𝐬𝐬𝐚𝐠𝐞:
${msgBody}

🕐 𝐓𝐢𝐦𝐞: ${timeStr}
📊 𝐆𝐫𝐨𝐮𝐩𝐬: ${allThreadID.length}

━━━━━━━━━━━━━━━━━━━━━━
    💗  𝐌𝐢𝐤𝐚𝐬𝐚 𝐁𝐚𝐛𝐲`,
			attachment: await getStreamsFromAttachment(allAttachments)
		};

		message.reply(getLang("sendingNotification").replace("%1", allThreadID.length));

		let success = 0;
		for (const thread of allThreadID) {
			try {
				const sent = await api.sendMessage(formSend, thread.threadID);

				// Reply handler register — প্রতিটা group-এর জন্য
				global.GoatBot.onReply.set(sent.messageID, {
					commandName: "notification",
					messageID: sent.messageID,
					originThreadID: event.threadID, // admin যে group থেকে পাঠিয়েছে
					originGroupName: (await threadsData.get(thread.threadID))?.threadName || thread.threadID
				});

				success++;
				await new Promise(r => setTimeout(r, delayPerGroup));
			} catch {}
		}

		message.reply(getLang("sentNotification").replace("%1", success));
	},

	onReply: async function({ api, event, Reply, usersData, threadsData }) {
		// যে group থেকে reply এসেছে তার নাম
		const replyGroupName = (await threadsData.get(event.threadID))?.threadName || "Unknown Group";
		// যে user reply করেছে তার নাম
		const replierName = await usersData.getName(event.senderID);

		const replyAttachments = (event.attachments || []).filter(
			i => ["photo", "png", "animated_image", "video", "audio"].includes(i.type)
		);

		const forwardBody =
`💬 𝐍𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐑𝐞𝐩𝐥𝐲

🏘️ 𝐆𝐫𝐨𝐮𝐩: ${replyGroupName}
👤 𝐔𝐬𝐞𝐫: ${replierName}

💭 ${event.body || "(attachment only)"}`;

		await api.sendMessage(
			{
				body: forwardBody,
				attachment: await global.utils.getStreamsFromAttachment(replyAttachments)
			},
			Reply.originThreadID
		);
	}
};
