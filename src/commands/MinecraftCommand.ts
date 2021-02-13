import { Command } from "discord-akairo";
import { Message, MessageEmbed, Util } from "discord.js";
import { VesaliusBot } from "../struct/VesaliusBot";
import { status as getStatus } from "minecraft-server-util";
import { StatusResponse } from "minecraft-server-util/dist/model/StatusResponse";
export default class MinecraftCommand extends Command {
    private cache: Record<string, { lastCache: number; data: StatusResponse }>;

    constructor() {
        super('minecraft', {
            aliases: ['server', 'minecraft', 'mc']
        });

        this.cache = {};
    }
    
    async exec(message: Message) {
        const client = message.client as VesaliusBot;
        if (message.util?.parsed?.content) {
            const subcommands = message.util.parsed.content.split(' ');
            if (subcommands[0] === 'set' || subcommands[0] === 'default') {
                if (subcommands[1].length > 256) {
                    message.channel.send(
                        new MessageEmbed()
                            .setColor(Util.resolveColor('RED'))
                            .setTitle('Address is too long!')
                            .setDescription('Server addresses must be no more than 256 characters in length')
                    );
                } else {
                    if (message.member.hasPermission('MANAGE_GUILD')) {
                        const address = await client.database.setDefaultMinecraftAddress(message.guild.id, subcommands[1]);
                        message.channel.send(
                            new MessageEmbed()
                                .setColor(Util.resolveColor('GREEN'))
                                .setTitle('Changes successful!')
                                .setDescription(`Default Minecraft address is now \`${address}\``)
                        );
                    } else {
                        message.channel.send(
                            new MessageEmbed()
                                .setColor(Util.resolveColor("RED"))
                                .setTitle("You don't have permission to do this!")
                                .setDescription("Only members with Manage Server permission are allowed to do this")
                        );
                    }
                }
            } else {
                const [host, port = 25565] = subcommands[0].split(':');
                const serverStatus = await this.getStatusCached(host, Number(port));
                message.channel.send(MinecraftCommand.createEmbed(serverStatus));
            }
        } else {
            const address = await client.database.getDefaultMinecraftAddress(message.guild.id);
            if (address === null) {
                message.channel.send(
                    new MessageEmbed()
                        .setColor(Util.resolveColor('YELLOW'))
                        .setTitle('Default address has not been set!')
                        .setDescription('If you believe this is in error, ask a server administrator to set one.')
                );
            } else {
                const [host, port = 25565] = address.split(':');
                const serverStatus = await this.getStatusCached(host, Number(port));
                message.channel.send(MinecraftCommand.createEmbed(serverStatus));
            }
        }
    }

    async getStatusCached(address: string, port?: number): Promise<StatusResponse> {
        const cacheName = address + (port ? (':' + port.toString()) : '');
        if (this.cache[cacheName]) {
            if (this.cache[cacheName].lastCache < Date.now() - 300000) {
                this.cache[cacheName].data = await getStatus(address, { port });
                this.cache[cacheName].lastCache = Date.now();
            }
        } else {
            this.cache[cacheName] = {
                data: await getStatus(address, { port }),
                lastCache: Date.now()
            };
        }
        return this.cache[cacheName].data;
    }

    private static createEmbed(status: StatusResponse): MessageEmbed {
        let address: string;
        if (status.srvRecord !== null) {
            address = status.srvRecord.host;
            if (status.srvRecord.port !== 25565) {
                address += `:${status.srvRecord.port}`;
            }
        } else {
            address = status.host;
            if (status.port !== 25565) {
                address += `:${status.port}`;
            }
        }
        const embed = new MessageEmbed()
            .setColor(Util.resolveColor('GREEN'))
            .setTitle('Server Status')
            .setFooter(`Server Address: ${address}`)
            .addField('Status', 'Online', true)
            .addField('Player Count', `${status.onlinePlayers}/${status.maxPlayers}`, true)
            .addField('Version', status.version, true)
            .setTimestamp();
        if (status.favicon) {
            embed.setThumbnail(`https://mc-api.net/v3/server/favicon/${address}`);
        }
        if (status.modInfo?.modList.length) {
            embed.addField(`Modded: ${status.modInfo.type}`, `${status.modInfo.modList.length} installed on server`)
        }
        if (status.samplePlayers.length !== 0) {
            let players: Array<string> = [];
            for (let i = 0; i < status.samplePlayers.length; i++) {
                if (i > 6) break;
                const player = status.samplePlayers[i].name;
                players.push(player);
            }
            let playerString = `\`${players.join('`, `')}\``;
            if (players.length < status.onlinePlayers) {
                playerString += ', and more...';
            }
            embed.addField('Players', playerString, false);
        }
        return embed;
    }
}
