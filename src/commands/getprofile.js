const { MessageEmbed } = require('discord.js');
const axios = require('axios');
const config = require('../config.json')
const ranks = require('../constants/ranks.json')
const noblox = require("noblox.js")
const QuickChart = require('quickchart-js');

const chart = new QuickChart()

function pad(n) {return n < 10 ? "0"+n : n;}

async function makeRequest(playerKey, message) {
    const options = {
        method: 'get',
        headers: { 'x-api-key': config.KEY },
        url: `https://apis.roblox.com/datastores/v1/universes/2931035894/standard-datastores/datastore/entries/entry?datastoreName=PlayerData_085&entryKey=Player_${playerKey}`
    }
	
    let res = await axios(options)
	let perstring = ""
	for(let i = 0; i < parseInt(res.data.Data.AverageAccuracy)/10 - 1;i++) {
		perstring = perstring + ":white_large_square:"
	}
	for(let i = 0; i < 10 - parseInt(res.data.Data.AverageAccuracy)/10;i++) {
		perstring = perstring + ":white_square_button:"
	}

	let dateObj = new Date(res.data.MetaData.LastUpdate * 1000)
	let updateDateNew = dateObj.toLocaleString()
	var result = pad(dateObj.getDate())+"/"+pad(dateObj.getMonth()+1)+"/"+dateObj.getFullYear();

	let accArray = []
	let labelArray = []
	for(let i = 0;i < 5;i++) {
		accArray.push(res.data.Data.PreviousGames.at(i).at(0))
		labelArray.push(res.data.Data.PreviousGames.at(i).at(2))
	}
	
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
	noblox.getPlayerInfo({userId: parseInt(playerKey)}).then(function(playerData){
		const exampleEmbed = new MessageEmbed()
		.setColor('#0dffb2')
		.setTitle(res.data.Data.Rank)
		.setAuthor({ name: playerData.displayName, iconURL: ranks[res.data.Data.Rank], url: `https://www.roblox.com/users/${playerKey}/profile`})
		.addFields(
			{ name: '‎', value: `Username: **${playerData.displayName}**\nElo: **${res.data.Data.Elo}**\nAccuracy: **${res.data.Data.AverageAccuracy}%**\n`}
		)
		.setThumbnail(ranks[res.data.Data.Rank])
		// .setImage(charUrl)
		.setTimestamp()
		.setFooter({ text: `RAC BOT 2022 | Profile Last Updated: ${updateDateNew}`, iconURL: 'https://cdn.discordapp.com/attachments/972175327176577024/972244493271191612/racl2.png' });
		message.reply({ embeds: [exampleEmbed] });
	})
}

module.exports = {
	name: 'getprofile',
	execute(args, message) {
		makeRequest(args, message)
	},
};