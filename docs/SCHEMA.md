# SCHEMA.md — MariaDB/Prisma 기반 DB 모델링

## 1. 개요

- **DB**: MariaDB 10.x
- **ORM**: Prisma (설치 예정: `packages/api`)
- **위치**: `packages/api/prisma/schema.prisma`

---

## 2. ERD 개요

```
User ──────< StudyHistory
  │               │
  │         QuizAttempt >──── QuizResult
  │
  └──────< UserUpload >──── Certificate
                                  │
                               Question
                                  │
                              QuizOption
```

---

## 3. Prisma 스키마 설계

```prisma
// packages/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ─── 사용자 ───────────────────────────────────────────
model User {
  id           Int            @id @default(autoincrement())
  email        String         @unique @db.VarChar(255)
  password     String         @db.VarChar(255)
  name         String         @db.VarChar(100)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  uploads      UserUpload[]
  studyHistory StudyHistory[]
  quizAttempts QuizAttempt[]
}

// ─── 자격증 카테고리 ──────────────────────────────────
model Certificate {
  id          Int          @id @default(autoincrement())
  name        String       @unique @db.VarChar(200)
  description String?      @db.Text
  createdAt   DateTime     @default(now())
  questions   Question[]
  uploads     UserUpload[]
}

// ─── PDF 업로드 이력 ──────────────────────────────────
model UserUpload {
  id            Int         @id @default(autoincrement())
  userId        Int
  certificateId Int
  fileName      String      @db.VarChar(255)
  filePath      String      @db.VarChar(500)
  status        UploadStatus @default(PENDING)
  createdAt     DateTime    @default(now())
  user          User        @relation(fields: [userId], references: [id])
  certificate   Certificate @relation(fields: [certificateId], references: [id])
}

enum UploadStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

// ─── 문제 ──────────────────────────────────────────
model Question {
  id            Int           @id @default(autoincrement())
  certificateId Int
  content       String        @db.Text
  explanation   String?       @db.Text
  difficulty    Difficulty    @default(MEDIUM)
  type          QuestionType  @default(MULTIPLE_CHOICE)
  answer        String        @db.VarChar(500)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  certificate   Certificate   @relation(fields: [certificateId], references: [id])
  options       QuizOption[]
  results       QuizResult[]
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum QuestionType {
  MULTIPLE_CHOICE
  SHORT_ANSWER
}

// ─── 선지 (객관식) ─────────────────────────────────
model QuizOption {
  id         Int      @id @default(autoincrement())
  questionId Int
  number     Int
  content    String   @db.VarChar(500)
  question   Question @relation(fields: [questionId], references: [id])
}

// ─── 퀴즈 시도 세션 ────────────────────────────────
model QuizAttempt {
  id          Int          @id @default(autoincrement())
  userId      Int
  totalCount  Int
  correctCount Int         @default(0)
  score       Float        @default(0)
  startedAt   DateTime     @default(now())
  finishedAt  DateTime?
  user        User         @relation(fields: [userId], references: [id])
  results     QuizResult[]
}

// ─── 문항별 채점 결과 ──────────────────────────────
model QuizResult {
  id          Int         @id @default(autoincrement())
  attemptId   Int
  questionId  Int
  userAnswer  String      @db.VarChar(500)
  isCorrect   Boolean
  attempt     QuizAttempt @relation(fields: [attemptId], references: [id])
  question    Question    @relation(fields: [questionId], references: [id])
}

// ─── 학습 이력 요약 ────────────────────────────────
model StudyHistory {
  id            Int      @id @default(autoincrement())
  userId        Int
  date          DateTime @default(now()) @db.Date
  questionCount Int      @default(0)
  correctCount  Int      @default(0)
  user          User     @relation(fields: [userId], references: [id])

  @@unique([userId, date])
}
```

---

## 4. 환경 변수 설정

`.env.development`에 추가 필요:
```env
DATABASE_URL="mysql://root:password@localhost:3306/cert_quiz_db"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
CLAUDE_API_KEY="your-claude-api-key"
```

---

## 5. 마이그레이션 명령어 (Prisma 설치 후)

```bash
# Prisma 설치 (packages/api 내)
npm install prisma @prisma/client --save

# 초기 마이그레이션
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate

# DB 시드 (초기 데이터)
npx prisma db seed
```
