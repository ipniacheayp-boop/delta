import dotenv from "dotenv";
dotenv.config();
import prisma from "../src/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("Seeding...");

  // Create admin user with properly hashed password
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create admin users
  const adminEmails = [
    "admin@airline.local",
    "superadmin@airline.local",
    "manager@airline.local",
  ];

  const adminNames = [
    { firstName: "Admin", lastName: "User" },
    { firstName: "Super", lastName: "Admin" },
    { firstName: "Flight", lastName: "Manager" },
  ];

  for (let i = 0; i < adminEmails.length; i++) {
    await prisma.user.upsert({
      where: { email: adminEmails[i] },
      update: {},
      create: {
        email: adminEmails[i],
        password: hashedPassword,
        firstName: adminNames[i].firstName,
        lastName: adminNames[i].lastName,
        role: "ADMIN",
      },
    });
  }

  // Create sample regular user
  const userPassword = await bcrypt.hash("user123", 10);
  await prisma.user.upsert({
    where: { email: "user@airline.local" },
    update: {},
    create: {
      email: "user@airline.local",
      password: userPassword,
      firstName: "John",
      lastName: "Doe",
      role: "USER",
    },
  });

  console.log("Admin users created:");
  console.log("  - admin@airline.local / admin123");
  console.log("  - superadmin@airline.local / admin123");
  console.log("  - manager@airline.local / admin123");
  console.log("");
  console.log("Sample user:");
  console.log("  - user@airline.local / user123");

  // Create sample flights
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
      {
        flightNumber: "DL200",
        originIata: "LAX",
        destinationIata: "JFK",
        departureTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 30 * 3600 * 1000).toISOString(),
        durationMinutes: 360,
        status: "SCHEDULED",
        priceMain: 189.99,
        seatsMainAvailable: 100,
        seatsComfortPlusAvailable: 15,
        seatsFirstClassAvailable: 8,
        seatsDeltaOneAvailable: 0,
      },
      {
        flightNumber: "DL300",
        originIata: "ATL",
        destinationIata: "ORD",
        departureTime: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 15 * 3600 * 1000).toISOString(),
        durationMinutes: 180,
        status: "SCHEDULED",
        priceMain: 149.99,
        seatsMainAvailable: 80,
        seatsComfortPlusAvailable: 12,
        seatsFirstClassAvailable: 6,
        seatsDeltaOneAvailable: 0,
      },
    ],
  });

  console.log("Sample flights created");
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
