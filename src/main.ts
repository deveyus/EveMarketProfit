import pkg, { Result } from 'ts-results';
const { Err, Ok } = pkg;
import { PrismaClient, config, marketTypes } from "@prisma/client";
import chalk from "chalk";



// I'll need this later
// const Jita_Region_ID = 10000002;
// const respMarketData = await fetch(`https://esi.evetech.net/latest/markets/${Jita_Region_ID}/orders/?datasource=tranquility&order_type=all&page=1&type_id=${item.id}`)

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

async function DBfillMarketTypes(data: IItemAndGroup): Promise<Result<marketTypes, unknown>> {
    try {
        const marketTypes = await prisma.marketTypes.upsert({
            where: {
                typeID: data.id
            },
            update: {

            },
            create: {
                typeID: data.id,
                groupID: data.group
            }
        })
        return Ok(marketTypes);
    } catch (e: unknown) {
        return Err(e);
    }
}

async function addConfig(): Promise<Result<config, unknown>> {
    try {
        const result = await DBaddConfig();
        return Ok(result);

    } catch (e: unknown) {
        console.log(e)
        return Err(e)
    }
}

interface IItemAndGroup {
    id: number,
    group: number
}

async function getAllMarketIDs(): Promise<Result<void, Error>> {
    const respMarketGroups = await fetch(`https://esi.evetech.net/latest/markets/groups/?datasource=tranquility`)

    if (!respMarketGroups.ok) return Err(new Error(`There was an error with the request to Market Groups: ${respMarketGroups.statusText}` ))

    const marketGroups = await respMarketGroups.json()
    marketGroups.forEach(async (group: any) => {
        const respMarketTypes = await fetch(`https://esi.evetech.net/latest/markets/groups/${group}/?datasource=tranquility&language=en`)

        if (!respMarketTypes.ok) return Err(new Error("There was an error with the request to Market Types"))

        const marketType = await respMarketTypes.json()
        if (marketType.types.length < 1) return;

        for (const item of marketType.types) {
            if (typeof item != "number") continue;
            if (typeof group != "number") continue;
            console.log(`Adding: TypeID: ${item}, groupID: ${group}}`)
            await DBfillMarketTypes({id: item, group: group})
        }
        return;
    })
    return Ok.EMPTY;
}
//     });
//     for await (const group of marketGroups) {
//         const respMarketTypes = await fetch(`https://esi.evetech.net/latest/markets/groups/${group}/?datasource=tranquility&language=en`)

//         if (!respMarketTypes.ok) return Err(new Error("There was an error with the request to Market Types"))

//         const marketType = await respMarketTypes.json()
//         if (marketType.types.length < 1) continue;

//         for (const item of marketType.types) {
//             if (typeof item != "number") continue;
//             if (typeof group != "number") continue;
//             console.log(`Adding: TypeID: ${item}, groupID: ${group}}`)
//             await DBfillMarketTypes({id: item, group: group})
//         }

//     }
    // return Ok.EMPTY;
// }


const res = await getAllMarketIDs();
console.log(res)

const addConfigResult = await addConfig();
console.log(chalk.blue(`Result of Adding a Config: ${addConfigResult.val}`));




