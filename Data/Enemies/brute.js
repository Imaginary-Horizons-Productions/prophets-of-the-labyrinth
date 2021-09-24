const Enemy = require("../../Classes/Enemy.js");

module.exports = new Enemy("brute")
	.setHp(20)
	.setSpeed(5)
	.addActions([{ name: "punch", weight: 3, damage: 5 }, { name: "big punch", weight: 1, damage: 10 }]);