//#region Imports
const { Client } = require("discord.js");
const { readFile, writeFile } = require("fs").promises;
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const GuildProfile = require("./Classes/GuildProfile");
const versionData = require('./Config/versionData.json');

const { SAFE_DELIMITER } = require('./helpers.js');
const { loadAdventures } = require("./Source/adventureDAO.js");
const { loadGuilds, setGuild } = require("./Source/guildDAO.js");
const { loadPlayers } = require("./Source/playerDAO.js");
const { getCommand, slashData } = require(`./Source/Commands/_commandDictionary.js`);
const { callSelect } = require("./Source/Selects/_selectDictionary.js");
const { callButton } = require("./Source/Buttons/_buttonDictionary.js");
const { getPremiumUsers, getVersionEmbed } = require("./helpers.js");
//#endregion

//#region Executing Code
const client = new Client({
	retryLimit: 5,
	presence: {
		activities: [{
			name: "/manual",
			type: "LISTENING"
		}]
	},
	intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"]
});

(async () => {
	try {
		console.log(await loadGuilds());
		console.log(await loadAdventures());
		console.log(await loadPlayers());
		client.login(require("./Config/auth.json").token);
	} catch (rejectMessage) {
		console.error(rejectMessage);
	}
})()
//#endregion

//#region Event Handlers
client.on("ready", () => {
	console.log(`Connected as ${client.user.tag}`);

	// Post version notes
	if (versionData.announcementsChannelId) {
		readFile('./ChangeLog.md', { encoding: 'utf8' }).then(data => {
			let [currentFull, currentMajor, currentMinor, currentPatch] = data.match(/(\d+)\.(\d+)\.(\d+)/);
			let [_lastFull, lastMajor, lastMinor, lastPatch] = versionData.lastPostedVersion.match(/(\d+)\.(\d+)\.(\d+)/);

			if (currentMajor <= lastMajor) {
				if (currentMinor <= lastMinor) {
					if (currentPatch <= lastPatch) {
						return;
					}
				}
			}

			getVersionEmbed(client.user.displayAvatarURL()).then(embed => {
				client.guilds.fetch(versionData.guildId).then(guild => {
					guild.channels.fetch(versionData.announcementsChannelId).then(annoucnementsChannel => {
						annoucnementsChannel.send({ embeds: [embed] }).then(message => {
							message.crosspost();
							versionData.lastPostedVersion = currentFull;
							writeFile('./Config/versionData.json', JSON.stringify(versionData), "utf-8");
						});
					})
				})
			}).catch(console.error);
		});
	}

	// Upload slash commands globally
	(async () => {
		try {
			await new REST({ version: 9 }).setToken(require("./Config/auth.json").token).put(
				Routes.applicationCommands(client.user.id),
				{ body: slashData },
			);
		} catch (error) {
			console.error(error);
		}
	})();
})

client.on("interactionCreate", interaction => {
	if (interaction.isCommand()) {
		const { premiumCommand, managerCommand, execute } = getCommand(interaction.commandName);
		if (!premiumCommand || !getPremiumUsers().includes(interaction.user.id)) {
			if (!managerCommand || !interaction.member?.manageable) {
				execute(interaction);
			} else {
				interaction.reply({ content: `The \`/${interaction.commandName}\` command is restricted to bot managers (users with permissions above the bot).`, ephemeral: true })
					.catch(console.error);
			}
		} else {
			interaction.reply({ content: `The \`/${interaction.commandName}\` command is a premium command. Use \`/support\` for more information.`, ephemeral: true })
				.catch(console.error);
		}
	} else {
		const [mainId, ...args] = interaction.customId.split(SAFE_DELIMITER);
		if (interaction.isButton()) {
			callButton(mainId, interaction, args);
		} else if (interaction.isSelectMenu()) {
			callSelect(mainId, interaction, args);
		}
	}
})

client.on("guildCreate", guild => {
	setGuild(new GuildProfile(guild.id));
})
//#endregion
