import env from "./config/env";
import logger from "./shared/utils/logger.util";
import { AppClient } from "./app/client";
import { CommandLoader } from "./app/commandLoader";
import { EventLoader } from "./app/eventLoader";

async function bootstrap() {
    try {
        const client = new AppClient();

        await new CommandLoader().loadCommands(client);
        await new EventLoader().loadEvents(client);

        await client.login(env.discordToken);

        logger.info('Inicialização concluída com sucesso.');
    } catch (error) {
        logger.error('Erro ao iniciar a aplicação.', error);
        process.exit(1);
    }
}

bootstrap();