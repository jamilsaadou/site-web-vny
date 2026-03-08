import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const ADMIN_COOKIE_NAME = "niamey_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export type AdminRoleValue = (typeof ADMIN_ROLES)[number];

function isAdminRole(value: string): value is AdminRoleValue {
  return (ADMIN_ROLES as readonly string[]).includes(value);
}

export function toAdminRole(
  value: string | null | undefined,
  fallback: AdminRoleValue = "EDITOR",
): AdminRoleValue {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  if (isAdminRole(normalized)) {
    return normalized;
  }

  return fallback;
}

export type AdminSession = {
  userId: string | null;
  fullName: string;
  email: string;
  role: AdminRoleValue;
  source: "env" | "db";
};

type SessionPayload = AdminSession & {
  exp: number;
};

function getAdminSecret() {
  const fromEnv = process.env.ADMIN_SECRET?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  if (process.env.NODE_ENV !== "production") {
    return "dev-admin-secret-change-this";
  }

  return "";
}

function getEnvSuperAdmin() {
  return {
    email: (process.env.ADMIN_EMAIL ?? "superadmin@niamey.ne").trim().toLowerCase(),
    fullName: (process.env.ADMIN_NAME ?? "Super Admin Ville de Niamey").trim(),
    password: (process.env.ADMIN_PASSWORD ?? "").trim(),
  };
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payloadBase64: string) {
  const secret = getAdminSecret();
  if (!secret) {
    return "";
  }

  return createHmac("sha256", secret).update(payloadBase64).digest("base64url");
}

function constantTimeStringEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }

  return timingSafeEqual(aBuf, bBuf);
}

function createToken(admin: AdminSession) {
  const payload: SessionPayload = {
    ...admin,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

function parseToken(token?: string | null): AdminSession | null {
  if (!token) {
    return null;
  }

  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payloadBase64);
  if (!expectedSignature || !constantTimeStringEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadBase64)) as SessionPayload;
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    const role = String(payload.role ?? "").trim().toUpperCase();
    if (!isAdminRole(role)) {
      return null;
    }

    return {
      userId: payload.userId ?? null,
      fullName: payload.fullName,
      email: payload.email,
      role,
      source: payload.source === "db" ? "db" : "env",
    };
  } catch {
    return null;
  }
}

export function isAdminConfigured() {
  const envAdmin = getEnvSuperAdmin();
  return Boolean(envAdmin.password);
}

export function getDefaultAdminEmail() {
  return getEnvSuperAdmin().email;
}

export async function authenticateAdminCredentials(
  emailInput: string,
  passwordInput: string,
): Promise<AdminSession | null> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();
  if (!email || !password) {
    return null;
  }

  if (process.env.DATABASE_URL) {
    try {
      const adminUser = await prisma.adminUser.findUnique({ where: { email } });
      if (adminUser?.isActive && verifyPassword(password, adminUser.passwordHash)) {
        return {
          userId: adminUser.id,
          fullName: adminUser.fullName,
          email: adminUser.email,
          role: toAdminRole(adminUser.role),
          source: "db",
        };
      }
    } catch {
      // Fallback to env super admin.
    }
  }

  const envAdmin = getEnvSuperAdmin();
  if (envAdmin.password && email === envAdmin.email && constantTimeStringEqual(password, envAdmin.password)) {
    return {
      userId: null,
      fullName: envAdmin.fullName,
      email: envAdmin.email,
      role: "SUPER_ADMIN",
      source: "env",
    };
  }

  return null;
}

export async function createAdminSession(admin: AdminSession) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createToken(admin), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return parseToken(token);
}

export async function isAdminAuthenticated() {
  const session = await getAdminSession();
  return Boolean(session);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAdmin();
  if (session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }
  return session;
}

export function ensureDatabaseConfigured() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL manquant");
  }
}
