import express from "express";
import prisma from "../prisma";

const router = express.Router();

// Search flight status by flight number
router.get("/flight/:flightNumber", async (req, res) => {
  try {
    const { flightNumber } = req.params;
    const flights = await prisma.flight.findMany({
      where: {
        flightNumber: {
          contains: flightNumber.toUpperCase(),
          mode: "insensitive",
        },
      },
      orderBy: { departureTime: "asc" },
      take: 10,
    });
    res.json({ flights });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err });
  }
});

// Search flight status by route (origin -> destination)
router.get("/route", async (req, res) => {
  try {
    const { origin, destination, date } = req.query;

    if (!origin || !destination) {
      return res
        .status(400)
        .json({ error: "Origin and destination are required" });
    }

    const whereClause: any = {
      originIata: String(origin).toUpperCase(),
      destinationIata: String(destination).toUpperCase(),
    };

    // Add date filter if provided
    if (date) {
      const searchDate = new Date(String(date));
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      whereClause.departureTime = {
        gte: searchDate,
        lt: nextDay,
      };
    }

    const flights = await prisma.flight.findMany({
      where: whereClause,
      orderBy: { departureTime: "asc" },
      take: 20,
    });
    res.json({ flights });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err });
  }
});

// Get single flight details by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const flight = await prisma.flight.findUnique({
      where: { id },
    });
    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }
    res.json({ flight });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err });
  }
});

export default router;
