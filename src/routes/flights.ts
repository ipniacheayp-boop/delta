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
