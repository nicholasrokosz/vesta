-- CreateTable
CREATE TABLE "Bedroom" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bathroom" BOOLEAN NOT NULL DEFAULT false,
    "beds" TEXT[],

    CONSTRAINT "Bedroom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bedroom" ADD CONSTRAINT "Bedroom_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
