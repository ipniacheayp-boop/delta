import express from 'express'
import prisma from '../prisma'
import { authMiddleware } from '../middleware/auth'
import { ensureAdmin } from '../middleware/rbac'

const router = express.Router()

// Admin-only stats endpoint
router.get('/stats', authMiddleware as any, ensureAdmin as any, async (req, res) => {
  try {
    const users = await prisma.user.count()
    const flights = await prisma.flight.count()
    const bookings = await prisma.booking.count()
    res.json({ users, flights, bookings })
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err })
  }
})

export default router
