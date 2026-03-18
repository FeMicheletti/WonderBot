import logger from "../shared/utils/logger.util";
import fs from "fs";
import path from "path";

export class EventLoader {
    async loadEvents(client: any): Promise<void> {
        const eventsPath = path.join(__dirname, '..', 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.event.ts'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath).default;

            if (!event?.name || !event?.execute) {
                logger.warn(`Evento inválido ignorado: ${filePath}`);
                continue;
            }

            if (event.once) {
                client.once(event.name, (...args: any[]) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args: any[]) => event.execute(...args, client));
            }

            logger.info(`Evento carregado: ${event.name}`);
        }
    }
}