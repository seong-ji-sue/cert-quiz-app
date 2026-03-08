-- CreateTable
CREATE TABLE `Certificate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Certificate_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `certificateId` INTEGER NOT NULL,
    `year` INTEGER NULL,
    `round` INTEGER NULL,
    `number` INTEGER NULL,
    `subject` VARCHAR(100) NULL,
    `content` TEXT NOT NULL,
    `options` JSON NOT NULL,
    `answer` INTEGER NOT NULL,
    `explanation` TEXT NULL,
    `aiExplanation` LONGTEXT NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    `source` VARCHAR(200) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuizAttempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `certificateId` INTEGER NULL,
    `totalCount` INTEGER NOT NULL,
    `correctCount` INTEGER NOT NULL DEFAULT 0,
    `score` DOUBLE NOT NULL DEFAULT 0,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuizResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attemptId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `userAnswer` INTEGER NOT NULL,
    `isCorrect` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_certificateId_fkey` FOREIGN KEY (`certificateId`) REFERENCES `Certificate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizAttempt` ADD CONSTRAINT `QuizAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizResult` ADD CONSTRAINT `QuizResult_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `QuizAttempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizResult` ADD CONSTRAINT `QuizResult_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
