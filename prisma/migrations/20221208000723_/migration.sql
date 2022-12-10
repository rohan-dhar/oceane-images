/*
  Warnings:

  - You are about to drop the column `coverPicture` on the `Album` table. All the data in the column will be lost.
  - Added the required column `cover` to the `Album` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Album` DROP COLUMN `coverPicture`,
    ADD COLUMN `cover` VARCHAR(191) NOT NULL;
