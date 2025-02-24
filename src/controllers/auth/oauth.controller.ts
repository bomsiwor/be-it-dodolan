import { Request, Response, Router } from "express";
import * as oauthService from "../../services/auth/oauth.service";
import {
  generateErrorResponse,
  generateSuccessResponse,
} from "../../utils/response";

export async function handleGoogleLogin(req: Request, res: Response) {
  const redirectUrl = oauthService.loginAttempt();

  generateSuccessResponse(res, { redirectUrl });
}

export async function handleGoogleCallback(req: Request, res: Response) {
  // Get state from query
  const { code, state } = req.query;

  const result = await oauthService.redirectCallback(
    code as string,
    state as string,
  );

  generateSuccessResponse(res, result);
}
