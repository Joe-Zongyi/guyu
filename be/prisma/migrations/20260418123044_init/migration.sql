-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "taxonomy_id" TEXT NOT NULL,
    "common_name" TEXT NOT NULL,
    "scientific_name" TEXT,
    "variety" TEXT,
    "location" TEXT,
    "pot_size" TEXT,
    "light_level" TEXT,
    "pot_type" TEXT,
    "watering_reminder" BOOLEAN NOT NULL DEFAULT true,
    "fertilizing_reminder" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CareEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plant_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "source" TEXT,
    "request_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareEvent_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "Plant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlantStateAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plant_id" TEXT NOT NULL,
    "overall_state" TEXT NOT NULL,
    "signals" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "suggestions" TEXT,
    "escalation_flag" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT,
    "request_id" TEXT,
    "assessed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlantStateAssessment_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "Plant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyAdviceSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plant_id" TEXT NOT NULL,
    "advice_date" DATETIME NOT NULL,
    "actions" TEXT NOT NULL,
    "warnings" TEXT,
    "mood" TEXT,
    "weather_snapshot" TEXT,
    "request_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyAdviceSnapshot_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "Plant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "file_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storage_path" TEXT,
    "url" TEXT NOT NULL,
    "uploaded_by" TEXT,
    "plant_id" TEXT,
    "request_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Plant_plant_id_key" ON "Plant"("plant_id");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAdviceSnapshot_plant_id_advice_date_key" ON "DailyAdviceSnapshot"("plant_id", "advice_date");

-- CreateIndex
CREATE UNIQUE INDEX "File_file_id_key" ON "File"("file_id");
