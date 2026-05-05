import express from "express";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import notificationsRouter from "./routes/notifications";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Global HTTP request logger — must come before routes
app.use(requestLogger);

app.use("/api/notifications", notificationsRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Centralised error handler — must be last
app.use(errorHandler);

export default app;
