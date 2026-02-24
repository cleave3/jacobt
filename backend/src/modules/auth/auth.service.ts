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

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            env.jwtSecret,
            { expiresIn: '1d' }
        )

        const { password: _, ...userWithoutPassword } = user

        return {
            user: userWithoutPassword,
            token,
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
}
