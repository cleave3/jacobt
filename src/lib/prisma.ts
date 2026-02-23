import { paginate } from "prisma-extension-pagination";
import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = () => {
    return new PrismaClient({
        adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
    }).$extends({ model: { $allModels: { paginate } } })
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
