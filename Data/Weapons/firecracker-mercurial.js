const Weapon = require('../../Classes/Weapon.js');
const { dealDamage, addModifier } = require('../combatantDAO.js');

module.exports = new Weapon("Mercurial Firecracker", 2, "*Strike 3 random foes for @{damage} damage matching the user's element*\nCritical Hit: Damage x@{critMultiplier}", "Fire", effect, ["Double Firecracker", "Toxic Firecracker"])
	.setTargetingTags({ target: "random-3", team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }])
	.setCost(350)
	.setUses(5)
	.setCritMultiplier(2)
	.setDamage(50);

function effect(target, user, isCrit, adventure) {
	let { element: weaponElement, modifiers: [elementStagger], damage, critMultiplier } = module.exports;
	if (user.element === weaponElement) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		damage *= critMultiplier;
	}
	return dealDamage(target, user, damage, false, user.element, adventure);
}
