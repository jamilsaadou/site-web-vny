import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type LogInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
};

export async function logAdminActivity(input: LogInput) {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    const session = await getAdminSession();
    await prisma.activityLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        details: input.details ?? null,
        actorName: session?.fullName ?? "Système",
        actorRole: session?.role ?? "SYSTEM",
        actorUserId: session?.source === "db" ? session.userId : null,
      },
    });
  } catch {
    // No-op: l'échec du log ne doit pas bloquer l'action métier.
  }
}
