import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';
import { VesaliusBot } from '../struct/VesaliusBot';

export default class GuildJoinListener extends Listener {
    constructor() {
        super('guildCreate', {
            emitter: 'client',
            event: 'guildCreate'
        });
    }

    async exec(guild: Guild) {
        const client = guild.client as VesaliusBot;
        const guildAddQuery = await client.database.query(`
            SELECT id
            FROM guilds
            WHERE id=$1
        `, [guild.id]);
        if (guildAddQuery.rowCount === 0) {
            console.log('Joined new guild, making database entry...')
            await client.database.query(`
                INSERT INTO guilds (id, disabledmodules, prefix)
                VALUES (
                    $1,
                    ARRAY[]::VARCHAR[],
                    $2
                )
                RETURNING id;
            `, [guild.id, process.env.prefix || '!']);
        }
    }
}