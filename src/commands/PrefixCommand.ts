import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { VesaliusBot } from '../struct/VesaliusBot';

export default class PingCommand extends Command {
    constructor() {
        super('prefix', {
            aliases: ['prefix', 'setprefix'],
            channel: 'guild',
        });
    }

    async exec(message: Message) {
        const client = message.client as VesaliusBot;
        if (message.util?.parsed?.content) {
            if (message.member.hasPermission('MANAGE_GUILD')) {
                if (message.util.parsed.content.length <= 5) {
                    const previousPrefix = await client.database.getPrefix(message.guild.id);
                    const newPrefix = await client.database.setPrefix(
                        message.guild.id,
                        message.util.parsed.content
                    );
                    message.channel.send(
                        new MessageEmbed()
                            .setColor('GREEN')
                            .setTitle('Changed prefix')
                            .setDescription(`from \`${previousPrefix}\` to \`${newPrefix}\``)
                    );
                } else {
                    message.channel.send(
                        new MessageEmbed()
                            .setColor('RED')
                            .setTitle('This prefix is too long!')
                            .setDescription('Maximum length allowed is 5 characters.')
                    );
                }
            } else {
                message.channel.send(
                    new MessageEmbed()
                        .setColor('RED')
                        .setTitle('You don\'t have permission to do this!')
                        .setDescription('Only members with Manage Server permission are allowed to do this')
                );
            }
        } else {
            message.channel.send(
                new MessageEmbed()
                    .setColor('BLUE')
                    .setDescription(`Current prefix is \`${await client.database.getPrefix(message.guild.id)}\``)
            );
        }
    }
}
