const fs = require('fs')

const path = require('path');

const dirPath = path.resolve(__dirname, '../commands');

const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const config = require('../config.json')
client.commands = new Collection();
const commandFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`../commands/${file}`);
	client.commands.set(`${config.PREFIX}${command.name}`, command);
}
module.exports = {
	name: 'messageCreate',
	execute(message) {
        if(message.author.bot) return;
		const msg = message.content.split(" ")
        
        const commandtext = msg[0]
        const args = msg.pop()
        const command = client.commands.get(commandtext);
        if (!command) return;
        try {
            command.execute(args, message);
        } catch (error) {
            console.error(error);
            message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
	},
};