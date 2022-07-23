const ConsumableTemplate = require("../../Classes/ConsumableTemplate.js");
const { dealDamage } = require("../combatantDAO.js");

module.exports = new ConsumableTemplate("Explosion Potion", "Deal 75 damage to all enemies", selectTargets, effect)
	.setElement("Untyped")
	.setTargetTags("all", "enemy")
	.setFlavorText(["*Additional Notes*", "*Not to be confused with __Fiery Potion__. DO NOT apply to self.*"]);

function selectTargets(userIndex, adventure) {
	// all enemies
	return adventure.room.enemies.reduce((targets, enemy, index) => targets.concat([["enemy", index]]), []);
}

function effect(target, user, isCrit, adventure) {
	// 75 damage
	return dealDamage(target, user, 75, false, "Untyped", adventure);
}
