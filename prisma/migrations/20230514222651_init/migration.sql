-- CreateTable
CREATE TABLE "config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "marketTypes" (
    "typeID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupID" INTEGER NOT NULL,
    "eTag" TEXT NOT NULL,
    "cacheExpiry" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "marketPrice" (
    "typeID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "marketHistory" (
    "typeID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "average" INTEGER NOT NULL,
    "highest" INTEGER NOT NULL,
    "lowest" INTEGER NOT NULL,
    "orderCount" INTEGER NOT NULL,
    "volume" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "config_key_key" ON "config"("key");

-- CreateIndex
CREATE UNIQUE INDEX "marketTypes_typeID_key" ON "marketTypes"("typeID");

-- CreateIndex
CREATE INDEX "marketTypes_typeID_idx" ON "marketTypes"("typeID");

-- CreateIndex
CREATE INDEX "marketTypes_groupID_idx" ON "marketTypes"("groupID");

-- CreateIndex
CREATE UNIQUE INDEX "marketPrice_typeID_key" ON "marketPrice"("typeID");

-- CreateIndex
CREATE INDEX "marketPrice_typeID_idx" ON "marketPrice"("typeID");

-- CreateIndex
CREATE INDEX "marketHistory_typeID_idx" ON "marketHistory"("typeID");
