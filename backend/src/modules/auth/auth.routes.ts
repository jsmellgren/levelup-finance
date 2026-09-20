import type { FastifyInstance } from "fastify";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "./auth.schema.js";
import { AuthService } from "./auth.service.js";

function toPublicUser(user: {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  name: string | null;
  onboarded: boolean;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
}) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    name: user.name,
    onboarded: user.onboarded,
    level: user.level,
    totalXP: user.totalXP,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
  };
}

export default async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.prisma);
  const uid = (request: any) => (request.user as { sub: string }).sub;

  fastify.post("/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    }

    try {
      const user = await authService.register(parsed.data);
      const token = fastify.jwt.sign({ sub: user.id });
      return reply.status(201).send({ token, user: toPublicUser(user) });
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message ?? "Registration failed" });
    }
  });

  fastify.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    }

    const user = await authService.validateCredentials(parsed.data.email, parsed.data.password);
    if (!user) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    const token = fastify.jwt.sign({ sub: user.id });
    return reply.send({ token, user: toPublicUser(user) });
  });

  fastify.get("/me", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({ where: { id: uid(request) } });
    if (!user) return reply.status(404).send({ error: "User not found" });
    return reply.send({ user: toPublicUser(user) });
  });

  fastify.patch("/me", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    try {
      const user = await authService.updateProfile(uid(request), parsed.data);
      return reply.send({ user: toPublicUser(user) });
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });

  // Used by the "add friend" search box — search by (partial) username.
  fastify.get("/users/search", { preHandler: [fastify.authenticate] }, async (request) => {
    const { q } = request.query as { q?: string };
    if (!q || q.length < 2) return { users: [] };
    return { users: await authService.searchUsers(q, uid(request)) };
  });

  fastify.post("/auth/request-password-reset", async (request, reply) => {
    const parsed = requestPasswordResetSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    await authService.requestPasswordReset(parsed.data.email);
    // Always return success, whether or not the email exists, so we don't leak account existence.
    return reply.send({ success: true });
  });

  fastify.post("/auth/reset-password", async (request, reply) => {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    try {
      await authService.resetPassword(parsed.data.token, parsed.data.newPassword);
      return reply.send({ success: true });
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });
}