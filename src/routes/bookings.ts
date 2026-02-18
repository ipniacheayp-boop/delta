import express from "express";
import prisma from "../prisma";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, totalPrice, currency, cabinClass, tripType } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });
  const bookingReference = Math.random().toString(36).slice(2, 9).toUpperCase();
  const booking = await prisma.booking.create({
    data: {
      bookingReference,
      userId,
      totalPrice: Number(totalPrice) || 0,
      currency: currency || "USD",
      cabinClass,
      tripType,
      milesEarned: 0,
    },
  });
  res.json({ booking });
});

router.get("/pnr/:pnr", async (req, res) => {
  const { pnr } = req.params;
  const booking = await prisma.booking.findUnique({
    where: { bookingReference: pnr },
  });
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json({ booking });
});

router.patch("/:id/cancel", async (req, res) => {
  const { id } = req.params;
  const booking = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" } as any,
  });
  res.json({ booking });
});

export default router;
