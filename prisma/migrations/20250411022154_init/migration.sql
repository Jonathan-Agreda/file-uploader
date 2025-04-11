-- CreateTable
CREATE TABLE "User_fu" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_fu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File_fu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "folderId" INTEGER,

    CONSTRAINT "File_fu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder_fu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Folder_fu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_fu_email_key" ON "User_fu"("email");

-- AddForeignKey
ALTER TABLE "File_fu" ADD CONSTRAINT "File_fu_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder_fu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File_fu" ADD CONSTRAINT "File_fu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User_fu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder_fu" ADD CONSTRAINT "Folder_fu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User_fu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
