import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { Log } from "./services/logger";

const PORT = Number(process.env.PORT ?? 5000);

const server = app.listen(PORT, async () => {
  await Log("backend", "info", "config", `Server started on port ${PORT}`).catch(() => {});
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Kill the process and restart.`);
    process.exit(1);
  }
  throw err;
});
