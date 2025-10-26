/*
  Warnings:

  - You are about to drop the column `description` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[profileId,locationId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `locationName` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `safety` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Rating` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Safety" AS ENUM ('NEG_TWO', 'NEG_ONE', 'ZERO', 'ONE', 'TWO');

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_userId_fkey";

-- DropIndex
DROP INDEX "Rating_locationId_idx";

-- DropIndex
DROP INDEX "Rating_time_idx";

-- DropIndex
DROP INDEX "Rating_userId_idx";

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "locationName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "imageUrl",
DROP COLUMN "time",
DROP COLUMN "userId",
DROP COLUMN "value",
ADD COLUMN     "profileId" TEXT NOT NULL,
ADD COLUMN     "safety" "Safety" NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_profileId_locationId_key" ON "Rating"("profileId", "locationId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
