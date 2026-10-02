import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

export class AppClient extends Client {
    commands: Collection<string, any>;

    constructor() {
        super({ 
            intents: [ 
                GatewayIntentBits.Guilds, 
                GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.Reaction,
                Partials.User
            ]
        });
        this.commands = new Collection();
    }
}