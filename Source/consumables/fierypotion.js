const ConsumableTemplate = require("../../Classes/ConsumableTemplate.js");
const { addModifier, getFullName } = require("../combatantDAO.js");
const { getEmoji } = require("../elementHelpers.js");

module.exports = new ConsumableTemplate("Fiery Potion", "Grants the user 1 Fire Absorb", selectTargets, effect)
	.setElement("Untyped")
	.setTargetTags("self", "delver")
	.setFlavorText(["*Additional Notes*", "*Not to be confused with __Explosive Potion__. DO NOT apply to enemies.*"]);

function selectTargets(userIndex, adventure) {
	// self
	const team = "self";
	const index = userIndex;
	return [[team, index]];
}

function effect(target, user, isCrit, adventure) {
	// +1 Fire Absorb
	addModifier(user, { name: "Fire Absorb", stacks: 1 });
	return `${getFullName(user, adventure.room.enemyTitles)} now absorbs ${getEmoji("Fire")} damage.`;
}
