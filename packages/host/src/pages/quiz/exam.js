import {useState, useEffect, useCallback} from 'react';
import {useRouter} from 'next/router';
import styles from './exam.module.scss';

const API = process.env.NEXT_PUBLIC_API_URL || '';

// 샘플 문제 (API 미구동 시 사용)
const SAMPLE_QUESTIONS = [
	{
		id: 1,
		number: 1,
		subject: '시스템 보안',
		content:
			'커널(Kernel)과 사용자 프로그램 사이의 인터페이스를 제공하며, 프로세스 관리, 메모리 관리, 파일 시스템, 네트워크 스택 등을 제공하는 운영체제의 핵심 구성 요소는?',
		options: [
			'셸(Shell)',
			'커널(Kernel)',
			'데몬(Daemon)',
			'부트로더(Boot Loader)',
		],
		source: '[2023년 3월 4일 5번 변형]',
	},
	{
		id: 2,
		number: 2,
		subject: '네트워크 보안',
		content:
			'다음 중 TCP 3-way Handshake 과정에서 클라이언트가 서버로 처음 전송하는 패킷의 플래그는?',
		options: ['ACK', 'SYN', 'FIN', 'RST'],
		source: '[2022년 9월 14일 23번 변형]',
	},
	{
		id: 3,
		number: 3,
		subject: '애플리케이션 보안',
		content:
			'웹 애플리케이션에서 사용자 입력값을 검증하지 않아 공격자가 악의적인 SQL 쿼리를 삽입하여 데이터베이스를 조작하는 공격 기법은?',
		options: [
			'크로스 사이트 스크립팅(XSS)',
			'SQL 인젝션',
			'CSRF(Cross-Site Request Forgery)',
			'클릭재킹(Clickjacking)',
		],
		source: '[2023년 5월 13일 41번 변형]',
	},
];

export default function ExamPage() {
	const router = useRouter();
	const {cert, count, difficulty} = router.query;

	const [questions, setQuestions] = useState([]);
	const [current, setCurrent] = useState(0);
	const [answers, setAnswers] = useState({});
	const [phase, setPhase] = useState('loading'); // loading | exam | result
	const [result, setResult] = useState(null);
	const [explanation, setExplanation] = useState({});
	const [loadingExplain, setLoadingExplain] = useState({});
	const [timer, setTimer] = useState(0);
	const [timerActive, setTimerActive] = useState(false);

	// 문제 로드
	useEffect(() => {
		if (!router.isReady) return;
		const url = `${API}/api/quiz/questions?certificateCode=${cert || ''}&count=${count || 20}&difficulty=${difficulty || ''}`;
		fetch(url)
			.then(r => r.json())
			.then(({data}) => {
				setQuestions(data?.length ? data : SAMPLE_QUESTIONS);
				setPhase('exam');
				setTimerActive(true);
			})
			.catch(() => {
				setQuestions(SAMPLE_QUESTIONS);
				setPhase('exam');
				setTimerActive(true);
			});
	}, [router.isReady]);

	// 타이머
	useEffect(() => {
		if (!timerActive) return;
		const id = setInterval(() => setTimer(t => t + 1), 1000);
		return () => clearInterval(id);
	}, [timerActive]);

	const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

	// 답 선택
	const handleAnswer = useCallback(
		(questionId, answerIdx) => {
			setAnswers(a => ({...a, [questionId]: answerIdx + 1}));
		},
		[],
	);

	// 답안 제출
	const handleSubmit = async () => {
		setTimerActive(false);
		const payload = {
			answers: Object.entries(answers).map(([questionId, answer]) => ({
				questionId: parseInt(questionId),
				answer,
			})),
		};
		try {
			const res = await fetch(`${API}/api/quiz/submit`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(payload),
			});
			const {data} = await res.json();
			setResult(data);
		} catch {
			// 로컬 채점 (API 미구동 시)
			const localResults = questions.map(q => ({
				questionId: q.id,
				userAnswer: answers[q.id] || 0,
				isCorrect: answers[q.id] === q.answer,
			}));
			const correct = localResults.filter(r => r.isCorrect).length;
			const total = questions.length;
			const score = Math.round((correct / total) * 100);
			setResult({
				summary: {total, correct, wrong: total - correct, score, passed: score >= 60, grade: score >= 60 ? '합격' : '불합격'},
				results: localResults,
				wrongQuestions: questions
					.filter(q => !localResults.find(r => r.questionId === q.id)?.isCorrect)
					.map(q => ({...q, userAnswer: answers[q.id] || 0})),
			});
		}
		setPhase('result');
	};

	// AI 3단계 해설 요청
	const handleExplain = async (questionId, userAnswer) => {
		if (explanation[questionId] || loadingExplain[questionId]) return;
		setLoadingExplain(l => ({...l, [questionId]: true}));
		try {
			const res = await fetch(`${API}/api/quiz/explain`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({questionId, userAnswer}),
			});
			const {data} = await res.json();
			setExplanation(e => ({...e, [questionId]: data.explanation}));
		} catch {
			setExplanation(e => ({...e, [questionId]: '⚠️ API 서버 연결 필요 (http://localhost:4010)'}));
		} finally {
			setLoadingExplain(l => ({...l, [questionId]: false}));
		}
	};

	if (phase === 'loading') {
		return <div className={styles.loading}>📚 문제를 불러오는 중...</div>;
	}

	if (phase === 'result' && result) {
		const {summary, wrongQuestions = []} = result;
		return (
			<div className={styles.resultContainer}>
				<div className={styles.scoreCard}>
					<div className={styles.gradeEmoji}>{summary.passed ? '🎉' : '😤'}</div>
					<h1 className={styles.scoreText}>{summary.score}점</h1>
					<p className={`${styles.grade} ${summary.passed ? styles.pass : styles.fail}`}>
						{summary.grade}
					</p>
					<div className={styles.scoreDetail}>
						<span>총 {summary.total}문제</span>
						<span className={styles.correct}>정답 {summary.correct}개</span>
						<span className={styles.wrong}>오답 {summary.wrong}개</span>
						<span>소요 {formatTime(timer)}</span>
					</div>
				</div>

				{wrongQuestions.length > 0 && (
					<section className={styles.wrongSection}>
						<h2 className={styles.wrongTitle}>❌ 오답 해설</h2>
						{wrongQuestions.map(q => (
							<div key={q.id} className={styles.wrongCard}>
								<div className={styles.wrongHeader}>
									<span className={styles.wrongNum}>{q.number}번</span>
									<span className={styles.wrongSubject}>{q.subject}</span>
									<span className={styles.source}>{q.source}</span>
								</div>
								<p className={styles.qContent}>{q.content}</p>
								<div className={styles.options}>
									{q.options?.map((opt, i) => (
										<div
											key={i}
											className={`${styles.option}
                        ${i + 1 === q.answer ? styles.correctOpt : ''}
                        ${i + 1 === q.userAnswer && i + 1 !== q.answer ? styles.wrongOpt : ''}
                      `}>
											<span className={styles.optNum}>{['①', '②', '③', '④'][i]}</span>
											{opt}
											{i + 1 === q.answer && <span className={styles.answerTag}>✅ 정답</span>}
											{i + 1 === q.userAnswer && i + 1 !== q.answer && (
												<span className={styles.wrongTag}>❌ 선택</span>
											)}
										</div>
									))}
								</div>

								<button
									className={styles.explainBtn}
									onClick={() => handleExplain(q.id, q.userAnswer)}
									disabled={loadingExplain[q.id]}>
									{loadingExplain[q.id]
										? '🤖 AI 해설 생성 중...'
										: explanation[q.id]
											? '해설 숨기기'
											: '🤖 AI 3단계 해설 보기'}
								</button>

								{explanation[q.id] && (
									<div className={styles.explainBox}>
										<pre className={styles.explainContent}>{explanation[q.id]}</pre>
									</div>
								)}
							</div>
						))}
					</section>
				)}

				<button className={styles.retryBtn} onClick={() => router.push('/quiz')}>
					다른 시험 보기
				</button>
			</div>
		);
	}

	// 시험 응시 화면
	const q = questions[current];
	const answered = Object.keys(answers).length;

	return (
		<div className={styles.examContainer}>
			<header className={styles.examHeader}>
				<div className={styles.progress}>
					<span>{current + 1} / {questions.length}</span>
					<div className={styles.progressBar}>
						<div
							className={styles.progressFill}
							style={{width: `${((current + 1) / questions.length) * 100}%`}}
						/>
					</div>
				</div>
				<div className={styles.timerBox}>⏱ {formatTime(timer)}</div>
				<div className={styles.answerCount}>답안 {answered}/{questions.length}</div>
			</header>

			<main className={styles.questionArea}>
				<div className={styles.questionMeta}>
					<span className={styles.subject}>{q.subject}</span>
					<span className={styles.qNum}>{q.number}번</span>
					<span className={styles.qSource}>{q.source}</span>
				</div>
				<p className={styles.questionText}>{q.content}</p>

				<div className={styles.optionList}>
					{q.options?.map((opt, i) => (
						<button
							key={i}
							className={`${styles.optionBtn} ${answers[q.id] === i + 1 ? styles.selected : ''}`}
							onClick={() => handleAnswer(q.id, i)}>
							<span className={styles.optLabel}>{['①', '②', '③', '④'][i]}</span>
							<span className={styles.optText}>{opt}</span>
						</button>
					))}
				</div>
			</main>

			<footer className={styles.examFooter}>
				<button
					className={styles.navBtn}
					onClick={() => setCurrent(c => Math.max(0, c - 1))}
					disabled={current === 0}>
					← 이전
				</button>

				<div className={styles.numNav}>
					{questions.map((_, i) => (
						<button
							key={i}
							className={`${styles.numBtn} ${i === current ? styles.curNum : ''} ${answers[questions[i]?.id] ? styles.answeredNum : ''}`}
							onClick={() => setCurrent(i)}>
							{i + 1}
						</button>
					))}
				</div>

				{current < questions.length - 1 ? (
					<button
						className={styles.navBtn}
						onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}>
						다음 →
					</button>
				) : (
					<button
						className={styles.submitBtn}
						onClick={handleSubmit}
						disabled={answered === 0}>
						제출하기
					</button>
				)}
			</footer>
		</div>
	);
}
