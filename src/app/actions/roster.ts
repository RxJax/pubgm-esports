"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function disbandRosterAction(rosterId: string) {
  try {
    if (!rosterId) {
      return { error: "Roster ID is required." };
    }

    // Clean transaction: disconnect all players first, then delete the roster
    await prisma.$transaction([
      prisma.player.updateMany({
        where: { teamRosterId: rosterId },
        data: { teamRosterId: null },
      }),
      prisma.teamRoster.delete({
        where: { id: rosterId },
      }),
    ]);

    // Force layout cache clearance for home page and discovery layers
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Disband roster server action failed:", error);
    return { error: error.message || "Failed to disband active roster. Internal error." };
  }
}
