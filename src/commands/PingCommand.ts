import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';

export default class PingCommand extends Command {
    constructor() {
        super('ping', {
            aliases: ['ping'] 
        });
    }

    exec(message: Message) {
        return message.channel.send(
            new MessageEmbed()
                .setTitle(`Pong!`)
                .setDescription(`Bot WebSocket ping is ${message.client.ws.ping}ms`)
                .setColor(message.client.ws.ping < 500 ? 'GREEN' : 'RED')
        );
    }
}
