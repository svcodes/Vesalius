import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from "discord-akairo";

// Load environment variables from config.json if not present.
const config = require('../config.json');
for (let k in config) {
    if (typeof process.env[k] === 'undefined') {
        process.env[k] = config[k];
    }
}

class Bot extends AkairoClient {
    public commandHandler: CommandHandler;
    public listenerHandler: ListenerHandler;
    public inhibitorHandler: InhibitorHandler;

    constructor() {
        super({
            ownerID: '197664739763945472'
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