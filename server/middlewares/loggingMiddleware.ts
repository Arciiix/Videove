import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(
    `${req.method} ${req.path} (query: ${JSON.stringify(
      req.query
    )}); body: ${JSON.stringify(req.body)})`
  );
  next();
};
export default loggingMiddleware;
