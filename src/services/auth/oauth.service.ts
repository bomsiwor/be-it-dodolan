import {
  decryptState,
  generateGoogleOauthUrl,
  validateCode,
} from "../../utils/oauth";

export function loginAttempt() {
  const result = generateGoogleOauthUrl(null, "login-attempt");

  return result;
}

export async function redirectCallback(code: string, state: string) {
  // Validate google code
  const account = await validateCode(state, code);

  return account;
}
