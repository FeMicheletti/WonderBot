import fs from 'fs';
import path from 'path';
import { CommandLoader } from './app/commandLoader';
import logger from './shared/utils/logger.util';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import env from './config/env';

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

    public async clearCommands(rest: REST): Promise<void> {
        await rest.put(
            Routes.applicationCommands( env.clientId ),
            { body: [] }
        );
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
        const rest = new REST({
            version: "10",
            timeout: 30_000,
        }).setToken(env.discordToken);

        try {
            logger.info(`Registrando ${commands.length} comando(s)...`);

            await this.withTimeout(
                rest.put(
                    Routes.applicationCommands(env.clientId),
                    { body: commands }
                ),
                30_000,
                "Timeout ao registrar comandos globais no Discord."
            );

            logger.info("Comandos registrados com sucesso.");
        } catch (error) {
            logger.error("Erro ao registrar comandos:", error);
            throw error;
        }
    }

    private async withTimeout<T>( promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
        let timeout: NodeJS.Timeout;

        const timeoutPromise = new Promise<never>((_, reject) => {
            timeout = setTimeout(() => {
                reject(new Error(errorMessage));
            }, timeoutMs);
        });

        try {
            return await Promise.race([promise, timeoutPromise]);
        } finally {
            clearTimeout(timeout!);
        }
    }
}

new Deploy()
	.run()
	.then(() => {
		logger.info("Processo de deploy encerrado.");
		process.exit(0);
	})
	.catch((error) => {
		logger.error("Erro fatal no deploy:", error);
		process.exit(1);
	});