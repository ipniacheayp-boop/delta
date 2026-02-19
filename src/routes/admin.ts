import express from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/auth";
import { ensureAdmin } from "../middleware/rbac";

const router = express.Router();

// Admin-only stats endpoint
router.get(
  "/stats",
  authMiddleware as any,
  ensureAdmin as any,
  async (req, res) => {
    try {
      const users = await prisma.user.count();
      const flights = await prisma.flight.count();
      const bookings = await prisma.booking.count();
      res.json({ users, flights, bookings });
    } catch (err) {
      res.status(500).json({ error: "Server error", details: err });
    }
  },
);

// Get all users (admin only)
router.get(
  "/users",
  authMiddleware as any,
  ensureAdmin as any,
  async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      res.json({ users });
    } catch (err) {
      res.status(500).json({ error: "Server error", details: err });
    }
  },
);

// Update user role (admin only)
router.patch(
  "/users/:id/role",
  authMiddleware as any,
  ensureAdmin as any,
  async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });
      res.json({ user });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to update user role", details: err });
    }
  },
);

// Get all bookings (admin only)
router.get(
  "/bookings",
  authMiddleware as any,
  ensureAdmin as any,
  async (req, res) => {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      res.json({ bookings });
    } catch (err) {
      res.status(500).json({ error: "Server error", details: err });
    }
  },
);

// Get all flights (admin only)
router.get(
  "/flights",
  authMiddleware as any,
  ensureAdmin as any,
  async (req, res) => {
    try {
      const flights = await prisma.flight.findMany({
        orderBy: { departureTime: "desc" },
        take: 100,
      });
      res.json({ flights });
    } catch (err) {
      res.status(500).json({ error: "Server error", details: err });
    }
  },
);

// Create a new flight (admin only)
router.post(
  "/flights",
  authMiddleware as any,
  ensureAdmin as any,
  async (req, res) => {
    const data = req.body;
    try {
      const flight = await prisma.flight.create({ data });
      res.json({ flight });
    } catch (err) {
      res.status(400).json({ error: "Invalid flight data", details: err });
    }
  },
);

// Update flight status (admin only)
router.patch(
  "/flights/:id/status",
  authMiddleware as any,
  ensureAdmin as any,
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const flight = await prisma.flight.update({
        where: { id },
        data: { status },
      });
      res.json({ flight });
    } catch (err) {
      res
        .status(400)
        .json({ error: "Failed to update flight status", details: err });
    }
  },
);

// Delete a flight (admin only)
router.delete(
  "/flights/:id",
  authMiddleware as any,
  ensureAdmin as any,
  async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.flight.delete({ where: { id } });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: "Failed to delete flight", details: err });
    }
  },
);

export default router;
