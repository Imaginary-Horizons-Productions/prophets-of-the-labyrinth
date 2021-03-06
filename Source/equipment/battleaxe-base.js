const Equipment = require('../../Classes/Equipment.js');
const { addModifier, dealDamage } = require('../combatantDAO.js');

module.exports = new Equipment("Battleaxe", 1, "Strike a foe for @{damage} (+@{bonusDamage} if you have 0 block) @{element} damage*\nCritical Hit: Damage x@{critBonus}", "Fire", effect, ["Thick Battleaxe", "Thirsting Battleaxe"])
	.setCategory("Weapon")
	.setTargetingTags({ target: "single", team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }])
	.setCost(200)
	.setUses(10)
	.setDamage(75)
	.setBonusDamage(75);

function effect(target, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger], damage, bonusDamage, critBonus } = module.exports;
	if (user.block === 0) {
		damage += bonusDamage;
	}
	if (user.element === element) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		damage *= critBonus;
	}
	return dealDamage(target, user, damage, false, element, adventure);
}
