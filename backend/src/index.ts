import app from './core/app'
import { env } from './config/env'
import prisma from './utils/prisma'

const startServer = async () => {
    try {
        // Test DB connection
        await prisma.$connect()
        console.log('✅ Connected to database')

        app.listen(env.port, () => {
            console.log(`🚀 Server is running on port ${env.port} in ${env.nodeEnv} mode`)
        })
    } catch (error) {
        console.error('❌ Failed to start server:', error)
        process.exit(1)
    }
}

startServer()
