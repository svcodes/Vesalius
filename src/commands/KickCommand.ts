import { Command } from 'discord-akairo';
import { Message, GuildMember } from 'discord.js';

export default class KickCommand extends Command {
    constructor() {
        super('kick', {
            aliases: ['kick','yeet'],
            args: [
                {
                    id: 'person',
                    type: 'member',
                },
                {
                  id: 'reason',
                  match: 'rest',
                  type: 'string'
                }
            ],
          userPermissions: ['KICK_MEMBERS']
        });
    }

    exec(message: Message, { person, reason }: { person: GuildMember, reason: string }) {
        if (message.member!.roles.highest.position <= target.roles.highest.position)
            return message.channel.send("You aren't allowed to kick this person!");
        if (!person) return message.channel.send("I can't find this user, or they aren't in the server")
        if (!person.kickable) return message.channel.send("I can't kick this user!")
        if (person == message.author) return message.channel.send("You can't kick yourself!")
        person.kick({reason: reason})
        return message.channel.send(`Successfully kicked {target.displayName}#{target.discriminator}!`);
    }
}

