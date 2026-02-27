import prisma from '../../utils/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env'

export class AuthService {
    async login(phone: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { phone },
        })

        if (!user) {
            throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            throw new Error('Invalid credentials')
        }

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            env.jwtSecret,
            { expiresIn: '24h' }
        )

        const refreshToken = jwt.sign(
            { userId: user.id },
            env.jwtSecret,
            { expiresIn: '7d' } // Refresh token valid for 7 days
        )

        const { password: _, ...userWithoutPassword } = user

        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        }
    }

    async getUserById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
        })

        if (!user) {
            throw new Error('User not found')
        }

        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
    }

    async refresh(refreshToken: string) {
        try {
            // Verify the refresh token
            const decoded = jwt.verify(refreshToken, env.jwtSecret) as { userId: string }

            // Re-fetch the user to get the latest role
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            })

            if (!user) {
                throw new Error('User not found')
            }

            // Generate a new access token
            const accessToken = jwt.sign(
                { userId: user.id, role: user.role },
                env.jwtSecret,
                { expiresIn: '24h' }
            )

            return {
                accessToken,
                user: { id: user.id, phone: user.phone, role: user.role, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt }
            }
        } catch (error) {
            throw new Error('Invalid or expired refresh token')
        }
    }
}
