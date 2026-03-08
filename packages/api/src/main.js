// main.js — API 서버 진입점 (Express + Prisma)
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env.local') });
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env.development') });

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const quizRouter = require('./quiz/quiz.router');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.NODE_SERVER_PORT || 4010;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// ── 헬스체크 ──────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', port: PORT });
  } catch (e) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: e.message });
  }
});

// ── 라우터 ────────────────────────────────────────────────
app.use('/api/quiz', quizRouter);

// ── 서버 시작 ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API 서버 실행 중: http://localhost:${PORT}`);
  console.log(`   헬스체크: http://localhost:${PORT}/health`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
