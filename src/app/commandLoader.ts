import logger from "../shared/utils/logger.util";
import fs from "fs";
import path from "path";

export class CommandLoader {
    async loadCommands(client: any): Promise<void> {
        const commandsPath = path.join(__dirname, '..', 'modules');
        const commandFiles = this.getAllCommandFiles(commandsPath);

        for (const filePath of commandFiles) {
            const command = require(filePath).default;

            if (!command?.data || !command?.execute) {
                logger.warn(`Comando inválido ignorado: ${filePath}`);
                continue;
            }

            client.commands.set(command.data.name, command);
            logger.info(`Comando carregado: ${command.data.name}`);
        }
    }

    getAllCommandFiles(dir: string): string[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        const files = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                files.push(...this.getAllCommandFiles(fullPath));
            } else if (entry.isFile() && entry.name.endsWith('.command.ts')) {
                files.push(fullPath);
            }
        }

        return files;
    }
}