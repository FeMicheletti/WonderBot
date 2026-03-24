import { Client, Collection, GatewayIntentBits } from 'discord.js';

export class AppClient extends Client {
    commands: Collection<string, any>;

    constructor() {
        super({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });
        this.commands = new Collection();
    }
}