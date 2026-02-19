import express from "express";
import prisma from "../prisma";

const router = express.Router();

router.get("/", async (req, res) => {
  const { origin, destination, departDate } = req.query;
  if (origin && destination && departDate) {
    const flights = await prisma.flight.findMany({
      where: {
        originIata: String(origin),
        destinationIata: String(destination),
      },
      orderBy: { departureTime: "asc" },
    });
    return res.json({ flights });
  }
  const flights = await prisma.flight.findMany({ take: 50 });
  res.json({ flights });
});

router.post("/", async (req, res) => {
  // Check if it's a search request or a create request
  const {
    origin,
    destination,
    departDate,
    returnDate,
    passengers,
    cabinClass,
    tripType,
  } = req.body;

  // If search params are provided, perform search
  if (origin && destination) {
    try {
      // Build date filter if departDate is provided
      const whereClause: any = {
        originIata: String(origin),
        destinationIata: String(destination),
      };

      // Add date filtering if departDate is provided
      if (departDate) {
        const searchDate = new Date(String(departDate));
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
        take: 50,
      });
      return res.json({
        flights,
        search: {
          origin,
          destination,
          departDate,
          returnDate,
          passengers,
          cabinClass,
          tripType,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: "Search failed", details: err });
    }
  }

  // Otherwise, create a new flight
  const data = req.body;
  try {
    const flight = await prisma.flight.create({ data });
    res.json({ flight });
  } catch (err) {
    res.status(400).json({ error: "Invalid flight data", details: err });
  }
});

router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const flight = await prisma.flight.update({
    where: { id },
    data: { status } as any,
  });
  res.json({ flight });
});

export default router;
