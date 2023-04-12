/*
  Warnings:

  - You are about to drop the column `authorId` on the `Messages` table. All the data in the column will be lost.
  - Added the required column `recipient_id` to the `Messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `Messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_authorId_fkey";

-- AlterTable
ALTER TABLE "Messages" DROP COLUMN "authorId",
ADD COLUMN     "recipient_id" INTEGER NOT NULL,
ADD COLUMN     "sender_id" INTEGER NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
