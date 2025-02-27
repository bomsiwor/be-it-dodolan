import {
  decryptState,
  ELoginState,
  encryptState,
  generateGoogleOauthUrl,
  validateCode,
} from "../../utils/oauth";

import * as userRepository from "../../repositories/user/user.repository";
import { env } from "../../config";
import { generateRefreshToken, generateToken } from "../../utils/jwt";

export function loginAttempt() {
  const result = generateGoogleOauthUrl(null, "login-attempt");

  return result;
}

export async function redirectCallback(code: string, state: string) {
  // Validate google code
  const account = await validateCode(state, code);

  // If account not exists return null
  if (!account?.googleUser) {
    throw new Error("user not found");
  }

  // Check on database for existing user by email
  let existingUser = await userRepository.findByEmail(account.googleUser.email);

  // If user not exists,
  // Create user
  // then create code for register
  let purpose: ELoginState = "login";
  let redirectPath: string = "/login-attempt";

  if (!existingUser) {
    const { name, email, sub: googleId, picture: photo } = account.googleUser;

    existingUser = await userRepository.create({
      name,
      email,
      googleId,
      photo,
      pegawaiId: null,
    });

    purpose = "register";
    redirectPath = "/register";
  }

  // Check for pegawaiId
  // Redirect to register if user exists without pegawai
  if (!existingUser.pegawaiId) {
    purpose = "updateData";
    redirectPath = "/register";
  }

  // Create code for requesting token
  const tokenRequestCode = encryptState({
    userId: String(existingUser.id),
    purpose,
  });

  // Return URL with generated code for specific next action
  const nextActionURL = new URL(redirectPath, env.frontEndUrl);
  nextActionURL.searchParams.set("code", tokenRequestCode);

  return nextActionURL;
}

export async function generateAccessToken(
  code: string,
  data?: userRepository.TUpdateUser,
) {
  // Decrypt code
  const account = decryptState(code);

  if (!account) {
    throw new Error("Error login");
  }

  // Get user from ID
  // throw error if not exists
  const user = await userRepository.findById(
    parseInt(account.user.userId as string),
  );

  if (!user) {
    throw new Error("User not found");
  }

  // Update user if purpose is register or update
  const purpose = account.user.purpose as ELoginState;
  if (purpose == "register" || purpose == "updateData") {
    await userRepository.update(data ?? {}, user.id);
  }

  // Generate access token
  const accessToken = generateToken({ userId: String(user.id) });
  const refreshToken = generateRefreshToken({ userId: String(user.id) });

  return { accessToken, refreshToken };
}
