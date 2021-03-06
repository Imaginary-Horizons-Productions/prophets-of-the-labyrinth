const Equipment = require('../../Classes/Equipment.js');
const { dealDamage, addModifier } = require('../combatantDAO.js');

module.exports = new Equipment("Bow", 1, "*Strike a foe for @{damage} @{element} damage (+@{speedBonus} speed bonus)*\nCritical Hit: Damage x@{critBonus}", "Wind", effect, ["Evasive Bow", "Hunter's Bow", "Mercurial Bow"])
	.setCategory("Weapon")
	.setTargetingTags({ target: "single", team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }])
	.setCost(200)
	.setUses(10)
	.setDamage(75)
	.setSpeedBonus(10);

function effect(target, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger], damage, critBonus } = module.exports;
	if (user.element === element) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		damage *= critBonus;
	}
	return dealDamage(target, user, damage, false, element, adventure);
}
