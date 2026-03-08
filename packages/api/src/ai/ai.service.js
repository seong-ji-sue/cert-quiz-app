// ai.service.js — 일타강사 AI 해설 엔진 (Claude API)
// 무적의 3단계 해설 포맷: 초등학생 비유 / 핵심 개념 / 보기 전면 해부

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * 일타강사 시스템 프롬프트
 */
const TUTOR_SYSTEM_PROMPT = `
너는 정보보안기사 / 정보처리기사 전담 1:1 일타강사이자 엄격한 채점관이다.

[무적의 3단계 해설 포맷 — 절대 준수]

## ① 초등학생 비유 & 암기법
- 어려운 보안/IT 개념을 초등학생도 이해하는 쉬운 비유로 설명
- 뇌에 박히는 암기법 제공 (초성, 연상법, 스토리 등)

## ② 문제 핵심 개념
- 이 문제에서 묻는 정보보안기사/정보처리기사의 핵심 뼈대 개념 1~2줄로 명확히

## ③ 보기 전면 해부 (절대 누락 금지)
- ① ② ③ ④ 보기 4개 전체를 빠짐없이 해부
- 각 보기가 왜 정답인지 / 왜 오답인지 명확히 설명
- [정답] / [오답 — 이유] 형식 사용

출력 형식 (마크다운):
### 🎯 [문제 번호] 오답 해설

#### ① 초등학생 비유 & 암기법
...

#### ② 문제 핵심 개념
...

#### ③ 보기 전면 해부
| 보기 | 내용 | 판정 | 이유 |
|------|------|------|------|
| ① | ... | ❌ 오답 | ... |
| ② | ... | ✅ 정답 | ... |
| ③ | ... | ❌ 오답 | ... |
| ④ | ... | ❌ 오답 | ... |
`.trim();

/**
 * 오답 문제 3단계 해설 생성
 * @param {Object} question - 문제 데이터
 * @param {number} userAnswer - 사용자 선택 번호
 * @returns {string} 3단계 해설 마크다운
 */
async function generateExplanation(question, userAnswer) {
  const optionsText = question.options
    .map((opt, i) => `${['①','②','③','④'][i]} ${opt}`)
    .join('\n');

  const prompt = `
다음 문제에 대해 무적의 3단계 해설을 제공해줘.

[문제 번호] ${question.number || ''}번
[자격증] ${question.certificateName || '정보처리기사'}
[과목] ${question.subject || ''}
[출처] ${question.source || ''}

[문제]
${question.content}

[보기]
${optionsText}

[정답] ${question.answer}번
[수험생 선택] ${userAnswer}번 (오답)

위 정보를 바탕으로 3단계 해설 포맷에 맞춰 완벽히 해설해줘.
보기 ①②③④ 4개 전체를 반드시 하나도 빠짐없이 해부해야 해.
  `.trim();

  const message = await client.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: TUTOR_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].text;
}

/**
 * 채점 결과 요약 생성
 * @param {Array} results - [{questionId, isCorrect, userAnswer}]
 * @param {Array} questions - 전체 문제 목록
 * @returns {Object} 채점 요약
 */
function generateScoreSummary(results, questions) {
  const total = results.length;
  const correct = results.filter(r => r.isCorrect).length;
  const wrong = total - correct;
  const score = Math.round((correct / total) * 100);
  const passed = score >= 60; // 60점 이상 합격

  const correctNums = results
    .filter(r => r.isCorrect)
    .map(r => {
      const q = questions.find(q => q.id === r.questionId);
      return q?.number || r.questionId;
    });

  const wrongNums = results
    .filter(r => !r.isCorrect)
    .map(r => {
      const q = questions.find(q => q.id === r.questionId);
      return q?.number || r.questionId;
    });

  return {
    total,
    correct,
    wrong,
    score,
    passed,
    grade: passed ? '합격' : '불합격',
    correctNums,
    wrongNums,
    summary: `총점 ${score}점 (${correct}/${total}) — ${passed ? '✅ 합격' : '❌ 불합격'}`,
  };
}

module.exports = { generateExplanation, generateScoreSummary, TUTOR_SYSTEM_PROMPT };
