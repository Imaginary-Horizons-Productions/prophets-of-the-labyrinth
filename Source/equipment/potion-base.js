const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { addModifier } = require('../combatantDAO.js');

//TODONOW convert to potion kit
module.exports = new EquipmentTemplate("Unfinished Potion", 1, "*Apply @{mod1Stacks} @{mod1} to a foe*\nCritical Hit: @{mod1} x@{critBonus}", "Water", effect, ["Earthen Potion", "Windy Potion", "Watery Potion"])
	.setCategory("Trinket")
	.setTargetingTags({ target: "single", team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Poison", stacks: 4 }, { name: "Poison", stacks: 8 }])
	.setCost(200)
	.setUses(10);

function effect(target, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger, poison, critPoison] } = module.exports;
	if (user.element === element) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		addModifier(target, critPoison);
	} else {
		addModifier(target, poison);
	}
	return "";
}
