import { Client, EmbedBuilder } from "discord.js";

export type WonderDmPayload = {
    discordUserId: string;
    content?: string;
    embed?: {
        title?: string;
        description?: string;
        color?: string;
        thumbnailUrl?: string;
        imageUrl?: string;
        footer?: string;
        fields?: {
            name: string;
            value: string;
            inline?: boolean;
        }[];
    };
};

export class InvalidDmPayloadError extends Error {}

export class WonderDmService {
    static async send(client: Client, payload: WonderDmPayload) {
        this.validate(payload);

        const user = await client.users.fetch(payload.discordUserId);

        let embed: EmbedBuilder | undefined;

        if (payload.embed) {
            const data = payload.embed;

            embed = new EmbedBuilder().setColor(data.color ? parseInt(data.color.replace("#", ""), 16) : 0x5865f2).setTimestamp();

            if (data.title) embed.setTitle(data.title);
            if (data.description) embed.setDescription(data.description);
            if (data.thumbnailUrl) embed.setThumbnail(data.thumbnailUrl);
            if (data.imageUrl) embed.setImage(data.imageUrl);
            if (data.footer) embed.setFooter({ text: data.footer });
            if (data.fields?.length) embed.addFields(data.fields);
        }

        const message = await user.send({
            content: payload.content,
            embeds: embed ? [embed] : [],
            allowedMentions: { parse: [] },
        });

        return {
            success: true,
            messageId: message.id,
            userId: user.id,
        };
    }

    private static validate(payload: WonderDmPayload): void {
        if (!payload || typeof payload !== "object") throw new InvalidDmPayloadError("Payload inválido.");

        if (typeof payload.discordUserId !== "string" || !/^\d{17,20}$/.test(payload.discordUserId)) throw new InvalidDmPayloadError("discordUserId inválido.");

        if (payload.content !== undefined && (typeof payload.content !== "string" || payload.content.length > 2000)) throw new InvalidDmPayloadError("Conteúdo inválido ou muito longo.");

        if (!payload.content && !payload.embed) throw new InvalidDmPayloadError("Informe content ou embed.");

        const embed = payload.embed;
        if (!embed) return;

        if (typeof embed !== "object" || Array.isArray(embed)) throw new InvalidDmPayloadError("Embed inválido.");

        const checkText = (value: unknown, max: number, field: string) => {
            if (value !== undefined && (typeof value !== "string" || value.length > max)) throw new InvalidDmPayloadError(`${field} inválido.`);
        };

        checkText(embed.title, 256, "Título");
        checkText(embed.description, 4096, "Descrição");
        checkText(embed.footer, 2048, "Rodapé");

        if (embed.color !== undefined && (typeof embed.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(embed.color))) throw new InvalidDmPayloadError("Cor inválida. Use #RRGGBB.");

        for (const url of [embed.thumbnailUrl, embed.imageUrl]) {
            if (url === undefined) continue;

            try {
                if (typeof url !== "string" || new URL(url).protocol !== "https:") throw new Error();
            } catch {
                throw new InvalidDmPayloadError("As imagens precisam usar URLs HTTPS válidas.");
            }
        }

        if (embed.fields !== undefined) {
            if (!Array.isArray(embed.fields) || embed.fields.length > 25) throw new InvalidDmPayloadError("Campos do embed inválidos.");

            for (const field of embed.fields) {
                if (!field || 
                    typeof field.name !== "string" || 
                    !field.name.length || 
                    field.name.length > 256 || 
                    typeof field.value !== "string" || 
                    !field.value.length || 
                    field.value.length > 1024 || 
                    (field.inline !== undefined && typeof field.inline !== "boolean") ) {
                    throw new InvalidDmPayloadError("Campo do embed inválido.");
                }
            }
        }

        const total = [
            embed.title ?? "",
            embed.description ?? "",
            embed.footer ?? "",
            ...(embed.fields ?? []).flatMap((field) => [field.name, field.value])
        ].reduce((sum, value) => sum + value.length, 0);

        if (total > 6000) throw new InvalidDmPayloadError("O embed ultrapassou 6000 caracteres.");
    }
}