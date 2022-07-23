const ConsumableTemplate = require("../../Classes/ConsumableTemplate.js");
const { addModifier, getFullName } = require("../combatantDAO.js");

module.exports = new ConsumableTemplate("Regen Root", "Grants the user 5 Regen", selectTargets, effect)
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
	// +5 Regen
	addModifier(user, { name: "Regen", stacks: 5 });
	return `${getFullName(user, adventure.room.enemyTitles)} starts regenerating.`;
}
