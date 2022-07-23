const ConsumableTemplate = require("../../Classes/ConsumableTemplate.js");
const { addModifier, getFullName } = require("../combatantDAO.js");
const { getEmoji } = require("../elementHelpers.js");

module.exports = new ConsumableTemplate("Earthen Potion", "Grants the user 1 Earth Absorb", selectTargets, effect)
	.setElement("Untyped")
	.setTargetTags("self", "delver")
	.setFlavorText(["*Legally Required Addtional Note*", "*Not to be confused with __Explosive Potion__.*"]);

function selectTargets(userIndex, adventure) {
	// self
	const team = "self";
	const index = userIndex;
	return [[team, index]];
}

function effect(target, user, isCrit, adventure) {
	// +1 Earth Absorb
	addModifier(user, { name: "Earth Absorb", stacks: 1 });
	return `${getFullName(user, adventure.room.enemyTitles)} now absorbs ${getEmoji("Earth")} damage.`;
}
