import app from './core/app'
import { env } from './config/env'
import prisma from './utils/prisma'

const startServer = async () => {
    try {
        // Test DB connection
        await prisma.$connect()
        console.log('✅ Connected to database')

        const server = app.listen(env.port, () => {
            console.log(`🚀 Server is running on port ${env.port} in ${env.nodeEnv} mode`)
        })

        server.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${env.port} is already in use. Please check if another process or macOS AirPlay Receiver is using this port.`)
            } else {
                console.error('❌ Server error:', error)
            }
            process.exit(1)
        })
    } catch (error) {
        console.error('❌ Failed to start server:', error)
        process.exit(1)
    }
}

startServer()
