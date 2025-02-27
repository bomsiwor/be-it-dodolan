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
  try {
    // Get state from query
    const { code, state } = req.query;

    const result = await oauthService.redirectCallback(
      code as string,
      state as string,
    );

    res.redirect(result.toString());
  } catch (error) {
    console.log(error);

    generateErrorResponse(res, "Login error");
  }
}

export async function handleCodeCallback(req: Request, res: Response) {
  try {
    // Get data from body
    const body = req.body;

    const result = await oauthService.generateAccessToken(body.code as string, {
      pegawaiId: parseInt(body.pegawaiId),
    });

    generateSuccessResponse(res, result);
  } catch (error) {
    console.log(error);

    generateErrorResponse(res, "Validating code error");
  }
}
