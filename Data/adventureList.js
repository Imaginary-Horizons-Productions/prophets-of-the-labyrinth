const { setPlayer, getPlayer } = require("./playerList.js");
const fs = require("fs");
const { roomDictionary } = require("./Rooms/_roomDictionary.js");
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const { enemyDictionary } = require("./Enemies/_enemyDictionary.js");
const Move = require("./../Classes/Move.js");
const { ensuredPathSave } = require("../helpers.js");
const Delver = require("../Classes/Delver.js");

var filePath = "./Saves/adventures.json";
var requirePath = "./../Saves/adventures.json";
var adventureDictionary = new Map();

exports.loadAdventures = function () { //TODO #18 generalize file loading
	return new Promise((resolve, reject) => {
		if (fs.existsSync(filePath)) {
			var adventures = require(requirePath);
			adventures.forEach(adventure => {
				adventureDictionary.set(adventure.id, adventure);
			})
			resolve();
		} else {
			if (!fs.existsSync("./Saves")) {
				fs.mkdirSync("./Saves", { recursive: true });
			}
			fs.writeFile(filePath, "[]", "utf8", error => {
				if (error) {
					console.error(error);
				}
			})
			resolve();
		}
	})
}

exports.getAdventure = function (id) {
	return adventureDictionary.get(id);
}

exports.setAdventure = function (adventure) {
	adventureDictionary.set(adventure.id, adventure);
	exports.saveAdventures()
}

exports.updateStartingMessage = function (startMessage, adventure) {
	let embed = startMessage.embeds[0];
	let partyList = `Leader: <@${adventure.delvers[0].id}>`;
	for (let i = 1; i < adventure.delvers.length; i++) {
		partyList += `\n <@${adventure.delvers[i].id}>`;
	}
	embed.spliceFields(0, 1, { name: `${adventure.delvers.length} Party Member${adventure.delvers.length == 1 ? "" : "s"}`, value: partyList });
	startMessage.edit({ embeds: [embed] });
}

exports.nextRandomNumber = function (adventure, poolSize, branch) {
	let generated;
	let index;
	switch (branch) {
		case "general":
			index = adventure.rnIndex;
			adventure.rnIndex = (index + 1) % adventure.rnTable.length;
			break;
		case "battle":
			index = adventure.rnIndexBattle;
			adventure.rnIndexBattle = (index + 1) % adventure.rnTable.length;
			break;
	}
	let indexEnd = index + poolSize.toString().length;
	if (indexEnd < index) {
		generated = adventure.rnTable.slice(index) + adventure.rnTable.slice(0, indexEnd);
	} else {
		generated = adventure.rnTable.slice(index, indexEnd);
	}
	return generated % poolSize;
}

exports.nextRoom = function (adventure, channel) {
	adventure.depth++;
	if (adventure.lastComponentMessageId) {
		channel.messages.fetch(adventure.lastComponentMessageId).then(message => {
			message.edit({ components: [] });
		}).catch(console.error);
	}
	if (adventure.depth > 3) {
		adventure.accumulatedScore = 10;
		exports.completeAdventure(adventure, channel, "success");
	} else {
		let roomPool = Object.values(roomDictionary);
		let room = roomPool[exports.nextRandomNumber(adventure, roomPool.length, "general")];
		let embed = new MessageEmbed()
			.setAuthor(`Entering Room #${adventure.depth}`, channel.client.user.displayAvatarURL())
			.setTitle(room.title)
			.setDescription(room.description);
		if (room.type === "battle") {
			new Promise((resolve, reject) => {
				adventure.battleRound = 0;
				adventure.battleMoves = [];
				Object.keys(room.enemies).forEach(enemyName => {
					for (let i = 0; i < room.enemies[enemyName]; i++) {
						let enemy = {};
						Object.assign(enemy, enemyDictionary[enemyName])
						adventure.battleEnemies.push(enemy);
					}
				})
				resolve(adventure);
			}).then(adventure => {
				exports.newRound(adventure, channel, embed);
			})
		} else {
			channel.send({ embeds: [embed], components: room.components }).then(message => {
				adventure.lastComponentMessageId = message.id;
			});
		}
	}
}

exports.newRound = function (adventure, channel, embed) {
	// Sort Soves by Speed
	adventure.battleMoves.sort((first, second) => {
		return (second.speed + second.roundSpeed) - (first.speed + first.roundSpeed);
	})

	// Resolve round's moves
	let lastRoundText = "";
	adventure.battleMoves.forEach(move => {
		let userTeam = move.userTeam === "ally" ? adventure.delvers : adventure.battleEnemies;
		let user = userTeam[move.userIndex];
		if (user.hp > 0) {
			let target;
			if (move.targetTeam === "ally") {
				target = adventure.delvers[move.targetIndex];
				lastRoundText += `${user.name} attacked ${target.name}.`;
			} else {
				target = adventure.battleEnemies[move.targetIndex];
				lastRoundText += `${user.name} used ${move.weaponName} on ${target.name}.`; //TODO #5 merge enemy/ally path in combat descriptions
			}
			lastRoundText += " " + exports.takeDamage(target, channel, move.damage) + "\n";

			//TODO #6 decrement weapon durability and check for breakage
		}
	})
	adventure.battleMoves = [];

	// Check for Defeat or Victory
	if (adventure.lives <= 0) {
		exports.completeAdventure(adventure, channel, "defeat");
	} else {
		if (adventure.battleEnemies.every(enemy => enemy.hp === 0)) {
			channel.send({
				embeds: [new MessageEmbed()
					.setTitle("Victory!")
					.setDescription(lastRoundText)
					.setFooter(`Round ${adventure.battleRound}`)]
			}).then(message => {
				adventure.battleRound = 0;
				adventure.battleMoves = [];
				adventure.battleEnemies = [];
				exports.nextRoom(adventure, channel)
			});
		} else {
			// Increment round and clear last round's components
			adventure.battleRound++;
			if (adventure.lastComponentMessageId) {
				channel.messages.fetch(adventure.lastComponentMessageId).then(message => {
					message.edit({ components: [] });
				})
			}

			// Next Round's Prerolls
			//TODO #7 crits
			for (let i = 0; i < adventure.battleEnemies.length; i++) {
				let enemy = adventure.battleEnemies[i];
				let action = enemy.actions[0]; //TODO #8 move selection AI (remember to include weights)
				adventure.battleMoves.push(new Move()
					.setSpeed(enemy.speed)
					.setUser("enemy", i)
					.setTarget("ally", exports.nextRandomNumber(adventure, adventure.delvers.length, "battle")) //TODO #19 nonrandom AI
					.setDamage(action.damage)); //TODO #10 enemy action effects
				let percentBonus = (exports.nextRandomNumber(adventure, 21, "battle") - 10) / 100;
				enemy.roundSpeed = Math.floor(enemy.speed * percentBonus);
			}

			for (var delver of adventure.delvers) {
				let percentBonus = (exports.nextRandomNumber(adventure, 21, "battle") - 10) / 100;
				delver.roundSpeed = Math.floor(delver.speed * percentBonus);
			}
			if (lastRoundText !== "") {
				embed.setDescription(lastRoundText);
			}
			if (!embed.title) {
				embed.setTitle("Combat");
			}
			embed.addField(`0/${adventure.delvers.length} Moves Readied`, "Ready party members will be listed here")
				.setFooter(`Round ${adventure.battleRound}`);
			channel.send({ embeds: [embed], components: exports.generateBattleMenu(adventure) }).then(message => {
				adventure.lastComponentMessageId = message.id;
			});
		}
	}
}

exports.updateRoundMessage = function (roundMessage, adventure) {
	let embed = roundMessage.embeds[0];
	let readyList = "";
	for (var move of adventure.battleMoves) {
		if (move.userTeam === "ally") {
			readyList += `\n<@${adventure.delvers[move.userIndex].id}>`;
		}
	}
	if (readyList === "") {
		readyList = "Ready party members will be listed here";
	}
	embed.spliceFields(0, 1, { name: `${adventure.battleMoves.length - adventure.battleEnemies.length}/${adventure.delvers.length} Moves Readied`, value: readyList });
	roundMessage.edit({ embeds: [embed] });
}

exports.generateBattleMenu = function (adventure) {
	let targetOptions = [];
	for (i = 0; i < adventure.battleEnemies.length; i++) {
		targetOptions.push({
			label: adventure.battleEnemies[i].name,
			description: "",
			value: `enemy-${i}`
		})
	}
	for (i = 0; i < adventure.delvers.length; i++) {
		targetOptions.push({
			label: adventure.delvers[i].name,
			description: "",
			value: `ally-${i}`
		})
	}
	let battleMenu = [
		new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId("read")
					.setLabel("Read")
					.setStyle("PRIMARY"),
				new MessageButton()
					.setCustomId("self")
					.setLabel("Inspect self")
					.setStyle("SECONDARY")
			),
		new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId(`weapon-0`)
					.setPlaceholder("Use your first weapon on...")
					.addOptions(targetOptions)
			),
		new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId(`weapon-1`)
					.setPlaceholder("Use your second weapon on...")
					.addOptions(targetOptions)
			),
		new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId(`weapon-2`)
					.setPlaceholder("Use your third weapon on...")
					.addOptions(targetOptions)
			),
		new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId(`weapon-3`)
					.setPlaceholder("Use your fourth weapon on...")
					.addOptions(targetOptions)
			)
	];

	return battleMenu;
}

exports.checkNextRound = function (adventure, channel) {
	if (adventure.battleMoves.length >= (adventure.delvers.length + adventure.battleEnemies.length)) {
		let embed = new MessageEmbed()
			.setFooter(`Round ${adventure.battleRound}`);
		exports.newRound(adventure, channel, embed);
	}
}

exports.takeDamage = function (character, channel, damage) { //TODO #27 implement blocking
	character.hp -= damage;
	let damageText = ` ${character.name} takes ${damage} damage.`;
	if (character.hp <= 0) {
		let adventure = exports.getAdventure(channel.id);
		if (character instanceof Delver) {
			character.hp = character.maxHp;
			adventure.lives -= 1;
			if (adventure.lives <= 0) {
				exports.completeAdventure(adventure, channel, "defeat");
			}
			damageText += ` ${character.name} has died and been revived. ${adventure.lives} lives remain.`;
		} else {
			character.hp = 0;
			damageText += ` ${character.name} has died.`;
		}
	}
	return damageText;
}

exports.gainHealth = function (delver, healing) { //TODO #13 refactor to return damage text
	delver.hp += healing; //TODO #14 generalize to include enemies
	if (delver.hp > delver.maxHp) {
		delver.hp = delver.maxHp;
	}
}

//{channelId: guildId} A list of adventure channels that restarting the bot interrupted deleting
let completedAdventures = {};

exports.completeAdventure = function (adventure, channel, result) {
	var baseScore = adventure.depth;
	switch (result) {
		case "success":
			baseScore += adventure.accumulatedScore;
			break;
		case "defeat":
			baseScore += Math.floor(adventure.accumulatedScore / 2);
			break;
	}

	adventure.delvers.forEach(delver => {
		let player = getPlayer(delver.id, channel.guild.id);
		let previousScore = player.scores[channel.guild.id];
		if (previousScore) {
			player.scores[channel.guild.id] += baseScore;
		} else {
			player.scores[channel.guild.id] = baseScore;
		}
		setPlayer(player);
	})

	channel.messages.fetch(adventure.lastComponentMessageId).then(message => {
		message.edit({ components: [] });
	})
	//TODO #28 clear utilty message components

	adventureDictionary.delete(channel.id);
	exports.saveAdventures();
	completedAdventures[channel.id] = channel.guild.id;
	ensuredPathSave("./Saves", "completedAdventures.json", JSON.stringify(completedAdventures));
	setTimeout(() => {
		channel.delete("Adventure complete!");
		delete completedAdventures[channel.id];
		ensuredPathSave("./Saves", "completedAdventures.json", JSON.stringify(completedAdventures));
	}, 300000);
	channel.send(`The adventure has been completed! Delvers have earned ${baseScore} score (times their personal multiplier). This channel will be cleaned up in 5 minutes.`);
}

exports.saveAdventures = function () {
	ensuredPathSave("./Saves", "adventures.json", JSON.stringify(Array.from((adventureDictionary.values()))));
}
