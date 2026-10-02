import env from "./config/env";
import logger from "./shared/utils/logger.util";
import { AppClient } from "./app/client";
import { CommandLoader } from "./app/commandLoader";
import { EventLoader } from "./app/eventLoader";
import { startPresenceRotation } from "./app/startPresence";
import { AgendarRunnerService } from "./modules/agendar/services/agendar-runner.service";
import { WonderWatchdog } from "./app/wonder-watchdog";

async function bootstrap() {
    try {
        const client = new AppClient();

        await new CommandLoader().loadCommands(client);
        await new EventLoader().loadEvents(client);

        client.once("ready", () => {
            startPresenceRotation(client);
            AgendarRunnerService.start(client);
            WonderWatchdog.start(client);
        });

        await client.login(env.discordToken);


        logger.info('Inicialização concluída com sucesso.');
    } catch (error) {
        logger.error('Erro ao iniciar a aplicação.', error);
        process.exit(1);
    }
}

bootstrap();