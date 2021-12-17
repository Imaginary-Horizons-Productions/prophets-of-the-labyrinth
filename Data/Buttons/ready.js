const { getAdventure, nextRoom } = require('../adventureDAO.js');
const Button = require('../../Classes/Button.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const { clearComponents } = require('../../helpers.js');

module.exports = new Button("ready");

module.exports.execute = (interaction, args) => {
	// Start an adventure if clicked by adventure leader
	let adventure = getAdventure(interaction.channel.id);
	if (interaction.user.id === adventure.leaderId) {
		// Clear components from recruitment, start, and deploy messages
		interaction.channel.fetchStarterMessage().then(recruitMessage => {
			recruitMessage.edit({ components: [] });
		}).catch(console.error);
		interaction.channel.messages.delete(adventure.messageIds.deploy);
		clearComponents(adventure.messageIds.start, interaction.channel.messages);

		// Post utilities message
		let utilities = [new MessageActionRow().addComponents(
			new MessageButton().setCustomId("self")
				.setLabel("Inspect self")
				.setStyle("SECONDARY"),
			new MessageButton().setCustomId("partystats")
				.setLabel("Party Stats")
				.setStyle("SECONDARY"),
			new MessageButton().setCustomId("giveup")
				.setLabel("Give Up")
				.setStyle("DANGER")
		)];
		interaction.reply({ content: `The adventure has begun! Here are some utilities for the run (remember to \`Jump\` to the message if viewing from pins).`, components: utilities, fetchReply: true }).then(message => {
			message.pin();
			adventure.setMessageId("utility", message.id);
			nextRoom("Merchant", adventure, interaction.channel); //TODONOW revert from testing settings
		});
	} else {
		interaction.reply({ content: "Please wait for the leader to start the adventure.", ephemeral: true });
	}
}
