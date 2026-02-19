import express from "express";
import { PrismaClient } from "@prisma/client";
import prisma from "../prisma";

const router = express.Router();

// Create a booking (initial, before payment)
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      outboundFlightId,
      returnFlightId,
      totalPrice,
      currency,
      cabinClass,
      tripType,
      passengers,
    } = req.body;
    if (!outboundFlightId)
      return res.status(400).json({ error: "outboundFlightId required" });
    if (!userId)
      return res.status(400).json({ error: "userId required for booking" });
    const bookingReference = Math.random()
      .toString(36)
      .slice(2, 9)
      .toUpperCase();
    const booking = await prisma.booking.create({
      data: {
        bookingReference,
        userId: userId,
        totalPrice: Number(totalPrice) || 0,
        currency: currency || "USD",
        cabinClass,
        tripType,
        milesEarned: 0,
        outboundFlightId,
        returnFlightId: returnFlightId || null,
        passengers: passengers || null,
        paymentStatus: "pending",
      },
    });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err });
  }
});

// Get booking by PNR
router.get("/pnr/:pnr", async (req, res) => {
  try {
    const { pnr } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { bookingReference: pnr },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err });
  }
});

// Cancel booking
router.patch("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" } as any,
    });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err });
  }
});

// Reserve seat - uses database for AWS/multi-container compatibility
router.post("/:bookingId/reserve-seat", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { flightId, seat } = req.body;
    if (!flightId || !seat)
      return res.status(400).json({ error: "flightId and seat required" });

    // Use database transaction for seat reservation
    const result = await prisma.$transaction(async (tx: PrismaClient) => {
      // Get current flight and its reserved seats
      const flight = await tx.flight.findUnique({
        where: { id: flightId },
      });

      if (!flight) {
        throw new Error("Flight not found");
      }

      // Get current reserved seats or initialize
      const reservedSeats =
        (flight.reservedSeats as Record<string, boolean>) || {};

      // Check if seat is already taken
      if (reservedSeats[seat]) {
        throw new Error("SEAT_ALREADY_TAKEN");
      }

      // Reserve the seat
      reservedSeats[seat] = true;

      // Update flight with reserved seat
      await tx.flight.update({
        where: { id: flightId },
        data: { reservedSeats: reservedSeats as any },
      });

      // Update booking seatAssignments
      const existing = await tx.booking.findUnique({
        where: { id: bookingId },
      });
      const newAssign = {
        ...((existing?.seatAssignments as Record<string, string>) || {}),
        [flightId]: seat,
      };
      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: { seatAssignments: newAssign as any },
      });

      return booking;
    });

    res.json({ ok: true, booking: result });
  } catch (err: any) {
    if (err.message === "SEAT_ALREADY_TAKEN") {
      return res.status(409).json({ error: "Seat already taken" });
    }
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Mock payment endpoint
router.post("/:bookingId/pay", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethod = "mock_card" } = req.body;
    // simulate payment processing
    const success = true;
    if (!success) return res.status(402).json({ error: "Payment failed" });
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: "paid", status: "CONFIRMED" } as any,
    });
    res.json({ ok: true, booking });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err });
  }
});

export default router;
