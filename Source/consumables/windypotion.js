const ConsumableTemplate = require("../../Classes/ConsumableTemplate.js");
const { addModifier, getFullName } = require("../combatantDAO.js");
const { getEmoji } = require("../elementHelpers.js");

module.exports = new ConsumableTemplate("Windy Potion", "Grants the user 1 Wind Absorb", selectTargets, effect)
	.setElement("Untyped")
	.setTargetTags("self", "delver")
	.setFlavorText([]);

function selectTargets(userIndex, adventure) {
	// self
	const team = "self";
	const index = userIndex;
	return [[team, index]];
}

function effect(target, user, isCrit, adventure) {
	// +1 Wind Absorb
	addModifier(user, { name: "Wind Absorb", stacks: 1 });
	return `${getFullName(user, adventure.room.enemyTitles)} now absorbs ${getEmoji("Wind")} damage.`;
}
