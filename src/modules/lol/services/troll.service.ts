import { ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions } from "discord.js";
import { DataDragonService } from "./data-dragon.service";

type TrollStyle = {
	name: string;
	description: string;
	itemTags: string[];
};

export class TrollService {
	private static readonly LANES = [
		"Top",
		"Jungle",
		"Mid",
		"ADC",
		"Support"
	];

	static async execute( interaction: ChatInputCommandInteraction ): Promise<InteractionEditReplyOptions> {
		const [version, champions, items] = await Promise.all([
			DataDragonService.getLatestVersion(),
			DataDragonService.getChampions(),
			DataDragonService.getItems(),
		]);

		const champion = this.pickRandom(champions);
		const lane = this.pickRandom(this.LANES);

		const buildItems = this.generateTrollBuild(items, lane);

		const championImageUrl = DataDragonService.getChampionImageUrl(
			version,
			champion.image.full
		);

		const itemList = buildItems
			.map((item, index) => `${index + 1}. **${item.name}**`)
			.join("\n");

		const embed = new EmbedBuilder()
			.setTitle("🤡 Build troll de LoL")
			.setColor(0x57f287)
			.setThumbnail(championImageUrl)
			.setDescription(
				[
					`**Campeão:** ${champion.name}`,
					`**Lane:** ${lane}`,
					`**Estilo:** ${style.name}`,
					`_${style.description}_`,
				].join("\n")
			)
			.addFields({
				name: "Build",
				value: itemList || "Não consegui gerar itens.",
				inline: false,
			})
			.setFooter({
				text: `Pedido por ${interaction.user.username}`,
			});

		return { embeds: [embed] };
	}

    private static generateTrollBuild( items: Awaited<ReturnType<typeof DataDragonService.getItems>>, lane: string ) {
        const boots = items.filter((item) => this.isBoot(item));
        const supportItems = items.filter((item) => this.isSupportItem(item));
        const finalItems = items.filter((item) => this.isFinalCompletedItem(item));

        const taggedFinalItems = finalItems.filter((item) => item.tags?.some((tag) => tags.includes(tag)) );

        const itemPool = taggedFinalItems.length >= 6 ? taggedFinalItems : finalItems;

        const selected: typeof items = [];

        const boot = this.pickRandom(boots);

        if (boot) selected.push(boot);

        if (lane === "Support") {
            const supportItem = this.pickRandom(supportItems);

            if (supportItem) selected.push(supportItem);
        }

        const remainingAmount = 6 - selected.length;

        const remainingPool = itemPool.filter( (item) => !selected.some((selectedItem) => selectedItem.id === item.id) );

        selected.push(...this.pickUniqueRandom(remainingPool, remainingAmount));

        return selected.slice(0, 6);
    }

	private static pickRandom<T>(items: T[]): T {
		return items[Math.floor(Math.random() * items.length)];
	}

	private static pickUniqueRandom<T>(items: T[], amount: number): T[] {
		const copy = [...items];
		const selected: T[] = [];

		while (copy.length > 0 && selected.length < amount) {
			const index = Math.floor(Math.random() * copy.length);
			const [item] = copy.splice(index, 1);
			selected.push(item);
		}

		return selected;
	}

    private static isBoot(item: Awaited<ReturnType<typeof DataDragonService.getItems>>[number]): boolean {
        return item.tags?.includes("Boots") && this.isFinalCompletedItem(item);
    }

    private static isSupportItem(item: Awaited<ReturnType<typeof DataDragonService.getItems>>[number]): boolean {
        const tags = item.tags ?? [];

        return (
            this.isFinalCompletedItem(item) &&
                (
                    tags.includes("GoldPer") ||
                    tags.includes("Vision") ||
                    item.name.toLowerCase().includes("atlas") ||
                    item.name.toLowerCase().includes("bússola") ||
                    item.name.toLowerCase().includes("canção sangrenta") ||
                    item.name.toLowerCase().includes("criassonhos") ||
                    item.name.toLowerCase().includes("oposição celestial") ||
                    item.name.toLowerCase().includes("trenó do solstício") ||
                    item.name.toLowerCase().includes("reino de zaz'zak")
                )
        );
    }

    private static isFinalCompletedItem(item: Awaited<ReturnType<typeof DataDragonService.getItems>>[number]): boolean {
        const tags = item.tags ?? [];

        if (!item.gold?.purchasable) return false;
        if (!item.maps?.["11"]) return false;

        if (tags.includes("Consumable")) return false;
        if (tags.includes("Trinket")) return false;

        if (item.into && item.into.length > 0) return false;

        if (!tags.includes("Boots") && item.gold.total < 1600) return false;

        return true;
    }
}