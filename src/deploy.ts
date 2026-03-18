import fs from 'fs';
import path from 'path';
import { CommandLoader } from './app/commandLoader';
import logger from './shared/utils/logger.util';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import env from './config/env';
import { exit } from 'process';

class Deploy {
    CommandLoader: CommandLoader;

    constructor() {
        this.CommandLoader = new CommandLoader();
    }

    public async run(): Promise<void> {
        const commands = await this.getCommands();
        await this.deployCommands(commands);

        logger.info('Deploy finalizado');
    }

    private async getCommands(): Promise<SlashCommandBuilder[]> {
        const allCommands:  SlashCommandBuilder[] = [];

        const commandsPath = path.join(__dirname, 'modules');
        const commandFiles = this.CommandLoader.getAllCommandFiles(commandsPath);

        for (const filePath of commandFiles) {
            const command = require(filePath).default;

            if (!command?.data || !command?.execute) {
                logger.warn(`Comando inválido ignorado: ${filePath}`);
                continue;
            }

            allCommands.push(command.data.toJSON());
            logger.info(`Comando carregado: ${command.data.name}`);
        }

        return allCommands;
    }

    private async deployCommands(commands: SlashCommandBuilder[]): Promise<void> {
        const rest = new REST({ version: '10' }).setToken(env.discordToken);

        try {
            console.log(`Registrando ${commands.length} comando(s)...`);

            await rest.put( Routes.applicationGuildCommands( env.clientId, env.guildId ), { body: commands } );

            console.log('Comandos registrados com sucesso.');
        } catch (error) {
            console.error(error);
        }
    }
}

new Deploy().run();