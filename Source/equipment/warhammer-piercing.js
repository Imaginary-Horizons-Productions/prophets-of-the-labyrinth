const Equipment = require('../../Classes/Equipment.js');
const { dealDamage, addModifier } = require('../combatantDAO.js');

module.exports = new Equipment("Piercing Warhammer", 1, "*Strike a foe for @{damage} (+@{bonusDamage} if foe is already stunned) unblockable @{element} damage*\nCritical Hit: Damage x@{critBonus}", "Earth", effect, [])
	.setCategory("Weapon")
	.setTargetingTags({ target: "single", team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }])
	.setCost(350)
	.setUses(10)
	.setDamage(100)
	.setBonusDamage(75);

function effect(target, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger], damage, bonusDamage, critBonus } = module.exports;
	if (target.modifiers.Stun) {
		damage += bonusDamage;
	}
	if (user.element === element) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		damage *= critBonus;
	}
	return dealDamage(target, user, damage, true, element, adventure);
}
