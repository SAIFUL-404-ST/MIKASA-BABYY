function sleep(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = {
	config: {
		name: "filteruser",
		version: "1.7",
		author: "NTKhang (Fixed)",
		countDown: 5,
		role: 1,
		description: {
			en: "Filter group members by message count or locked account"
		},
		category: "box chat",
		guide: {
			en: "{pn} [number | die]"
		}
	},

	langs: {
		en: {
			needAdmin: "⚠️ | Please make the bot a group admin first.",
			confirm: "⚠️ | Remove members with less than %1 messages?\nReact to this message to confirm.",
			kickByBlock: "✅ | Removed %1 locked accounts.",
			kickByMsg: "✅ | Removed %1 members with less than %2 messages.",
			kickError: "❌ | Couldn't remove %1 members:\n%2",
			noBlock: "✅ | No locked accounts found.",
			noMsg: "✅ | No members found with less than %1 messages."
		}
	},

	onStart: async function ({ api, args, threadsData, message, event, commandName, getLang }) {

		const threadInfo = await api.getThreadInfo(event.threadID);
		const botID = api.getCurrentUserID();

		if (!threadInfo.adminIDs.some(item => String(item.id) === String(botID)))
			return message.reply(getLang("needAdmin"));

		if (!isNaN(args[0])) {
			message.reply(getLang("confirm", args[0]), (err, info) => {
				if (err) return;
				global.GoatBot.onReaction.set(info.messageID, {
					author: event.senderID,
					messageID: info.messageID,
					minimum: Number(args[0]),
					commandName
				});
			});
		}
		else if (args[0] == "die") {

			const membersBlocked = threadInfo.userInfo.filter(user => user.type !== "User");

			const success = [];
			const errors = [];

			for (const user of membersBlocked) {
				if (!threadInfo.adminIDs.some(item => String(item.id) === String(user.id))) {
					try {
						await api.removeUserFromGroup(user.id, event.threadID);
						success.push(user.id);
					}
					catch {
						errors.push(user.name);
					}
					await sleep(700);
				}
			}

			let msg = "";

			if (success.length)
				msg += getLang("kickByBlock", success.length) + "\n";

			if (errors.length)
				msg += getLang("kickError", errors.length, errors.join("\n")) + "\n";

			if (!msg)
				msg = getLang("noBlock");

			message.reply(msg);
		}
		else {
			message.SyntaxError();
		}
	},

	onReaction: async function ({ api, Reaction, event, threadsData, message, getLang }) {

		if (event.userID != Reaction.author)
			return;

		const threadInfo = await api.getThreadInfo(event.threadID);
		const threadData = await threadsData.get(event.threadID);

		const botID = api.getCurrentUserID();
		const minimum = Reaction.minimum || 1;

		const members = threadData.members.filter(member =>
			member.inGroup &&
			member.count < minimum &&
			String(member.userID) !== String(botID) &&
			!threadInfo.adminIDs.some(item => String(item.id) === String(member.userID))
		);

		const success = [];
		const errors = [];

		for (const member of members) {
			try {
				await api.removeUserFromGroup(member.userID, event.threadID);
				success.push(member.userID);
			}
			catch {
				errors.push(member.name);
			}
			await sleep(700);
		}

		let msg = "";

		if (success.length)
			msg += getLang("kickByMsg", success.length, minimum) + "\n";

		if (errors.length)
			msg += getLang("kickError", errors.length, errors.join("\n")) + "\n";

		if (!msg)
			msg = getLang("noMsg", minimum);

		message.reply(msg);
	}
};
