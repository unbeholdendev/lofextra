-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pubKeyHex" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "hlc" TEXT NOT NULL,
    "ackedDeviceIds" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
