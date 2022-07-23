const ConsumableTemplate = require("../../Classes/ConsumableTemplate.js");
const { addModifier, getFullName } = require("../combatantDAO.js");

module.exports = new ConsumableTemplate("Salt of Oblivion", "Grants the user 1 Oblivious", selectTargets, effect)
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
	// +1 Oblivious
	addModifier(user, { name: "Oblivious", stacks: 1 });
	return `${getFullName(user, adventure.room.enemyTitles)} gains Oblivious.`;
}
