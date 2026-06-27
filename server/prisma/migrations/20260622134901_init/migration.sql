-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessKey" TEXT NOT NULL,
    "storeName" TEXT,
    "storeCnpj" TEXT,
    "storeAddress" TEXT,
    "issueDate" DATETIME,
    "total" REAL,
    "paymentMethod" TEXT,
    "rawHtml" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL,
    "unit" TEXT,
    "unitPrice" REAL,
    "totalPrice" REAL,
    "category" TEXT,
    CONSTRAINT "Item_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_accessKey_key" ON "Receipt"("accessKey");
