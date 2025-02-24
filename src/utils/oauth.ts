import {
  ArcticFetchError,
  decodeIdToken,
  generateCodeVerifier,
  Google,
  OAuth2RequestError,
} from "arctic";
import crypto from "crypto";
import { env } from "../config";

export interface IUserOauth {
  userId: string | null;
  purpose: string;
  timestamp?: number;
}

type TGoogleAccount = {
  sub: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
};

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = "12345678123456781234567812345678";

const google = new Google(env.clientId, env.clientSecret, env.redirectUri);

/**
 * Encrypt user data and add code verifier at the end of the state.
 */
export function encryptState(data: IUserOauth, codeVerifier: string): string {
  // Add timestamp to data
  data.timestamp ??= Date.now();

  // Generate IV
  const iv = crypto.randomBytes(16);

  // Create chiper
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );

  let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
  encrypted += cipher.final("base64");

  return `${iv.toString("base64")}.${encrypted}.${codeVerifier}`;
}

/**
 * Get extracted User auth and google data from state and code verifier.
 */
export function decryptState(
  state: string,
): { user: IUserOauth; codeVerifier: string } | null {
  // Extract IV
  const extracted = state.split(".");

  if (extracted.length !== 3) {
    return null;
  }

  const iv = Buffer.from(extracted[0], "base64");
  const actualState = extracted[1];

  // Create decipher
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );

  // Decrupt data
  let decrypted = decipher.update(actualState, "base64", "utf8");
  decrypted += decipher.final("utf8");

  // Get actual object
  const actualObj: IUserOauth = JSON.parse(decrypted);

  // Validate timestamp
  if (
    !actualObj?.timestamp ||
    Date.now() - actualObj?.timestamp > 10 * 60 * 1000
  ) {
    return null;
  }

  return { user: actualObj, codeVerifier: extracted[2] };
}

/**
 * Generate google auth URL.
 */
export function generateGoogleOauthUrl(
  userId: string | null,
  purpose: string,
): URL {
  const user: IUserOauth = {
    userId,
    purpose,
  };

  const codeVerifier = generateCodeVerifier();

  const encrypted = encryptState(user, codeVerifier);

  const scopes = ["profile", "email", "openid"];

  const url = google.createAuthorizationURL(encrypted, codeVerifier, scopes);

  return url;
}

/**
 * Handle google redirect callback. Validate state and code.
 */
export async function validateCode(
  state: string,
  code: string,
): Promise<{ user: IUserOauth; googleUser: TGoogleAccount } | null> {
  try {
    // Get extracted user from state
    const decrypted = decryptState(state);

    if (!decrypted) {
      return null;
    }

    const tokens = await google.validateAuthorizationCode(
      code,
      decrypted.codeVerifier,
    );
    const idToken = tokens.idToken();
    const claims = decodeIdToken(idToken);

    return {
      user: decrypted.user,
      googleUser: claims as TGoogleAccount,
    };
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      // Invalid authorization code, credentials, or redirect URI
      console.error(
        "Invalid authorization code, credentials, or redirect URI",
        e.message,
        e.code,
      );
    }
    if (e instanceof ArcticFetchError) {
      // Failed to call `fetch()`
      console.error("Failed to call `fetch()`", e.cause);
    }

    return null;
  }
}
