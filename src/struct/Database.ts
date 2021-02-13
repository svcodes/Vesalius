import { Collection } from "discord.js";
import { Snowflake } from "discord.js";
import { Pool } from "pg";
import { VesaliusBot } from "./VesaliusBot";

export interface GuildSchema {
    id: Snowflake;
    disabledmodules: Array<string>;
    prefix: string;
    minecraftstatusaddress: string | null;
}

export interface DatabaseCache {
    guilds: Collection<GuildSchema['id'], GuildSchema>;
}

export class DatabaseManager {
    public pool: Pool;
    public query: Pool["query"];
    public cache: DatabaseCache;

    constructor(public client: VesaliusBot) {
        this.pool = new Pool(this.client.databaseOptions);
        this.query = this.pool.query.bind(this.pool);
        this.cache = {
            guilds: new Collection()
        };
    }
    
    async setup(): Promise<void> {
        const tables = await this.query(`
            SELECT tablename
            FROM pg_tables;
        `);
        tables.rows.forEach(row => this.cache[row] = []);
        const guildsTable = tables.rows.find(row => row.tablename === 'guilds');
        if (!guildsTable) {
            console.log("Table 'guilds' doesn't exist, creating...");
            await this.query(`
                CREATE TABLE IF NOT EXISTS guilds (
                    id VARCHAR NOT NULL PRIMARY KEY,
                    disabledmodules VARCHAR [] NOT NULL,
                    prefix VARCHAR(5) NOT NULL,
                    minecraftstatusaddress VARCHAR(256)
                );
            `);
        } else {
            const guildsQuery = await this.query(`
                SELECT * FROM guilds;
            `);
            guildsQuery.rows.forEach((row: GuildSchema) => {
                this.cache.guilds.set(row.id, row);
            });
        }
        return;
    }

    async getPrefix(id: Snowflake): Promise<string> {
        if (this.cache.guilds.has(id)) {
            return this.cache.guilds.get(id).prefix;
        } else {
            const guildQuery = await this.query(`
                SELECT * FROM guilds WHERE id=$1;
            `, [id]);
            if (guildQuery.rowCount === 1) {
                const prefix = (guildQuery.rows[0] as GuildSchema).prefix;
                this.cache.guilds.set(id, guildQuery.rows[0]);
                return prefix;
            } else {
                throw new Error(`Database returned ${guildQuery.rowCount} prefixes for given guild id.`);
            }
        }
    }

    async setPrefix(id: Snowflake, prefix: string): Promise<string> {
        if (this.cache.guilds.has(id) && this.cache.guilds.get(id).prefix === prefix)
            return prefix;
        const updateQuery = await this.query(`
        UPDATE guilds
        SET prefix=$1
        WHERE id=$2
        RETURNING *;
        `, [prefix, id]);
        if (updateQuery.rowCount !== 1) {
            throw new Error(`Database returned ${updateQuery.rowCount} guilds matching the criteria`);
        }
        if (!this.cache.guilds.has(id)) {
            this.cache.guilds.set(id, updateQuery.rows[0])
        }
        this.cache.guilds.get(id).prefix = prefix;
        return (updateQuery.rows[0] as GuildSchema).prefix;
    }

    async getDefaultMinecraftAddress(id: Snowflake): Promise<string> {
        if (this.cache.guilds.has(id)) {
            return this.cache.guilds.get(id).minecraftstatusaddress;
        } else {
            const guildQuery = await this.query(`
                SELECT * FROM guilds WHERE id=$1;
            `, [id]);
            if (guildQuery.rowCount === 1) {
                const address = (guildQuery.rows[0] as GuildSchema).minecraftstatusaddress;
                this.cache.guilds.set(id, guildQuery.rows[0]);
                return address;
            } else {
                throw new Error(`Database returned ${guildQuery.rowCount} addresses for given guild id.`);
            }
        }
    }

    async setDefaultMinecraftAddress(id: Snowflake, address: string): Promise<string> {
        if (this.cache.guilds.has(id) && this.cache.guilds.get(id).minecraftstatusaddress === address)
            return address;
        const updateQuery = await this.query(`
            UPDATE guilds
            SET minecraftstatusaddress=$1
            WHERE id=$2
            RETURNING *;
        `, [address, id]);
        if (updateQuery.rowCount !== 1) {
            throw new Error(`Database returned ${updateQuery.rowCount} guilds matching the criteria`);
        }
        if (!this.cache.guilds.has(id)) {
            this.cache.guilds.set(id, updateQuery.rows[0])
        }
        this.cache.guilds.get(id).minecraftstatusaddress = address;
        return (updateQuery.rows[0] as GuildSchema).minecraftstatusaddress;
    }
}