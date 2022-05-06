import { readdirSync } from 'node:fs';

client.commands = new Collection();
const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(`${process.env.PREFIX}${command.data.name}`, command);
}
console.log("bro how many prints")
export const name = 'messageCreate';
export function execute(message) {
    const msg = message.content.split(" ")
    const commandtext = msg[0]
    const args = msg.shift()
    const command = client.commands.get(message.content);
    if (!command) return;

    try {
        await command.execute(args);
    } catch (error) {
        console.error(error);
        await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
    
}