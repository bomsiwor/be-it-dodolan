import { Router } from "express";
import oauthHandler from "./controllers/auth/oauth.handler";

const routes = Router();

// Assign all route with prefix here
// Specify the route on each handler.
// ex : define prefix 'auth' here, then the subsequent path must be specified on auth handler

// Auth
routes.use("/auth", oauthHandler);

export default routes;
