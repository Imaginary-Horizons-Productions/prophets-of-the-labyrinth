const { setPlayer, getPlayer } = require("./playerList.js");
const fs = require("fs");
const { roomDictionary } = require("./Rooms/_roomDictionary.js");
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const { enemyDictionary } = require("./Enemies/_enemyDictionary.js");
const Move = require("./../Classes/Move.js");
const { ensuredPathSave } = require("../helpers.js");

var filePath = "./Saves/adventures.json";
var requirePath = "./../Saves/adventures.json";
var adventureDictionary = new Map();

exports.loadAdventures = function () {
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

exports.nextRandomNumber = function (adventure, poolSize) {
	let index;
	let indexEnd = adventure.rnIndex + poolSize.toString().length;
	if (indexEnd < adventure.rnIndex) {
		index = adventure.rnTable.slice(adventure.rnIndex) + adventure.rnTable.slice(0, indexEnd);
	} else {
		index = adventure.rnTable.slice(adventure.rnIndex, indexEnd);
	}
	adventure.rnIndex = (adventure.rnIndex + 1) % adventure.rnTable.length;
	return index % poolSize;
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
		let room = roomPool[exports.nextRandomNumber(adventure, roomPool.length)];
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
	// Resolve round's moves
	let lastRoundText = "";
	adventure.battleMoves.forEach(move => {
		let userTeam = move.userTeam === "ally" ? adventure.delvers : adventure.battleEnemies;
		let user = userTeam[move.userIndex];
		if (user.hp > 0) {
			let target;
			if (move.targetTeam === "ally") {
				target = adventure.delvers[move.targetIndex];
				lastRoundText += `${user.name} dealt ${move.damage} damage to ${target.name}.\n`; //TODO include weapon name
				exports.takeDamage(target, channel, move.damage);
			} else {
				target = adventure.battleEnemies[move.targetIndex];
				target.hp -= move.damage;
				lastRoundText += `${user.name} dealt ${move.damage} damage to ${target.name}.\n`; //TODO include weapon name
				if (target.hp <= 0) {
					target.hp = 0;
					lastRoundText += `The ${target.name} was knocked out!\n`;
				}
			}

			//TODO decrement weapon durability and check for breakage
		}
	})
	adventure.battleMoves = [];

	// Check for Defeat or Victory
	if (adventure.lives <= 0) {
		exports.completeAdventure(adventure, channel, "defeat");
	} else {
		if (adventure.battleEnemies.every(enemy => enemy.hp === 0)) {
			channel.send("Victory!").then(message => {
				adventure.battleRound = 0;
				adventure.battleMoves = [];
				adventure.battleEnemies = [];
				exports.nextRoom(adventure, channel)
			});
			//TODO return
		} else {
			// Increment round and clear last round's components
			adventure.battleRound++;
			if (adventure.lastComponentMessageId) {
				channel.messages.fetch(adventure.lastComponentMessageId).then(message => {
					message.edit({ components: [] });
				})
			}

			// Next Round's Prerolls
			//TODO crits
			for (let i = 0; i < adventure.battleEnemies.length; i++) {
				let enemy = adventure.battleEnemies[i];
				let action = enemy.actions[0]; //TODO move selection AI (remember to include weights)
				adventure.battleMoves.push(new Move()
					.setSpeed(enemy.speed)
					.setUser("enemy", i)
					.setTarget("player", 0) //TODO targeting AI (remember to avoid KO'd delvers)
					.setDamage(action.damage)); //TODO enemy action effects
			}
			if (lastRoundText !== "") {
				embed.setDescription(lastRoundText);
			}
			embed.setFooter(`Round ${adventure.battleRound}`);
			channel.send({ embeds: [embed], components: exports.generateBattleMenu(adventure) }).then(message => {
				adventure.lastComponentMessageId = message.id;
			});
		}
	}
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

exports.takeDamage = function (delver, channel, damage) {
	delver.hp -= damage;
	if (delver.hp <= 0) {
		delver.hp = delver.maxHp;
		let adventure = exports.getAdventure(channel.id);
		adventure.lives -= 1;
		channel.send(`<@${delver.id}> has died and been revived. ${adventure.lives} lives remain.`)
		if (adventure.lives <= 0) {
			exports.completeAdventure(adventure, channel, "defeat");
		}
	}
	return;
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
