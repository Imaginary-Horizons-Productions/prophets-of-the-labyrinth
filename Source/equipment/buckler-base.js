const Equipment = require('../../Classes/Equipment.js');
const { addBlock, removeModifier } = require('../combatantDAO.js');

module.exports = new Equipment("Buckler", 1, "*Grant an ally @{block} block*\nCritical Hit: Block x@{critBonus}", "Earth", effect, ["Guarding Buckler", "Heavy Buckler", "Urgent Buckler"])
	.setCategory("Armor")
	.setTargetingTags({ target: "single", team: "delver" })
	.setModifiers([{ name: "Stagger", stacks: 1 }])
	.setCost(200)
	.setUses(10)
	.setBlock(75);

function effect(target, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger], block, critBonus } = module.exports;
	if (user.element === element) {
		removeModifier(target, elementStagger);
	}
	if (isCrit) {
		block *= critBonus;
	}
	addBlock(target, block);
	return "";
}
