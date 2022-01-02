const Command = require('../../Classes/Command.js');
const { MessageEmbed } = require('discord.js');
const { getAdventure } = require('../adventureDAO.js');
const { weaponToEmbedField } = require('../weaponDAO.js');
const { getFullName } = require('../combatantDAO.js');
const { getEmoji } = require('../../Classes/DamageType.js');

module.exports = new Command("delver-stats", "Get your personal stats for the channel's adventure", false, false);

module.exports.execute = (interaction) => {
	// Show the delver stats of the user
	let adventure = getAdventure(interaction.channel.id);
	if (adventure) {
		let delver = adventure.delvers.find(delver => delver.id === interaction.user.id);
		if (delver) {
			let embed = new MessageEmbed()
			.setTitle(getFullName(delver, adventure.room.enemyTitles))
			.setDescription(`HP: ${delver.hp}/${delver.maxHp}\nPredicts: ${delver.predict}\nElement: ${delver.element} ${getEmoji(delver.element)}`)
			.setFooter({ text: "Imaginary Horizons Productions", iconURL: "https://cdn.discordapp.com/icons/353575133157392385/c78041f52e8d6af98fb16b8eb55b849a.png" });
			for (let weapon of delver.weapons) {
				embed.addField(...weaponToEmbedField(weapon.name, weapon.uses));
			}
			interaction.reply({ embeds: [embed], ephemeral: true })
			.catch(console.error);
		} else {
			interaction.reply({ content: "You are not a part of this adventure.", ephemeral: true });
		}
	} else {
		interaction.reply({ content: "This channel doesn't appear to be an adventure's thread.", ephemeral: true });
	}
}
