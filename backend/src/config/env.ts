import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const env = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'super-secret-key-change-me',
    databaseUrl: process.env.DATABASE_URL,
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
    vapidSubject: process.env.VAPID_SUBJECT || 'mailto:admin@jacobt.com',
    frontendUrls: process.env.FRONTEND_URLS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
}
