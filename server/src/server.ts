import { createServer } from "http";
import app from "./app.js";
import { logger } from "./utils/logger.js";

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "unhandledRejection");
});
process.on("uncaughtException", (err) => {
  logger.error({ err }, "uncaughtException");
});

const PORT = process.env.PORT || 8080;
const server = createServer(app);

server.listen(PORT, () => {
  logger.info({ port: PORT }, "server listening");
});
