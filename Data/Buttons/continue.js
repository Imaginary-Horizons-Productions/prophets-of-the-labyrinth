const { nextRoom, getAdventure } = require('../adventureDAO.js');
const Button = require('../../Classes/Button.js');

module.exports = new Button("continue");

module.exports.execute = (interaction, args) => {
	// Generate the next room of an adventure
	let adventure = getAdventure(interaction.channel.id);
	interaction.message.edit({ components: [] })
		.catch(console.error);
	interaction.reply({ content: `The party moves on.`, ephemeral: true });
	nextRoom(adventure, interaction.channel);
}
