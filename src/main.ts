import pkg, { Result } from 'ts-results';
const { Err, Ok } = pkg;
import { PrismaClient, config, marketTypes } from "@prisma/client";
import chalk from "chalk";
const Jita_Region_ID = 10000002;
const prisma = new PrismaClient();

async function DBaddConfig(): Promise<config> {
    const config = await prisma.config.create({
        data: {
            key: "dbFile",
            value: "markets.db"
        }
    })
    return config;
}

async function DBfillMarketTypes(data: { typeID: number; eTag: string; cacheExpiry: any; }): Promise<Result<marketTypes, unknown>> {
    try {
        const marketTypes = await prisma.marketTypes.upsert({
            where: {
                typeID: data.typeID,
            },
            update: {

            },
            create: {
                typeID: data.typeID,
                eTag: data.eTag,
                cacheExpiry: data.cacheExpiry
            }
        })
        return Ok(marketTypes);
    } catch (e: unknown) {
        return Err(e);
    }
}
// async function DBgetMarketTypes(): Promise<marketTypes[]> {
//     const marketTypes = await prisma.marketTypes.findMany();
//     return marketTypes;
// }
// DBaddConfig()
//     .then(async () => {
//         await prisma.$disconnect()
//     })
//     .catch(async (error) => {
//         console.log(error)
//         await prisma.$disconnect()
//         process.exit()
//     })

async function addConfig(): Promise<Result<config, unknown>> {
    try {
        const result = await DBaddConfig();
        return Ok(result);

    } catch (e: unknown) {
        console.log(e)
        return Err(e)
    }
}


async function getAllMarketIDs(): Promise<Result<number[], Error>> {
    let results = [];
    const url = "https://esi.evetech.net/latest/markets/groups/?datasource=tranquility";
    const respMarketGroups = await fetch(url)
    let marketGroups;
    if (!respMarketGroups.ok) return Err(new Error("There was an error with the request to Market Groups"))

    marketGroups = await respMarketGroups.json()
    for (const group of marketGroups) {
        const respMarketTypes = await fetch(`https://esi.evetech.net/latest/markets/groups/${group}/?datasource=tranquility&language=en`)

        if (!respMarketTypes.ok) return Err(new Error("There was an error with the request to Market Types"))

        const marketType = await respMarketTypes.json()
        if (marketType.types.length < 1) continue;

        results.push(...marketType.types)
        console.log(marketType.types);
        // const dbResult = DBUpdateMarketTypes(group, marketType)

    }
    return Ok(results);
}

async function fillMarketIDs(IDs: number[]) {
    for (const ID of IDs) {
        const respMarketData = await fetch(`https://esi.evetech.net/latest/markets/${Jita_Region_ID}/orders/?datasource=tranquility&order_type=all&page=1&type_id=${ID}`)
        if (!respMarketData.ok) return Err(new Error(`Failure when querying Item Order for ${ID}`))
        const orders = await respMarketData.json();
        const highest = findHighestBuy(orders)
        if (highest.err) continue;
        const lowest = findLowestSell(orders);
        if (lowest.err) continue;
        let expiry;
        let rawExpiry = respMarketData.headers.get("expires")
        let eTag;
        let rawETag = respMarketData.headers.get("etag")
        if (typeof rawETag != "string") continue;
        if (typeof rawExpiry == "string") expiry = new Date(Date.parse(rawExpiry))
        DBfillMarketTypes({
            typeID: ID,
            eTag: rawETag,
            cacheExpiry: expiry
        })
    }
};

function findHighestBuy(orders: any[]): Result<number, Error> {
    let highest = 0;
    for (const order of orders) {
        if (order.is_buy_order && order.price > highest) highest = order.price;
    }

    if (highest == 0) return Err(new Error("No Buy Orders"));
    return Ok(highest);
}

function findLowestSell(orders: any[]): Result<number, Error> {
    let lowest = Number.MAX_SAFE_INTEGER;
    for (const order of orders) {
        if (!order.is_buy_order && order.price < lowest) lowest = order.price;
    }

    if (lowest == Number.MAX_SAFE_INTEGER) return Err(new Error("No Sell Orders"));
    return Ok(lowest);
}

const res = await getAllMarketIDs();
if (res.ok) fillMarketIDs(res.val);

const addConfigResult = await addConfig();
console.log(chalk.blue(`Result of Adding a Config: ${addConfigResult.val}`));




