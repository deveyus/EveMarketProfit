/*
  Warnings:

  - You are about to drop the column `groupID` on the `marketTypes` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_marketTypes" (
    "typeID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eTag" TEXT NOT NULL,
    "cacheExpiry" DATETIME NOT NULL
);
INSERT INTO "new_marketTypes" ("cacheExpiry", "eTag", "typeID") SELECT "cacheExpiry", "eTag", "typeID" FROM "marketTypes";
DROP TABLE "marketTypes";
ALTER TABLE "new_marketTypes" RENAME TO "marketTypes";
CREATE UNIQUE INDEX "marketTypes_typeID_key" ON "marketTypes"("typeID");
CREATE INDEX "marketTypes_typeID_idx" ON "marketTypes"("typeID");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
