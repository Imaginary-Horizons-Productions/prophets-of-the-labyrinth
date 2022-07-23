const ConsumableTemplate = require("../../Classes/ConsumableTemplate.js");
const { addModifier, getFullName } = require("../combatantDAO.js");
const { getEmoji } = require("../elementHelpers.js");

module.exports = new ConsumableTemplate("Watery Potion", "Grants the user 1 Water Absorb", selectTargets, effect)
	.setElement("Untyped")
	.setTargetTags("self", "delver")
	.setFlavorText(["*Additional Note*", "Apply directly to the forehead."]);

function selectTargets(userIndex, adventure) {
	// self
	const team = "self";
	const index = userIndex;
	return [[team, index]];
}

function effect(target, user, isCrit, adventure) {
	// +1 Water Absorb
	addModifier(user, { name: "Water Absorb", stacks: 1 });
	return `${getFullName(user, adventure.room.enemyTitles)} now absorbs ${getEmoji("Water")} damage.`;
}
