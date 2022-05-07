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

async function makeRequest(playerKey, message, client) {
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
	if(playerKey == '>!getprofile') {
		await axios
		.get(`https://verify.eryn.io/api/user/${message.author.id}`)
		.then(res => {
			playerKey = res.data.robloxId
		})
		.catch(error => {
			// console.error(error);
			message.reply('Not verified with Rover.')
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
		});
	}
	
    const options = {
        method: 'get',
        headers: { 'x-api-key': config.KEY },
        url: `https://apis.roblox.com/datastores/v1/universes/2931035894/standard-datastores/datastore/entries/entry?datastoreName=PlayerData_100&entryKey=Player_${playerKey}`
    }
	try {
		let res = await axios(options)
		let perstring = ""
		for(let i = 0; i < Math.abs((parseInt(res.data.Data.Experience)/(parseInt(res.data.Data.Level) * 100))) * 10 - 1;i++) {
			perstring = perstring + ":white_large_square:"
		}
		for(let i = 0; i < 10 - Math.abs((parseInt(res.data.Data.Experience)/(parseInt(res.data.Data.Level) * 100))) * 10;i++) {
			perstring = perstring + ":white_square_button:"
		}

		let dateObj = new Date(res.data.MetaData.LastUpdate * 1000)
		let updateDateNew = dateObj.toLocaleString()


		// let accArray = []
		// let labelArray = []
		// for(let i = 0;i < 5;i++) {
		// 	accArray.push(res.data.Data.PreviousGames.at(i).at(0))
		// 	labelArray.push(res.data.Data.PreviousGames.at(i).at(2))
		// }
		
		// chart.setConfig({
		// 	type:'line',
		// 	data:{
		// 		labels:labelArray, 
		// 		datasets:[
		// 			{label:'Accuracy', data: accArray, fill:false,borderColor: '#0dffb2'},
		// 		],
		// 	},
		// 	options: {
		// 		legend: {
		// 			display: false
		// 		  },
		// 		scales: {
		// 			xAxes: [{
		// 				stacked: true,
		// 				ticks: {
		// 					fontColor: 'white'
		// 				},
		// 				scaleLabel: {
		// 					display: true,
		// 					labelString: 'Last 5 Games',
		// 					fontColor: '#0dffb2',
		// 					fontSize: 20,
		// 					fontStyle: 'bold',
		// 				}
		// 			  }],
		// 			yAxes: [
		// 				{
		// 					min: 40,
		// 					suggestedMax: 100,
		// 					ticks: {
		// 						beginAtZero:false,
		// 						fontColor: 'white'
		// 					},
		// 					scaleLabel: {
		// 						display: true,
		// 						labelString: 'Accuracy',
		// 						fontColor: '#0dffb2',
		// 						fontSize: 20,
		// 						fontStyle: 'bold',
		// 					}
		// 				}
		// 			]
		// 		}
		// 	}
		// }).setBackgroundColor('transparent');
		// const charUrl = await chart.getShortUrl();
		noblox.getPlayerInfo({userId: parseInt(playerKey)}).then(async function(playerData){
			const exampleEmbed = new MessageEmbed()
			.setColor('#0dffb2')
			.setTitle(res.data.Data.Rank)
			.setAuthor({ name: playerData.displayName, iconURL: ranks[res.data.Data.Rank], url: `https://www.roblox.com/users/${playerKey}/profile`})
			.addFields(
				{ name: '‎', value: `Username: **${playerData.displayName}**\nElo: **${res.data.Data.Elo}**\nAccuracy: **${res.data.Data.AverageAccuracy}%**\n\nLevel: **${res.data.Data.Level}** | XP: **${res.data.Data.Experience}/${res.data.Data.Level * 100}**\n**[${((parseInt(res.data.Data.Experience)/(parseInt(res.data.Data.Level) * 100)) * 100).toFixed(2)}%]** ${perstring}`}
			)
			.setThumbnail(ranks[res.data.Data.Rank])
			// .setImage(charUrl)
			.setFooter({ text: `RAC BOT 2022 by DeltaRager | Profile Last Updated: ${updateDateNew}`, iconURL: 'https://cdn.discordapp.com/attachments/972175327176577024/972244493271191612/racl2.png' });
			await message.reply({ embeds: [exampleEmbed] });

			if (!message.member.roles.cache.some(role => role.name === res.data.Data.Rank)) {
				await axios
				.get(`https://verify.eryn.io/api/user/${message.author.id}`)
				.then(async res2 => {
					if(res2.data.robloxId == playerKey) {
						let member = message.member
						for(var rank in rankRoles){
							if(message.member.roles.cache.some(role => role.name === rank)) {
								let role = message.guild.roles.cache.find(r => r.id == rankRoles[rank]) || await message.guild.roles.fetch(rankRoles[rank]);
								member.roles.remove(role).catch(console.error);
								await message.reply(`Removed Role: **${rank}**`)
								break
							}
						}
	
						let myRole = message.guild.roles.cache.find(r => r.id == rankRoles[res.data.Data.Rank]) || await message.guild.roles.fetch(rankRoles[res.data.Data.Rank]);
						member.roles.add(myRole).catch(console.error);
						await message.reply(`Added Role: **${res.data.Data.Rank}**`)
					}
				})
				.catch(error => {
				});
			}
		})
		
	} catch (error) {
		// console.log(error)
	}
}

module.exports = {
	name: 'getprofile',
	execute(args, message) {
		makeRequest(args, message)
	},
};