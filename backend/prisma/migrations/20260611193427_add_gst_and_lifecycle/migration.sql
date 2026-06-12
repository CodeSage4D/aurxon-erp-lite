-- AlterTable
ALTER TABLE "OrganizationRegistration" ADD COLUMN     "gstNumber" TEXT;

-- CreateTable
CREATE TABLE "OrganizationLifecycle" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "registrationStatus" TEXT NOT NULL,
    "approvalStatus" TEXT NOT NULL,
    "activationStatus" TEXT NOT NULL,
    "setupStatus" TEXT NOT NULL,
    "workspaceStatus" TEXT NOT NULL,
    "licenseStatus" TEXT NOT NULL,
    "subscriptionStatus" TEXT NOT NULL,
    "supportStatus" TEXT NOT NULL,
    "businessState" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationLifecycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationLifecycle_institutionId_key" ON "OrganizationLifecycle"("institutionId");

-- AddForeignKey
ALTER TABLE "OrganizationLifecycle" ADD CONSTRAINT "OrganizationLifecycle_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
