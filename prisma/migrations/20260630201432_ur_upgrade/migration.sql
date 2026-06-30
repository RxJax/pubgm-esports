/*
  Warnings:

  - You are about to drop the column `topTier` on the `Player` table. All the data in the column will be lost.
  - Added the required column `urPoints` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urRank` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "ign" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "controlSetup" TEXT NOT NULL,
    "kdRatio" REAL NOT NULL,
    "headshotPct" REAL NOT NULL,
    "winRate" REAL NOT NULL,
    "matchesPlayed" INTEGER NOT NULL,
    "urRank" TEXT NOT NULL,
    "urPoints" INTEGER NOT NULL,
    "teamId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Player" ("bio", "characterId", "controlSetup", "createdAt", "device", "email", "headshotPct", "id", "ign", "kdRatio", "matchesPlayed", "password", "region", "role", "status", "teamId", "updatedAt", "winRate") SELECT "bio", "characterId", "controlSetup", "createdAt", "device", "email", "headshotPct", "id", "ign", "kdRatio", "matchesPlayed", "password", "region", "role", "status", "teamId", "updatedAt", "winRate" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");
CREATE UNIQUE INDEX "Player_characterId_key" ON "Player"("characterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
