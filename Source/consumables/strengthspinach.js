const ConsumableTemplate = require("../../Classes/ConsumableTemplate.js");
const { addModifier, getFullName } = require("../combatantDAO.js");

module.exports = new ConsumableTemplate("Strength Spinach", "Grants the user 50 Power Up", selectTargets, effect)
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
	// +50 Power Up
	addModifier(user, { name: "Power Up", stacks: 50 });
	return `${getFullName(user, adventure.room.enemyTitles)} gains Power Up.`;
}
