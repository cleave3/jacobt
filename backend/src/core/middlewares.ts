import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    role: string
  }
  params: {
    id: string
  }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies.jwt

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' })
    return
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string; role: string }
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' })
  }
}
