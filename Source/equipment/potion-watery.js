const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { removeModifier, addModifier } = require('../combatantDAO.js');

//TODONOW convert to potion kit
module.exports = new EquipmentTemplate("Watery Potion", 2, "*Apply @{mod1Stacks} @{mod1} to a Water element combatant, or @{mod2Stacks} @{mod2} to someone else*\nCritical Hit: @{mod1}/@{mod2} x@{critBonus}", "Water", effect, ["Earthen Potion", "Windy Potion"])
	.setCategory("Trinket")
	.setTargetingTags({ target: "single", team: "any" })
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Regen", stacks: 4 }, { name: "Poison", stacks: 5 }, { name: "Regen", stacks: 8 }, { name: "Poison", stacks: 10 }])
	.setCost(350)
	.setUses(10);

function effect(target, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger, regen, poison, critRegen, critPoison] } = module.exports;
	if (target.element === element) {
		if (user.element === element) {
			removeModifier(target, elementStagger);
		}
		if (isCrit) {
			addModifier(target, regen);
		} else {
			addModifier(target, critRegen);
		}
		return;
	} else {
		if (user.element === element) {
			addModifier(target, elementStagger);
		}
		if (isCrit) {
			addModifier(target, critPoison);
		} else {
			addModifier(target, poison);
		}
		return;
	}
}
