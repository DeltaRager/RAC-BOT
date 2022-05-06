const { MessageEmbed } = require('discord.js');
const axios = require('axios');

async function makeRequest(playerKey, message) {
    const options = {
        method: 'get',
        headers: { 'x-api-key': process.env.KEY },
        url: `https://apis.roblox.com/datastores/v1/universes/2931035894/standard-datastores/datastore/entries/entry?datastoreName=PlayerData_085&entryKey=Player_${playerKey}`
    }

    let res = await axios(options)
    const exampleEmbed = new MessageEmbed()
	.setColor('#0x00FFFF')
	.setTitle('RAC Profile')
	.setDescription('This is yo profile bro')
	.addFields(
		{ name: 'User ID', value: `${playerKey}` },
		{ name: 'User Rank', value: `${res.data.Data.Rank}`, inline: true },
		{ name: 'User Elo', value: `${res.data.Data.Elo}`, inline: true },
        { name: 'Average Accuracy', value: `${res.data.Data.AverageAccuracy}`, inline: true },
	)
    message.reply({ embeds: [exampleEmbed] });
}

module.exports = {
	name: 'getprofile',
	execute(args, message) {
		makeRequest(args, message)
	},
};