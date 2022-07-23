const ConsumableTemplate = require("../../Classes/ConsumableTemplate.js");
const { addModifier, getFullName } = require("../combatantDAO.js");

module.exports = new ConsumableTemplate("Quick Pepper", "Grants the user 3 Quicken", selectTargets, effect)
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
	// +3 Quicken
	addModifier(user, { name: "Quicken", stacks: 3 });
	return `${getFullName(user, adventure.room.enemyTitles)} gains Quicken.`;
}
