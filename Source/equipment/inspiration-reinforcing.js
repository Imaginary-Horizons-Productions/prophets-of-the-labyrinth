const Equipment = require('../../Classes/Equipment.js');
const { addModifier, removeModifier, addBlock } = require('../combatantDAO.js');

module.exports = new Equipment("Reinforcing Inspiration", 2, "Apply @{mod1Stacks} @{mod1} and @{block} block to an ally*\nCritical Hit: Apply @{mod2Stacks} @{mod2} to an delver", "Wind", effect, ["Soothing Inspiration", "Sweeping Inspiration"])
	.setCategory("Spell")
	.setTargetingTags({ target: "single", team: "delver" })
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Power Up", stacks: 25 }, { name: "Power Up", stacks: 50 }])
	.setBlock(25)
	.setCost(350)
	.setUses(5);

function effect(target, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger, powerUp, critPowerUp], block } = module.exports;
	if (user.element === element) {
		removeModifier(target, elementStagger);
	}
	if (isCrit) {
		addModifier(target, critPowerUp);
	} else {
		addModifier(target, powerUp);
	}
	addBlock(target, block);
	return "";
}
