import dotenv from "dotenv";
dotenv.config();
import prisma from "../src/prisma";

async function main() {
  console.log("Seeding...");
  const admin = await prisma.user.upsert({
    where: { email: "admin@airline.local" },
    update: {},
    create: {
      email: "admin@airline.local",
      password: "$2b$10$abcdefghijklmnopqrstuv",
      firstName: "Admin",
      role: "ADMIN" as any,
    },
  });

  await prisma.flight.createMany({
    data: [
      {
        flightNumber: "DL100",
        originIata: "JFK",
        destinationIata: "LAX",
        departureTime: new Date(Date.now() + 3600 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        durationMinutes: 360,
        status: "SCHEDULED",
        priceMain: 199.99,
        seatsMainAvailable: 120,
        seatsComfortPlusAvailable: 20,
        seatsFirstClassAvailable: 10,
        seatsDeltaOneAvailable: 0,
      },
    ],
  });

  console.log("Seeding finished");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
