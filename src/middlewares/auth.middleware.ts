import { NextFunction, Request, Response } from "express";
import { generateErrorResponse } from "../utils/response";
import { verifyToken } from "../utils/jwt";

export function jwtAuthCheck(req: Request, res: Response, next: NextFunction) {
  // Check for authentication header
  const authToken = req.headers.authorization;

  if (!authToken) {
    generateErrorResponse(res, null, 401, "Unauthenticated");
    return;
  }

  // Split token
  const splitted = authToken.split(" ");

  if (splitted.length !== 2 || splitted[0] !== "Bearer") {
    generateErrorResponse(res, null, 401, "Unauthenticated");
    return;
  }

  // Verify token
  const authUser = verifyToken(splitted[1]);

  if (!authUser) {
    generateErrorResponse(res, null, 401, "Unauthenticated");
    return;
  }

  // Assign user id to locals
  res.locals.userId = authUser.userId;

  next();
}
