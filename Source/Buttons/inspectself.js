const Button = require('../../Classes/Button.js');
const { getAdventure } = require('../adventureDAO.js');
const { delverStatsPayload } = require('../equipmentDAO.js');

const id = "inspectself";
module.exports = new Button(id, (interaction, args) => {
	// Provide the player their combat stats
	const adventure = getAdventure(interaction.channel.id);
	if (adventure) {
		let delver = adventure.delvers.find(delver => delver.id === interaction.user.id);
		if (delver) {
			interaction.reply(delverStatsPayload(delver, adventure.getEquipmentCapacity()))
				.catch(console.error);
		} else {
			interaction.reply({ content: "You are not a part of this adventure.", ephemeral: true });
		}
	} else {
		interaction.reply({ content: "This channel doesn't appear to be an adventure's thread.", ephemeral: true });
	}
});
