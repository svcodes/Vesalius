import { Command } from 'discord-akairo';
import { Collection, Message, MessageEmbed } from 'discord.js';

export default class HelpCommand extends Command {
    constructor() {
        super('help', {
            aliases: ['help', 'h']
        });
    }

    exec(message: Message) {
        const commandCollection = new Collection<string, string[]>();
        message.util?.handler.aliases.forEach((value, key) => {
            if (!commandCollection.has(value)) commandCollection.set(value, []);
            commandCollection.get(value).push(key);
        });
        commandCollection.delete('eval'); // Hide debug command
        const helpEmbed = new MessageEmbed().setColor('BLUE').setFooter('ik this isn\'t helpful yet');

        commandCollection.forEach((value, key) => {
            helpEmbed.addField(`\`${key}\``, `Aliases: \`${value.join('`, `')}\``);
        });

        message.channel.send(helpEmbed);
    }
}
