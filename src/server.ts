import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth";
import flightsRoutes from "./routes/flights";
import bookingsRoutes from "./routes/bookings";
import adminRoutes from "./routes/admin";
import flightStatusRoutes from "./routes/flight-status";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Validate required environment variables in production
if (isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change-me") {
    console.error("ERROR: JWT_SECRET must be set in production!");
    process.exit(1);
  }
  if (!process.env.CORS_ORIGIN) {
    console.error("ERROR: CORS_ORIGIN must be set in production!");
    process.exit(1);
  }
}

// Security middlewares
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
  }),
);

// Rate limiting - stricter in production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS config - stricter in production
const allowedOrigin = isProduction
  ? process.env.CORS_ORIGIN
  : process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/flights", flightsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/flight-status", flightStatusRoutes);
// Admin routes (protected internally)
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) =>
  res.json({ ok: true, env: isProduction ? "production" : "development" }),
);

const PORT = process.env.PORT || 4000;

// Trust proxy for production (for correct IP detection behind reverse proxy)
if (isProduction) {
  app.set("trust proxy", 1);
}

// Basic error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ error: isProduction ? "Internal server error" : err.message });
  },
);

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${isProduction ? "production" : "development"} mode`,
  );
});
