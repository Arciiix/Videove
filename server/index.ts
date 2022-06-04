import express from "express";
import config from "./config";
import logger from "./logger";

const app = express();

app.listen(config.PORT, () => {
  logger.info(`App has started on port ${config.PORT}`);
});
