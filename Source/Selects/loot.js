const { MessageActionRow, MessageButton } = require('discord.js');
const Select = require('../../Classes/Select.js');
const { getAdventure, updateRoomHeader, setAdventure } = require('../adventureDAO.js');
const { getEquipmentProperty } = require('../equipment/_equipmentDictionary.js');
const { SAFE_DELIMITER } = require('../../helpers.js');
const { generateLootRow, generateRoutingRow } = require("../roomDAO.js");

const id = "loot";
module.exports = new Select(id, (interaction, args) => {
	// Move the selected loot into party/delver's inventory
	let adventure = getAdventure(interaction.channel.id);
	let delver = adventure.delvers.find(delver => delver.id === interaction.user.id);
	if (delver) {
		const [name, index] = interaction.values[0].split(SAFE_DELIMITER);
		let result;
		let { resourceType: type, count } = adventure.room.resources[name];
		switch (type) {
			case "gold":
				if (count && count > 0) { // Prevents double message if multiple players take near same time
					adventure.gainGold(count);
					adventure.room.resources.gold = 0;
					result = {
						content: `The party acquires ${count} gold.`
					}
				}
				break;
			case "artifact":
				if (count && count > 0) { // Prevents double message if multiple players take near same time
					adventure.gainArtifact(name, count);
					adventure.room.resources[name] = 0;
					result = {
						content: `The party acquires ${name} x ${count}.`
					}
				}
				break;
			case "equipment":
				if (count && count > 0) { // Prevents double message if multiple players take near same time
					if (delver.equipment.length < adventure.getEquipmentCapacity()) {
						delver.equipment.push({ name, uses: getEquipmentProperty(name, "maxUses") });
						adventure.room.resources[name].count = Math.max(count - 1, 0);
						result = {
							content: `${interaction.member.displayName} takes a ${name}. There are ${count - 1} remaining.`
						}
					} else {
						result = {
							content: `You can only carry ${adventure.getEquipmentCapacity()} pieces of equipment at a time. Pick one to replace with the ${name}:`,
							components: [new MessageActionRow().addComponents(...delver.equipment.map((equip, index) => {
								return new MessageButton().setCustomId(`replaceequipment${SAFE_DELIMITER}${name}${SAFE_DELIMITER}${index}${SAFE_DELIMITER}false`)
									.setLabel(`Discard ${equip.name}`)
									.setStyle("SECONDARY")
							}))],
							ephemeral: true
						};
					}
				}
				break;
		}
		if (result) {
			interaction.reply(result).then(() => {
				interaction.message.edit({ components: [generateLootRow(adventure), generateRoutingRow(adventure)] });
				updateRoomHeader(adventure, interaction.message);
				setAdventure(adventure);
			});
		} else {
			interaction.update({ content: "\u200B" });
		}
	} else {
		interaction.reply({ content: "Please take loot in adventures you've joined.", ephemeral: true });
	}
});
