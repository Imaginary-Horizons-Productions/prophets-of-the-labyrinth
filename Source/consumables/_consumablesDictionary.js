const Adventure = require("../../Classes/Adventure.js");
const ConsumableTemplate = require("../../Classes/ConsumableTemplate.js");
const { generateRandomNumber } = require("../../helpers.js");

const CONSUMABLES = {};

const ROLL_TABLE = {
	Earth: [],
	Wind: [],
	Water: [],
	Fire: [],
	Untyped: []
}

for (const file of [
	"earthenpotion.js",
	"explosionpotion.js",
	"fierypotion.js",
	"healthpotion.js",
	"oblivionsalt.js",
	"quickpepper.js",
	"regenroot.js",
	"repairkit.js",
	"smokebomb.js",
	"stasisquartz.js",
	"strengthspinach.js",
	"vitamins.js",
	"waterypotion.js",
	"windypotion.js"
]) {
	const consumable = require(`./${file}`);
	CONSUMABLES[consumable.name] = consumable;
	ROLL_TABLE[consumable.element].push(consumable.name);
}

/** Template should not be mutated
 * @param {string} consumableName
 * @returns {ConsumableTemplate}
 */
exports.getConsumable = function (consumableName) {
	return CONSUMABLES[consumableName];
}

/** Rolls a consumable's name from droppable consumables
 * @param {Adventure} adventure
 * @returns {string}
 */

exports.rollConsumable = function (adventure) {
	let consumablePool = adventure.getElementPool().reduce((consumables, element) => consumables.concat(ROLL_TABLE[element]), []);
	return consumablePool[generateRandomNumber(adventure, consumablePool.length, "general")];
}
