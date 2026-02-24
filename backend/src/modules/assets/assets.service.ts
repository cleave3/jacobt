import prisma from '../../utils/prisma'

export class AssetsService {
    async createAsset(data: any, userId: string) {
        return prisma.asset.create({
            data: {
                name: data.name,
                location: data.location,
                dimensions: data.dimensions,
                purchasePrice: data.purchasePrice,
                currentValue: data.currentValue,
                purchaseDate: new Date(data.purchaseDate),
                description: data.description,
                images: data.images || [],
                associatedUsersId: data.associatedUsersId || [],
                status: 'ACTIVE',
                submittedById: userId,
            },
        })
    }

    async updateAsset(id: string, data: any, userId: string) {
        return prisma.asset.update({
            where: { id },
            data: {
                name: data.name,
                location: data.location,
                dimensions: data.dimensions,
                purchasePrice: data.purchasePrice,
                currentValue: data.currentValue,
                description: data.description,
                images: data.images || [],
                associatedUsersId: data.associatedUsersId || [],
                ...(data.purchaseDate && { purchaseDate: new Date(data.purchaseDate) }),
                ...(data.status && { status: data.status }),
                updatedById: userId,
            },
        })
    }

    async deleteAsset(id: string) {
        return prisma.asset.delete({
            where: { id },
        })
    }

    async getAssets() {
        return prisma.asset.findMany({
            orderBy: { createdAt: 'desc' },
            include: { submittedBy: { select: { name: true } }, updatedBy: { select: { name: true } } },
        })
    }

    async getAssetById(id: string) {
        const asset = await prisma.asset.findUnique({
            where: { id },
            include: { submittedBy: { select: { name: true } }, updatedBy: { select: { name: true } } },
        })

        const associatedUsers = await prisma.user.findMany({
            where: { id: { in: asset?.associatedUsersId } },
        })

        if (!asset) {
            throw new Error('Asset not found')
        }

        return { ...asset, associatedUsers }
    }
}
