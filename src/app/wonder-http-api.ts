import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { Client } from "discord.js";
import logger from "../shared/utils/logger.util";
import { InvalidDmPayloadError, WonderDmPayload, WonderDmService } from "../modules/integrations/services/wonder-dm.service";

export class WonderHttpApi {
    private static server: ReturnType<typeof createServer> | null = null;

    static start(client: Client): void {
        if (this.server) return;

        const apiKey = process.env.WONDER_API_KEY;
        const port = Number(process.env.WONDER_API_PORT ?? 3100);

        if (!apiKey || apiKey.length < 32) {
            logger.warn("[WonderAPI] API desativada: configure WONDER_API_KEY com pelo menos 32 caracteres.");
            return;
        }

        if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("WONDER_API_PORT inválida.");

        this.server = createServer(async (req, res) => {
            const respond = (status: number, data: object) => {
                if (res.headersSent) return;

                res.writeHead(status, {
                    "Content-Type": "application/json; charset=utf-8",
                    "Cache-Control": "no-store",
                });

                res.end(JSON.stringify(data));
            };

            if (req.method === "GET" && req.url === "/health") {
                respond(client.isReady() ? 200 : 503, { status: client.isReady() ? "online" : "offline" });
                return;
            }

            if (req.url !== "/internal/v1/dm") {
                respond(404, { error: "Not found" });
                return;
            }

            if (req.method !== "POST") {
                respond(405, { error: "Method not allowed" });
                return;
            }

            const authorized = this.isAuthorized(req.headers.authorization, apiKey);

            if (!authorized) {
                respond(401, { error: "Unauthorized" });
                return;
            }

            if (!client.isReady()) {
                respond(503, { error: "Discord client unavailable" });
                return;
            }

            try {
                const payload = await this.readBody(req);
                const result = await WonderDmService.send(client, payload as WonderDmPayload);

                respond(200, result);
            } catch (error) {
                if (error instanceof InvalidDmPayloadError) {
                    respond(400, { error: error.message });
                    return;
                }

                if (error instanceof SyntaxError) {
                    respond(400, { error: "JSON inválido." });
                    return;
                }

                if (error instanceof Error && error.message === "Payload too large") {
                    respond(413, { error: "Payload muito grande." });
                    return;
                }

                const discordCode = (error as { code?: number })?.code;

                if (discordCode === 50007) {
                    respond(403, { error: "Não foi possível enviar DM para esse usuário." });
                    return;
                }

                if (discordCode === 10013) {
                    respond(404, { error: "Usuário do Discord não encontrado." });
                    return;
                }

                logger.error("[WonderAPI] Erro ao enviar DM:", error);
                respond(502, { error: "Falha ao enviar mensagem pelo Discord." });
            }
        });

        this.server.on("error", (error) => {
            logger.error("[WonderAPI] Erro no servidor HTTP:", error);
        });

        this.server.listen(port, "0.0.0.0", () => {
            logger.info(`[WonderAPI] HTTP iniciada na porta ${port}.`);
        });
    }

    private static isAuthorized(authorization: string | undefined, apiKey: string): boolean {
        const received = Buffer.from(authorization ?? "");
        const expected = Buffer.from(`Bearer ${apiKey}`);

        return received.length === expected.length &&
        timingSafeEqual(received, expected);
    }

    private static async readBody(req: IncomingMessage): Promise<unknown> {
        const chunks: Buffer[] = [];
        let size = 0;

        for await (const chunk of req) {
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

            size += buffer.length;
            if (size > 16 * 1024) throw new Error("Payload too large");

            chunks.push(buffer);
        }

        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    }
}