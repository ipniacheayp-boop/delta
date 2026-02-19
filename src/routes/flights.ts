import express from "express";
import prisma from "../prisma";
import { amadeusService, FlightSearchParams } from "../lib/amadeus";

const router = express.Router();

// Check if Amadeus API is configured
const isAmadeusConfigured = () => {
  return !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
};

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

  // If search params are provided, perform search using Amadeus API
  if (origin && destination) {
    // Check if Amadeus API is configured
    if (isAmadeusConfigured()) {
      try {
        const searchParams: FlightSearchParams = {
          originLocationCode: String(origin).toUpperCase(),
          destinationLocationCode: String(destination).toUpperCase(),
          departureDate: String(departDate),
          adults: Number(passengers) || 1,
        };

        // Add return date for round trip
        if (returnDate && tripType === "roundtrip") {
          searchParams.returnDate = String(returnDate);
        }

        // Add cabin class if specified
        if (cabinClass) {
          const cabinClassMap: Record<
            string,
            "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"
          > = {
            economy: "ECONOMY",
            premium_economy: "PREMIUM_ECONOMY",
            business: "BUSINESS",
            first: "FIRST",
          };
          searchParams.travelClass =
            cabinClassMap[cabinClass.toLowerCase()] || "ECONOMY";
        }

        // Add children if provided
        if (req.body.children) {
          searchParams.children = Number(req.body.children);
        }

        // Add infants if provided
        if (req.body.infants) {
          searchParams.infants = Number(req.body.infants);
        }

        // Add non-stop preference
        if (req.body.nonStop === true || req.body.nonStop === "true") {
          searchParams.nonStop = true;
        }

        // Search flights using Amadeus API
        const amadeusResult = await amadeusService.searchFlights(searchParams);

        return res.json({
          flights: amadeusResult.data,
          source: "amadeus",
          search: {
            origin,
            destination,
            departDate,
            returnDate,
            passengers,
            cabinClass,
            tripType,
          },
          meta: amadeusResult.meta,
        });
      } catch (error: any) {
        console.error("Amadeus API error:", error.message);
        return res.status(500).json({
          error: "Flight search failed",
          details: error.message,
        });
      }
    }

    // Fallback to database search if Amadeus is not configured
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
        source: "database",
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

// New route: Search airports/cities
router.get("/airports", async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  if (!isAmadeusConfigured()) {
    return res.status(503).json({ error: "Amadeus API not configured" });
  }

  try {
    const result = await amadeusService.searchAirports(String(keyword));
    res.json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Airport search failed", details: error.message });
  }
});

// New route: Confirm flight price
router.post("/confirm-price", async (req, res) => {
  const { flightOffer } = req.body;

  if (!flightOffer) {
    return res.status(400).json({ error: "Flight offer is required" });
  }

  if (!isAmadeusConfigured()) {
    return res.status(503).json({ error: "Amadeus API not configured" });
  }

  try {
    const result = await amadeusService.confirmFlightPrice(flightOffer);
    res.json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Price confirmation failed", details: error.message });
  }
});

export default router;
