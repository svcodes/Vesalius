import { Command } from "discord-akairo";
import { Message, MessageEmbed, Util } from "discord.js";
import now from 'performance-now';

export default class EvalCommand extends Command {
    constructor() {
        super('eval', {
            aliases: ['eval'],
            ownerOnly: true
        });
    }

    async exec(message: Message) {
        const reply = await message.channel.send(
            new MessageEmbed()
                .setTitle('Processing...')
                .setColor(Util.resolveColor('BLUE'))
        )
        const start = now();
        try {
            const output = eval(message.util.parsed.content);
            reply.edit(
                new MessageEmbed()
                    .setTitle(`Done in ${(now() - start).toFixed(3)}ms`)
                    .addField('Returns', `\`\`\`javascript\n${output}\`\`\``)
                    .setColor(Util.resolveColor('GREEN'))
            );
        } catch (err) {
            console.log(err);
            reply.edit(
                new MessageEmbed()
                    .setTitle(`Error in ${(now() - start).toFixed(3)}ms`)
                    .addField('Error Message', `\`\`\`javascript\n${err}\`\`\``)
                    .setColor(Util.resolveColor('RED'))
            );
        }
    }
}
