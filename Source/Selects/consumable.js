const Move = require('../../Classes/Move');
const Select = require('../../Classes/Select.js');
const { getAdventure, checkNextRound, endRound, setAdventure } = require('../adventureDAO');
const { getConsumable } = require('../consumables/_consumablesDictionary');

const id = "consumable";
module.exports = new Select(id, async (interaction, [round]) => {
	// Add a move object to priority moves
	const adventure = getAdventure(interaction.channelId);
	if (adventure.room.round === Number(round)) {
		const [consumableName] = interaction.values;
		if (consumableName in adventure.consumables && adventure.consumables[consumableName] > 0) {
			// Add move to round list (overwrite exisiting readied move)
			const consumable = getConsumable(consumableName);
			const user = adventure.delvers.find(delver => delver.id === interaction.user.id);
			let userIndex = adventure.delvers.findIndex(delver => delver.id === interaction.user.id);
			let newMove = new Move()
				.calculateMoveSpeed(user)
				.setIsCrit(false)
				.setMoveName(consumableName)
				.setType("consumable")
				.setUser(user.team, userIndex);

			consumable.selectTargets(userIndex, adventure).forEach(target => {
				newMove.addTarget(...target);
			})
			let overwritten = false;
			for (let i = 0; i < adventure.room.moves.length; i++) {
				const { userTeam, userIndex: currentUserIndex } = adventure.room.moves[i];
				if (userTeam === user.team && currentUserIndex === userIndex) {
					await adventure.room.moves.splice(i, 1);
					overwritten = true;
					break;
				}
			}
			if (!overwritten) {
				for (let i = 0; i < adventure.room.priorityMoves.length; i++) {
					const { userTeam, userIndex: currentUserIndex } = adventure.room.priorityMoves[i];
					if (userTeam === user.team && currentUserIndex === userIndex) {
						await adventure.room.priorityMoves.splice(i, 1);
						break;
					}
				}
			}
			await adventure.room.priorityMoves.push(newMove);

			// Send confirmation text
			interaction.update({ components: [] });
			interaction.channel.send(`${interaction.user} ${overwritten ? "switches to ready" : "readies"} **${consumableName}**.`).then(() => {
				setAdventure(adventure);
				if (checkNextRound(adventure)) {
					endRound(adventure, interaction.channel);
				}
			}).catch(console.error);
		} else {
			// Needed to prevent crashes in case users keep ephemeral messages around and uses an out of stock consuamble, or race condition
			interaction.update({ content: `The party doesn't have any ${consumableName}(s) remaining.`, components: [], ephemeral: true })
				.catch(console.error);
		}
	} else {
		interaction.update({ components: [] });
	}
});