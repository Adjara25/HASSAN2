const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.7",
		author: "NTKhang",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: "𝐬𝐚𝐥𝐮𝐭 𝐦𝐨𝐢 𝐣𝐞 𝐬𝐮𝐢𝐬 𝐯𝐨𝐭𝐫𝐞 𝐧𝐨𝐮𝐯𝐞𝐥𝐥𝐞 𝐚𝐬𝐬𝐢𝐬𝐭𝐚𝐧𝐭 𝐯𝐢𝐫𝐭𝐮𝐞𝐥, 𝐬𝐢 𝐯𝐨𝐮𝐬 𝐚𝐯𝐞𝐳 𝐝𝐞𝐬 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧𝐬 𝐯𝐨𝐮𝐬 𝐩𝐨𝐮𝐯𝐞𝐳 𝐦𝐞 𝐥𝐞𝐬 𝐩𝐨𝐬𝐞𝐫 𝐞𝐭 𝗠𝗘𝗥𝗖𝗜 𝗣𝗢𝗨𝗥 𝗟'𝗜𝗡𝗩𝗜𝗧𝗔𝗧𝗜𝗢𝗡  \n𝗣𝗥𝗘𝗙𝗜𝗫 ☞ %1\n𝐭𝐮 𝐯𝐞𝐮𝐱 𝐬𝐚𝐯𝐨𝐢𝐫 𝐩𝐥𝐮𝐬 𝐬𝐮𝐫 𝐦𝐨𝐧 𝐩𝐨𝐭𝐞𝐧𝐭𝐢𝐞𝐥 𝐞́𝐜𝐫𝐢𝐭 𝐣𝐮𝐬𝐭𝐞 ☞ %1help",
			multiple1: "",
			multiple2: "",
			defaultWelcomeMessage: `𝐬𝐚𝐥𝐮𝐭  {userName}.\n☞𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗨𝗘  𝐝𝐚𝐧𝐬 𝐥𝐞 𝐠𝐫𝐨𝐮𝐩𝐞 {boxName}\n𝐞𝐭 𝐣'𝐞𝐬𝐩𝐞̀𝐫𝐞 𝐪𝐮𝐞 𝐯𝐨𝐮𝐬 𝐚𝐥𝐥𝐞𝐳 𝐩𝐚𝐬𝐬𝐞𝐫 𝐮𝐧𝐞 𝐚𝐠𝐫𝐞́𝐚𝐛𝐥𝐞 𝐬𝐨𝐢𝐫𝐞́𝐞 𝐞𝐧 𝐩𝐫𝐞́𝐬𝐞𝐧𝐜𝐞 𝐝𝐞𝐬 𝐦𝐞𝐦𝐛𝐫𝐞𝐬 𝐝𝐞 𝐜𝐞 𝐠𝐫𝐨𝐮𝐩𝐞 🎶`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				// push new member to array
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				// if timeout is set, clear it
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// set new timeout
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					// {userName}:   name of new member
					// {multiple}:
					// {boxName}:    name of group
					// {threadName}: name of group
					// {session}:    session of day
					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};


											      
