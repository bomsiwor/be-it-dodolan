import dotenv from "dotenv";

dotenv.config();

interface IEnv {
  port: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  jwtSecret: string;
}

const env: IEnv = {
  clientId: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  redirectUri: process.env.GOOGLE_REDIRECT_URI as string,
  port: process.env.APP_PORT as string,
  jwtSecret: process.env.JWT_SECRET_KEY || "12345678",
};

export { env };
