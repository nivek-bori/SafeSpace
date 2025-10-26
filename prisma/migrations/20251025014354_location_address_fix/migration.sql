/*
  Warnings:

  - You are about to drop the column `locationName` on the `Location` table. All the data in the column will be lost.
  - Made the column `address` on table `Location` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "locationName",
ALTER COLUMN "address" SET NOT NULL;
