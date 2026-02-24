import { Response } from 'express'
import { PushService } from './push.service'
import { AuthRequest } from '../../core/middlewares'

export class PushController {
    private pushService: PushService

    constructor() {
        this.pushService = new PushService()
    }

    async subscribe(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }

            const subscription = req.body
            if (!subscription || !subscription.endpoint || !subscription.keys) {
                res.status(400).json({ message: 'Invalid subscription object' })
                return
            }

            await this.pushService.subscribe(req.user.userId, subscription)
            res.status(201).json({ success: true, message: 'Subscribed to push notifications' })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }

    async unsubscribe(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }

            const { endpoint } = req.body
            await this.pushService.unsubscribe(req.user.userId, endpoint)

            res.status(200).json({ success: true, message: 'Unsubscribed successfully' })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }

    async testPush(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            }

            const payloadStr = { title: 'Test Notification', body: 'This is a test notification.' }
            await this.pushService.sendNotificationToUser(req.user.userId, payloadStr)

            res.status(200).json({ success: true, message: 'Test notification sent successfully' })
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
        }
    }
}
