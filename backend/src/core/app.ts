import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from '../config/env'
import router from '../routes/router'

const app: Application = express()

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: env.frontendUrls,
    credentials: true,
}))
app.use('/api', router)
// Placeholder for routes
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', environment: env.nodeEnv })
})

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).json({
        message: err.message || 'Internal Server Error',
        ...(env.nodeEnv === 'development' && { stack: err.stack })
    })
})

export default app
