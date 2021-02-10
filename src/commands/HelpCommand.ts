import { Command } from "discord-akairo";
import { Collection, Message, MessageEmbed, Util } from "discord.js";

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
        
        const helpEmbed = new MessageEmbed().setColor(Util.resolveColor('BLUE')).setFooter('ik this isn\'t helpful yet');

        commandCollection.forEach((value, key) => {
            helpEmbed.addField(`\`${key}\``, `Aliases: \`${value.join('`, `')}\``);
        });

        message.channel.send(helpEmbed);
    }
}