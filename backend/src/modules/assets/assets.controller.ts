import { Request, Response } from 'express'
import { AssetsService } from './assets.service'
import { AuthRequest } from '../../core/middlewares'

export class AssetsController {
    private assetsService: AssetsService

    constructor() {
        this.assetsService = new AssetsService()
    }

    async createAsset(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
                res.status(403).json({ message: 'Forbidden: Admins only' })
                return
            }

            const asset = await this.assetsService.createAsset(req.body, req.user.userId)
            res.status(201).json({ success: true, asset })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }

    async updateAsset(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
                res.status(403).json({ message: 'Forbidden: Admins only' })
                return
            }

            const { id } = req.params
            const asset = await this.assetsService.updateAsset(id, req.body, req.user.userId)
            res.status(200).json({ success: true, asset })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }

    async deleteAsset(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
                res.status(403).json({ message: 'Forbidden: Admins only' })
                return
            }

            const { id } = req.params
            await this.assetsService.deleteAsset(id)
            res.status(200).json({ success: true, message: 'Asset deleted successfully' })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }

    async getAssets(req: Request, res: Response): Promise<void> {
        try {
            const assets = await this.assetsService.getAssets()
            res.status(200).json({ success: true, assets })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }

    async getAssetById(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const asset = await this.assetsService.getAssetById(id)
            res.status(200).json({ success: true, asset })
        } catch (error: any) {
            if (error.message === 'Asset not found') {
                res.status(404).json({ success: false, message: error.message })
            } else {
                res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
            }
        }
    }
}
