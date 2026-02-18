import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth";
import flightsRoutes from "./routes/flights";
import bookingsRoutes from "./routes/bookings";

dotenv.config();

const app = express();
// Security middlewares
app.use(helmet())
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use(limiter)

// CORS config - allow from env or all in dev
const allowedOrigin = process.env.CORS_ORIGIN || '*'
app.use(cors({ origin: allowedOrigin }))
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/flights", flightsRoutes);
app.use("/api/bookings", bookingsRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
// Basic error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error(err)
	res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
