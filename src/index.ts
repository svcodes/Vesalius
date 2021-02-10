import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from "discord-akairo";
import { Snowflake } from "discord.js";

// Change Directory to right one
if (!process.cwd().endsWith('build'))
    process.chdir('build');

// Load environment variables from config.json if not present.
const config = require('../config.json');
for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
        process.env[key] = config[key];
    }
}

class Bot extends AkairoClient {
    public commandHandler: CommandHandler;
    public listenerHandler: ListenerHandler;
    public inhibitorHandler: InhibitorHandler;

    constructor() {
        let ownerID: Snowflake[];
        // @ts-ignore
        if (process.env['owner'] instanceof Array) {
            ownerID = process.env['owner'];
        } else {
            ownerID = [process.env['owner']];
        }
        super({
            ownerID
        }, {
            disableMentions: 'everyone'
        });

        this.commandHandler = new CommandHandler(this, {
            directory: './commands/',
            prefix: process.env.prefix,
            commandUtil: true
        });
        this.inhibitorHandler = new InhibitorHandler(this, {
            // directory: './inhibitors/' Disabled to prevent errors when no files in directory
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: './listeners/'
        });

        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);

        this.commandHandler.loadAll();
        // this.inhibitorHandler.loadAll();
        this.listenerHandler.loadAll();

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler
        });        
    }
}

const client = new Bot();

client.login(process.env.DiscordAPIToken);

client.on('ready', () => {
    if (!client.user) return;
    console.log(`Logged in as ${client.user.tag}`);
});

process.once('SIGUSR2', function () {
    console.log('Graceful shutdown...')
    client.destroy();
    process.exit(0);
});