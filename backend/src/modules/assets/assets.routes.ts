import { Router } from 'express'
import { AssetsController } from './assets.controller'
import { authenticate } from '../../core/middlewares'

const router = Router()
const assetsController = new AssetsController()

router.get('/', authenticate, assetsController.getAssets.bind(assetsController))
router.get('/:id', authenticate, assetsController.getAssetById.bind(assetsController))
router.post('/', authenticate, assetsController.createAsset.bind(assetsController))
router.put('/:id', authenticate, assetsController.updateAsset.bind(assetsController))
router.delete('/:id', authenticate, assetsController.deleteAsset.bind(assetsController))

export default router
