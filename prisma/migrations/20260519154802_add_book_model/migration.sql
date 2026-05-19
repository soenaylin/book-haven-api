-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Unknown Author',
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "isbn" TEXT,
    "stock" INTEGER NOT NULL,
    "coverImage" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salesCount" INTEGER NOT NULL DEFAULT 0
);
