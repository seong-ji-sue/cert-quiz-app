// quiz.router.js — 퀴즈 API 라우터 (Express)
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { generateExplanation, generateScoreSummary } = require('../ai/ai.service');

const prisma = new PrismaClient();

// ── GET /api/quiz/certificates ─────────────────────────────
// 자격증 목록 조회
router.get('/certificates', async (req, res) => {
  try {
    const certs = await prisma.certificate.findMany({
      include: { _count: { select: { questions: true } } },
      orderBy: { id: 'asc' },
    });
    res.json({ success: true, data: certs });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── GET /api/quiz/questions ────────────────────────────────
// 랜덤 문제 출제
// Query: certificateCode, count(기본 10), difficulty, year
router.get('/questions', async (req, res) => {
  try {
    const { certificateCode, count = 10, difficulty, year } = req.query;

    const cert = certificateCode
      ? await prisma.certificate.findUnique({ where: { code: certificateCode } })
      : null;

    const where = {
      ...(cert && { certificateId: cert.id }),
      ...(difficulty && { difficulty: difficulty.toUpperCase() }),
      ...(year && { year: parseInt(year) }),
    };

    // 전체 개수 조회 후 랜덤 샘플링
    const total = await prisma.question.count({ where });
    const skip = Math.max(0, Math.floor(Math.random() * (total - count)));

    const questions = await prisma.question.findMany({
      where,
      skip,
      take: parseInt(count),
      include: { certificate: { select: { name: true, code: true } } },
      orderBy: { id: 'asc' },
    });

    // 정답/해설은 제출 전까지 숨김
    const sanitized = questions.map(({ answer, explanation, aiExplanation, ...q }) => q);

    res.json({ success: true, data: sanitized, total });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── POST /api/quiz/submit ──────────────────────────────────
// 답안 제출 및 채점
// Body: { userId?, certificateCode, answers: [{questionId, answer}] }
router.post('/submit', async (req, res) => {
  try {
    const { userId, answers } = req.body;

    if (!answers?.length) {
      return res.status(400).json({ success: false, error: '답안이 없습니다' });
    }

    // 문제 정답 조회
    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { certificate: { select: { name: true } } },
    });

    // 채점
    const results = answers.map(a => {
      const q = questions.find(q => q.id === a.questionId);
      return {
        questionId: a.questionId,
        userAnswer: a.answer,
        isCorrect: q?.answer === a.answer,
      };
    });

    // 채점 요약
    const summary = generateScoreSummary(results, questions);

    // DB 저장 (userId가 있을 때만)
    let attempt = null;
    if (userId) {
      attempt = await prisma.quizAttempt.create({
        data: {
          userId: parseInt(userId),
          totalCount: results.length,
          correctCount: summary.correct,
          score: summary.score,
          finishedAt: new Date(),
          results: {
            create: results.map(r => ({
              questionId: r.questionId,
              userAnswer: r.userAnswer,
              isCorrect: r.isCorrect,
            })),
          },
        },
      });
    }

    // 오답 문제 데이터 반환 (해설 포함)
    const wrongQuestions = questions
      .filter(q => results.find(r => r.questionId === q.id && !r.isCorrect))
      .map(q => {
        const r = results.find(r => r.questionId === q.id);
        return {
          ...q,
          userAnswer: r.userAnswer,
          isCorrect: false,
        };
      });

    res.json({
      success: true,
      data: {
        summary,
        results,
        wrongQuestions,
        attemptId: attempt?.id,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── POST /api/quiz/explain ─────────────────────────────────
// AI 3단계 해설 생성 (오답 1문제씩)
// Body: { questionId, userAnswer }
router.post('/explain', async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;

    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
      include: { certificate: { select: { name: true } } },
    });

    if (!question) {
      return res.status(404).json({ success: false, error: '문제를 찾을 수 없습니다' });
    }

    // 캐시 확인 (동일 문제 해설이 있으면 재사용)
    if (question.aiExplanation) {
      return res.json({ success: true, data: { explanation: question.aiExplanation, cached: true } });
    }

    // AI 해설 생성
    const explanation = await generateExplanation(
      { ...question, certificateName: question.certificate?.name },
      userAnswer
    );

    // DB 캐시 저장
    await prisma.question.update({
      where: { id: question.id },
      data: { aiExplanation: explanation },
    });

    res.json({ success: true, data: { explanation, cached: false } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
