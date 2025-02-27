import type { User } from "@prisma/client";
import { prisma } from "../../db/client";

export type TNewUser = Omit<User, "id" | "createdAt">;
export type TUpdateUser = Partial<TNewUser>;

export async function findByEmail(email: string) {
  // Search user by email
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  return user;
}

export async function findByPegawaiId(pegawaiId: number) {
  // Search user by email
  const user = await prisma.user.findFirst({
    where: {
      pegawaiId: pegawaiId,
    },
  });

  return user;
}

/**
 * Find user by ID
 */
export async function findById(id: number) {
  // Search user by email
  const user = await prisma.user.findFirst({
    where: {
      id,
    },
  });

  return user;
}

/**
 * create new user.
 */
export async function create(data: TNewUser) {
  // Create new user
  const user = await prisma.user.create({
    data: data,
  });

  return user;
}

/**
 * Update user
 */
export async function update(data: TUpdateUser, id: number) {
  const user = await prisma.user.update({
    where: {
      id: id,
    },
    data,
  });

  return user;
}
