import bcrypt from "bcrypt";
import crypto from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import type { RegisterInput, UpdateProfileInput } from "./auth.schema.js";
import { sendPasswordResetEmail } from "../../lib/email.js";

const SALT_ROUNDS = 12;

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /** Derives a unique username from the requested one, or from the email, appending a numeric suffix on collision. */
  private async uniqueUsername(preferred: string): Promise<string> {
    const base = preferred.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 16) || "user";
    let candidate = base;
    let suffix = 0;
    while (await this.prisma.user.findUnique({ where: { username: candidate } })) {
      suffix += 1;
      candidate = `${base}${suffix}`;
    }
    return candidate;
  }

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw Object.assign(new Error("An account with this email already exists"), { statusCode: 409 });
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const username = await this.uniqueUsername(input.username ?? input.email.split("@")[0]);

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        username,
      },
    });

    return user;
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    if (input.username) {
      const existing = await this.prisma.user.findUnique({ where: { username: input.username } });
      if (existing && existing.id !== userId) {
        throw Object.assign(new Error("That username is taken"), { statusCode: 409 });
      }
    }
    return this.prisma.user.update({ where: { id: userId }, data: input });
  }

  async searchUsers(query: string, excludeUserId: string) {
    return this.prisma.user.findMany({
      where: {
        username: { contains: query, mode: "insensitive" },
        id: { not: excludeUserId },
      },
      select: { id: true, username: true, name: true, avatarUrl: true, level: true },
      take: 20,
    });
  }

  /** Always behaves the same whether or not the email exists, so we don't leak which emails are registered. */
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiresAt: expiresAt },
    });

    await sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: token, passwordResetExpiresAt: { gt: new Date() } },
    });
    if (!user) {
      throw Object.assign(new Error("This reset link is invalid or has expired"), { statusCode: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiresAt: null },
    });
  }
}