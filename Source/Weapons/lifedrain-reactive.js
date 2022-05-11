const Weapon = require('../../Classes/Weapon.js');
const { addModifier, dealDamage, gainHealth, calculateTotalSpeed } = require('../combatantDAO.js');

module.exports = new Weapon("Spell: Reactive Life Drain", 2, "*Strike a foe for @{damage} (+@{bonusDamage} if foe went first) @{element} damage, then gain @{healing} hp*\nCritical Hit: Healing x@{critBonus}", "Darkness", effect, ["Spell: Flanking Life Drain", "Spell: Urgent Life Drain"])
	.setTargetingTags({ target: "single", team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }])
	.setCost(350)
	.setUses(10)
	.setDamage(75)
	.setHealing(25)
	.setBonusDamage(50);

async function effect(target, user, isCrit, adventure) {
	let { element: weaponElement, modifiers: [elementStagger], damage, bonusDamage, healing, critBonus } = module.exports;
	if (calculateTotalSpeed(target) > calculateTotalSpeed(user)) {
		damage += bonusDamage;
	}
	if (user.element === weaponElement) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		healing *= critBonus;
	}
	return `${await dealDamage(target, user, damage, false, weaponElement, adventure)} ${gainHealth(user, healing, adventure)}`;
}