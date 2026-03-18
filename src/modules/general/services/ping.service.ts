import { PingInput, PingOutput } from "../interfaces/ping.interface";

export class PingService {
    static execute(input: PingInput): PingOutput {
        const latency = input.replyCreatedTimestamp - input.interactionCreatedTimestamp;
        const apiPing = Math.round(input.wsPing);

        return {
            latency,
            apiPing,
            message: `🏓 Pong!\nLatência do bot: **${latency}ms**\nLatência da API: **${apiPing}ms**`,
        };
    }
}