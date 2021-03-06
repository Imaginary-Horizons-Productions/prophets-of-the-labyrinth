const Button = require('../../Classes/Button.js');
const { ordinalSuffixEN } = require('../../helpers.js');
const { getAdventure, setAdventure, updateRoomHeader } = require('../adventureDAO.js');
const { editButtons } = require("../roomDAO.js");
const { prerollBoss } = require('../Rooms/_roomDictionary.js');

const id = "buyscouting";
module.exports = new Button(id, (interaction, [type]) => {
	// Set flags for party scouting and remove gold from party inventory
	let adventure = getAdventure(interaction.channel.id);
	let user = adventure.delvers.find(delver => delver.id == interaction.user.id);
	if (user) {
		if (type === "Final Battle") {
			const { cost } = adventure.room.resources["bossScouting"];
			adventure.gold -= cost;
			adventure.scouting.finalBoss = true;
			adventure.updateArtifactStat("Amethyst Spyglass", "Gold Saved", 150 - cost);
			interaction.message.edit({ components: editButtons(interaction.message.components, { [interaction.customId]: { preventUse: true, label: `Final Battle: ${adventure.finalBoss}`, emoji: "✔️" } }) });
			interaction.reply(`The merchant reveals that final battle for this adventure will be **${adventure.finalBoss}** (you can review this with \`/party-stats\`).`);
		} else {
			const { cost } = adventure.room.resources["guardScouting"];
			adventure.gold -= cost;
			adventure.updateArtifactStat("Amethyst Spyglass", "Gold Saved", 100 - cost);
			interaction.message.edit({ components: editButtons(interaction.message.components, { [interaction.customId]: { preventUse: adventure.gold < Number(cost), label: `${cost}g: Scout the ${ordinalSuffixEN(adventure.scouting.artifactGuardians + 2)} Artifact Guardian` } }) });
			interaction.reply(`The merchant reveals that the ${ordinalSuffixEN(adventure.scouting.artifactGuardians + 1)} artifact guardian for this adventure will be **${adventure.artifactGuardians[adventure.scouting.artifactGuardians]}** (you can review this with \`/party-stats\`).`);
			adventure.scouting.artifactGuardians++;
			while (adventure.artifactGuardians.length <= adventure.scouting.artifactGuardians) {
				prerollBoss("Artifact Guardian", adventure);
			}
		}
		updateRoomHeader(adventure, interaction.message);
		setAdventure(adventure);
	} else {
		interaction.reply({ content: "Plesae buy scouting in adventures you've joined.", ephemeral: true });
	}
});
