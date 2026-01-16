import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../lib/logger";

export function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const requestId = uuidv4();

  (req as any).requestId = requestId;

  logger.info(
    {
      requestId,
      method: req.method,
      path: req.originalUrl,
    },
    "REQUEST_RECEIVED"
  );

  next();
}