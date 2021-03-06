const Equipment = require('../../Classes/Equipment.js');
const { removeModifier, addModifier, dealDamage } = require('../combatantDAO.js');

module.exports = new Equipment("Infinite Regeneration", 1, "*Pay @{hpCost} hp to grant an ally @{mod1Stacks} @{mod1}*\nCritical Hit: HP Cost / @{critBonus}", "Earth", effect, [])
	.setCategory("Pact")
	.setTargetingTags({ target: "single", team: "delver" })
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Regen", stacks: 3 }])
	.setHpCost(50)
	.setCost(200)
	.setUses(5);

function effect(target, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger, regen], hpCost, critBonus } = module.exports;
	if (user.element === element) {
		removeModifier(target, elementStagger);
	}
	if (isCrit) {
		hpCost /= critBonus;
	}
	addModifier(target, regen);
	return dealDamage(user, null, hpCost, true, "Untyped", adventure); // result text
}
