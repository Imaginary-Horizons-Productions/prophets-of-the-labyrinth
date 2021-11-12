const Button = require('../../Classes/Button.js');
const { MessageEmbed } = require('discord.js');
const { getAdventure } = require('../adventureDAO.js');
const { weaponToEmbedField } = require('../combatantDAO.js');

module.exports = new Button("self");

module.exports.execute = (interaction, args) => {
	// Show the delver stats of the user
	let adventure = getAdventure(interaction.channel.id);
	let delver = adventure.delvers.find(delver => delver.id === interaction.user.id);
	let embed = new MessageEmbed()
		.setTitle(delver.name)
		.setDescription(`HP: ${delver.hp}/${delver.maxHp}\nPredicts: ${delver.predict}`)
		.setFooter("Imaginary Horizons Productions", "https://cdn.discordapp.com/icons/353575133157392385/c78041f52e8d6af98fb16b8eb55b849a.png");
	for (let i = 0; i < delver.weapons.length; i++) {
		embed.addField(...weaponToEmbedField(delver.weapons[i]));
	}
	interaction.reply({ embeds: [embed], ephemeral: true })
		.catch(console.error);
}
