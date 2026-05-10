-- CreateTable
CREATE TABLE "EventExternalAttendee" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventExternalAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventExternalAttendee_eventId_email_key" ON "EventExternalAttendee"("eventId", "email");

-- AddForeignKey
ALTER TABLE "EventExternalAttendee" ADD CONSTRAINT "EventExternalAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
