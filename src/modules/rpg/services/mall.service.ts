import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { MallDatabase } from "../../../storage/tables/mall.table";
import { MallItem, MallTableData } from "../../../storage/interfaces/mall.interface";
import { randomInt } from "../../../shared/utils/randomInt.util";
import { shuffle } from "../../../shared/utils/shuffle.util";

type ShopType = "weapon" | "normal";

type GeneratedMallItem = MallItem & {
    stock: number;
    originalPrice?: number;
    isOnSale?: boolean;
    discountPercent?: number;
    isClandestine?: boolean;
};

export class MallService {
    private static readonly WEAPON_SHOP_CHANCE = 0.3;
    private static readonly MOSQUETE_CHANCE = 0.35;
    private static readonly PROMO_CHANCE = 0.05;
    private static readonly PROMO_DISCOUNT = 0.6;

    private static readonly NORMAL_MIN_ITEMS = 1;
    private static readonly NORMAL_MAX_ITEMS = 5;

    private static readonly WORLD_MAP_CHANCE = 0.3;
    private static readonly COMPASS_BASE_CHANCE = 0.6;
    private static readonly COMPASS_MAP_CHANCE = 0.3;
    private static readonly DICTIONARY_CHANCE = 0.6;

    private static readonly WEAPON_MIN_ITEMS = 1;
    private static readonly WEAPON_MAX_ITEMS = 5;

    private static readonly CLANDESTINE_WEAPON_CHANCE = 0.3;
    private static readonly CLANDESTINE_PRICE_MULTIPLIER = 1.4;

    static async getAllItems() {
        const db = new MallDatabase();
        return db.getAll();
    }

    static async getItemById(id: string) {
        const db = new MallDatabase();
        return db.findById(id);
    }

    static async execute() {
        const items = await MallService.getAllItems();
        const generatedShop = MallService.generateShop(items);

        return MallService.buildShopEmbed(generatedShop.items, generatedShop.shopType);
    }

    static generateShop(items: MallTableData): { shopType: ShopType; items: Record<string, GeneratedMallItem>; } {
        const allItems = Object.values(items);
        const isWeaponShop = Math.random() < MallService.WEAPON_SHOP_CHANCE;

        const generatedItems = isWeaponShop ? MallService.generateWeaponShop(allItems) : MallService.generateNormalShop(allItems);

        const mapped = Object.fromEntries( generatedItems.map((item) => [item.id, item]) );

        return { shopType: isWeaponShop ? "weapon" : "normal", items: mapped };
    }

    private static generateWeaponShop(items: MallItem[]): GeneratedMallItem[] {
        const weaponIds = ["3", "4", "5"];
        const mosqueteId = "6";

        const baseWeapons = items.filter((item) => weaponIds.includes(item.id));
        const mosquete = items.find((item) => item.id === mosqueteId);

        const amount = randomInt( MallService.WEAPON_MIN_ITEMS, MallService.WEAPON_MAX_ITEMS );

        const selectedWeapons = shuffle([...baseWeapons]).slice(0, amount);

        if (mosquete && Math.random() < MallService.MOSQUETE_CHANCE) selectedWeapons.push(mosquete);

        return selectedWeapons.map((item) => MallService.applyItemModifiers(item));
    }

    private static generateNormalShop(items: MallItem[]): GeneratedMallItem[] {
        const weaponIds = ["3", "4", "5", "6"];
        const normalPool = items.filter((item) => !weaponIds.includes(item.id));

        const mapaMundi = normalPool.find((item) => item.id === "14");
        const bussola = normalPool.find((item) => item.id === "11");
        const dicionario = normalPool.find((item) => item.id === "15");

        const poolWithoutSpecials = normalPool.filter( (item) => !["11", "14", "15"].includes(item.id) );

        const amount = randomInt( MallService.NORMAL_MIN_ITEMS, MallService.NORMAL_MAX_ITEMS );

        const selected = shuffle([...poolWithoutSpecials]).slice( 0, Math.max(0, amount - 2) );

        let mapaEntrou = false;
        if (mapaMundi && Math.random() < MallService.WORLD_MAP_CHANCE) {
            selected.push(mapaMundi);
            mapaEntrou = true;
        }

        const bussolaChance = mapaEntrou ? MallService.COMPASS_MAP_CHANCE : MallService.COMPASS_BASE_CHANCE;
        if (bussola && Math.random() < bussolaChance) selected.push(bussola);

        if (dicionario && Math.random() < MallService.DICTIONARY_CHANCE) {
            selected.push(dicionario);
        }

        const generatedItems = shuffle(selected).map((item) => MallService.applyItemModifiers(item) );
        return MallService.addClandestineWeapons(generatedItems, items);
    }

    private static addClandestineWeapons( currentItems: GeneratedMallItem[], allItems: MallItem[] ): GeneratedMallItem[] {
        const shouldAddClandestineWeapons = Math.random() < MallService.CLANDESTINE_WEAPON_CHANCE;

        if (!shouldAddClandestineWeapons) return currentItems;

        const weaponIds = ["3", "4", "5", "6"];
        const existingIds = new Set(currentItems.map((item) => item.id));

        const availableWeapons = allItems.filter( (item) => weaponIds.includes(item.id) && !existingIds.has(item.id));

        if (availableWeapons.length === 0) return currentItems;

        const clandestineWeapons = shuffle([...availableWeapons]).slice( 0, randomInt(1, Math.min(2, availableWeapons.length)) );

        const adjustedWeapons = clandestineWeapons.map((item) => ({
            ...MallService.applyItemModifiers(item),
            originalPrice: item.price,
            price: Math.max( 1, Math.floor(item.price * MallService.CLANDESTINE_PRICE_MULTIPLIER) ),
            discountPercent: 40,
            isClandestine: true,
        }));

        return [...currentItems, ...adjustedWeapons];
    }

    private static applyItemModifiers(item: MallItem): GeneratedMallItem {
        const stock = randomInt(1, 5);
        const onSale = Math.random() < MallService.PROMO_CHANCE;

        if (!onSale) return { ...item, stock, isOnSale: false };

        const discountedPrice = Math.max( 1, Math.floor(item.price * (1 - MallService.PROMO_DISCOUNT)) );

        return { ...item, stock, originalPrice: item.price, price: discountedPrice, isOnSale: true, discountPercent: 60, };
    }

    static buildShopEmbed( items: Record<string, GeneratedMallItem>, shopType: ShopType) {
        const shopName = shopType === "weapon" ? "🔫 Loja de Armas" : "🛒 Loja Comum";

        const commonItems = Object.values(items).filter((item) => !item.isClandestine);
        const clandestineItems = Object.values(items).filter((item) => item.isClandestine);

        const commonText = Object.values(commonItems)
            .map((item) =>
                item.isOnSale
                    ? `**${item.name} 🔥**\n• 💰 **${item.price} MU** ~~${item.originalPrice} MU~~ (**-${item.discountPercent}%**) \n• 📦 **Estoque**: ${item.stock}`
                    : `**${item.name}**\n• 💰 **${item.price} MU** \n• 📦 **Estoque:** ${item.stock}`
            )
            .join("\n\n");

        const embed = new EmbedBuilder()
            .setTitle(shopName)
            .setDescription("Os itens disponíveis mudaram nesta visita.")
            .addFields({
                name: "\r\n**Itens disponíveis**",
                value: commonText || "Nenhum item disponível.",
                inline: false,
            });

        if (clandestineItems && Object.keys(clandestineItems).length > 0) {
            const clandestineText = Object.values(clandestineItems)
                .map((item) => `**${item.name}**\n• 💰 **${item.price} MU** ~~${item.originalPrice} MU~~ (**+${item.discountPercent}%**) \n• 📦 Estoque: ${item.stock}` )
                .join("\n\n");

            embed.addFields({ name: "\r\n**🕶️ Loja clandestina**", value: clandestineText, inline: false});
        }

        embed.setFooter({
            text: shopType === "weapon" ? "Armas raras podem ou não aparecer" : "Alguns itens especiais têm chance variável de aparecer",
        });

        return embed;
    }
}