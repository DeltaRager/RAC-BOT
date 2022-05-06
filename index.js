const fs = require('fs')
const { Client, Intents } = require('discord.js');

const path = require('path');

const dirPath = path.resolve(__dirname, './src/events');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const eventFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`${dirPath}/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.TOKEN);