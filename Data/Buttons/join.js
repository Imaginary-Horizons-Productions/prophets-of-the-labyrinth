const Button = require('../../Classes/Button.js');
const { getAdventure, setAdventure, updateStartingMessage } = require("./../adventureDAO.js");
const Delver = require('../../Classes/Delver.js');

module.exports = new Button("join");

module.exports.execute = (interaction, [channelId]) => {
	// Give the basic rules and information about the bot
	interaction.guild.channels.fetch(channelId).then(channel => {
		var adventure = getAdventure(channelId);
		if (!adventure.delvers.some(delver => delver.id == interaction.user.id)) {
			adventure.delvers.push(new Delver(interaction.user.id, channelId));
			channel.permissionOverwrites.create(interaction.user, {
				VIEW_CHANNEL: true
			})
			adventure.lives++;
			adventure.gold += 50;
			setAdventure(adventure);
			interaction.reply({ content: `You have joined the adventure! Here's a link to the channel: ${channel}`, ephemeral: true });
			channel.send(`${interaction.member} joined the adventure.`)
				.catch(console.error);
			updateStartingMessage(interaction.message, adventure);
		} else {
			interaction.reply({ content: `You are already part of this adventure! Here's a link: ${channel}`, ephemeral: true })
				.catch(console.error);
		}
	})
}
