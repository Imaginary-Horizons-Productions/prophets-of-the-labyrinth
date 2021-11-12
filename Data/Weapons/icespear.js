const Weapon = require('../../Classes/Weapon.js');
const { dealDamage, addModifier } = require("../combatantDAO.js");

module.exports = new Weapon("icespear", "*Strike a foe for @{damage} @{element} damage*\nCritical Hit: Damage x@{critMultiplier}", "Water", effect, [])
	.setTargetingTags({ target: "single", team: "enemy" })
	.setUses(3)
	.setDamage(200);

function effect(target, user, isCrit, adventure) {
	let { element: weaponElement, damage, critMultiplier } = module.exports;
	if (user.element === weaponElement) {
		addModifier(target, "Stagger", 1);
	}
	if (isCrit) {
		damage *= critMultiplier;
	}
	return dealDamage(target, user, damage, weaponElement, adventure);
}
