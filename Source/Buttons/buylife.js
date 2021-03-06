const Button = require('../../Classes/Button.js');
const { getAdventure, updateRoomHeader, setAdventure } = require('../adventureDAO.js');
const { editButtons } = require('../roomDAO.js');

const id = "buylife";
module.exports = new Button(id, (interaction, args) => {
	// -50 score, +1 life
	let adventure = getAdventure(interaction.channel.id);
	if (adventure.delvers.map(delver => delver.id).includes(interaction.user.id)) {
		adventure.lives++;
		adventure.accumulatedScore -= 50;
		updateRoomHeader(adventure, interaction.message);
		let updatedUI = editButtons(interaction.message.components, { [id]: { preventUse: true, label: "-50 score, +1 life", emoji: "✔️" } });
		interaction.update({ components: updatedUI }).then(() => {
			setAdventure(adventure);
		});
	} else {
		interaction.reply({ content: "Please buy lives in adventures you've joined.", ephemeral: true });
	}
});
