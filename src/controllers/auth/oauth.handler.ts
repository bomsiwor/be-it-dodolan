import { Router } from "express";
import * as oauthController from "./oauth.controller";

// Create handler for all method
const handler = Router();

handler.get("/google/login-attempt", oauthController.handleGoogleLogin);
handler.get("/google/callback", oauthController.handleGoogleCallback);

export default handler;
