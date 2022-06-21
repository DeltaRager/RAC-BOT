const { MessageEmbed } = require('discord.js');
const axios = require('axios');
const config = require('../config.json')
const ranks = require('../constants/ranks.json')
const rankRoles = require('../constants/rankRoll.json')
const noblox = require("noblox.js")
const QuickChart = require('quickchart-js');

const chart = new QuickChart()
const talkedRecently = {}

function pad(n) {return n < 10 ? "0"+n : n;}

async function makeRequest(playerKey, message) {
	if (talkedRecently[message.author.id]) {
		message.reply(`Cooldown: **${15 - (Math.round(Date.now() / 1000) - talkedRecently[message.author.id])}secs**`).then(msg => {
			setTimeout(() => msg.delete(),  5000) 
		})
		.catch();
		return
	} else {
		talkedRecently[message.author.id] = Math.round(Date.now() / 1000)
		setTimeout(() => {
			delete talkedRecently[message.author.id]
		}, 15000);
	}
	if(!playerKey) {
		await axios
		.get(`https://verify.eryn.io/api/user/${message.author.id}`)
		.then(res => {
			playerKey = res.data.robloxId
		})
		.catch(error => {
			// console.error(error);
			message.reply('Not verified with Rover.')
			return
		});
	}
	if(!parseInt(playerKey) ) {
		await axios
		.get(`https://www.roblox.com/users/profile?username=${playerKey}`)
		.then(res => {
			playerKey = res.request.path.split("/")[2]
		})
		.catch(error => {
			// console.error(error);
			message.reply('Profile not found.')
			return
		});
	}
    const options = {
        method: 'get',
        headers: { 'x-api-key': config.KEY },
        url: `https://apis.roblox.com/datastores/v1/universes/2931035894/standard-datastores/datastore/entries/entry?datastoreName=ChallengeS1_01100&entryKey=${playerKey}`
    }

    const currentSeasonOption = {
        method: 'get',
        headers: { 'x-api-key': config.KEY },
        url: `https://apis.roblox.com/datastores/v1/universes/2931035894/standard-datastores/datastore/entries/entry?datastoreName=ChallengeS1_01105&entryKey=${playerKey}`
    }
	try {
		let res = await axios(options)
        let resCurrent = await axios(currentSeasonOption)

        var rankImproved = ''
        var accImproved = ''

        if(res.data.profile.AverageAccuracy < resCurrent.data.profile.AverageAccuracy) {
            accImproved = `${resCurrent.data.profile.AverageAccuracy}% <:triangleup:988766488653594646>`
        } else if(res.data.profile.AverageAccuracy > resCurrent.data.profile.AverageAccuracy) {
            accImproved = `${resCurrent.data.profile.AverageAccuracy}% <:triangledown:988766502540935218>`
        } else {
            accImproved = `${resCurrent.data.profile.AverageAccuracy}% :white_small_square:`
        }

        let index = 0
        for(var attributename in ranks){
            index += 1
            if(attributename == res.data.profile.Rank) {
                break
            }
        }

        let currentIndex = 0
        for(var attributename in ranks){
            currentIndex += 1
            if(attributename == resCurrent.data.profile.Rank) {
                break
            }
        }

        if(index < currentIndex) {
            rankImproved = `${resCurrent.data.profile.Rank} <:triangleup:988766488653594646>`
        } else if(index > currentIndex) {
            rankImproved = `${resCurrent.data.profile.Rank} <:triangledown:988766502540935218>`
        } else {
            rankImproved = `${resCurrent.data.profile.Rank} :white_small_square:`
        }

		noblox.getPlayerInfo({userId: parseInt(playerKey)}).then(async function(playerData){
			const exampleEmbed = new MessageEmbed()
			.setColor('#0dffb2')
			.setTitle(res.data.profile.Username)
			.setAuthor({ name: 'Season 1 Stats', iconURL: ranks[res.data.profile.Rank], url: `https://www.roblox.com/users/${playerKey}/profile`})
			.addFields(
				{ name: '‎', value: `Rank: **${res.data.profile.Rank}**\nAccuracy: **${res.data.profile.AverageAccuracy}%**\n\n**Current Season**\nRank: **${rankImproved}**\nAccuracy: **${accImproved}**`}
			)
			.setThumbnail(ranks[res.data.profile.Rank])
			// .setImage(charUrl)
			.setFooter({ text: `RAC BOT 2022 by DeltaRager`, iconURL: 'https://cdn.discordapp.com/attachments/972175327176577024/972244493271191612/racl2.png' });
			await message.reply({ embeds: [exampleEmbed] });
		})
		
	} catch (error) {
		console.log(error)
	}
}

module.exports = {
	name: 's1',
	execute(args, message) {
		makeRequest(args[0], message)
	},
};