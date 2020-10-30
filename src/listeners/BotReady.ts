import { Listener } from 'discord-akairo';

class BotReadyListener extends Listener {
    constructor() {
        super('botReady', {
            emitter: 'client',
            event: 'ready'
        });
    }

    exec() {
        console.log('Bot is loaded and ready!');
    }
}

module.exports = BotReadyListener;