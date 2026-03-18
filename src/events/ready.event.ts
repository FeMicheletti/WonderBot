import { Events } from "discord.js";
import logger from "../shared/utils/logger.util";


export default {
    name: Events.ClientReady,
    once: true,

    async execute(readyClient: any) {
        logger.info(`Bot online como ${readyClient.user.tag}`);
    },
};