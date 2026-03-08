import {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import styles from './quiz.module.scss';

// 자격증 목록 (API 미구동 시 기본값)
const DEFAULT_CERTS = [
	{code: 'security-engineer', name: '정보보안기사', count: 400},
	{code: 'iz', name: '정보처리기사', count: 0},
	{code: 'c1', name: '컴퓨터활용능력 1급', count: 0},
	{code: 'c2', name: '컴퓨터활용능력 2급', count: 0},
	{code: 'jf', name: '네트워크관리사 2급', count: 0},
];

const DIFFICULTIES = [
	{value: '', label: '전체'},
	{value: 'easy', label: '하 (쉬움)'},
	{value: 'medium', label: '중 (보통)'},
	{value: 'hard', label: '상 (어려움)'},
];

export default function QuizSelectPage() {
	const router = useRouter();
	const [certs, setCerts] = useState(DEFAULT_CERTS);
	const [selected, setSelected] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [settings, setSettings] = useState({count: 20, difficulty: ''});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// API에서 자격증 목록 로드 시도
		fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/quiz/certificates`)
			.then(r => r.json())
			.then(({data}) => data?.length && setCerts(data))
			.catch(() => {}); // API 미구동 시 기본값 사용
	}, []);

	const handleSelect = cert => {
		setSelected(cert);
		setShowModal(true);
	};

	const handleStart = async () => {
		if (!selected) return;
		setLoading(true);
		router.push(
			`/quiz/exam?cert=${selected.code}&count=${settings.count}&difficulty=${settings.difficulty}`,
		);
	};

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<h1 className={styles.title}>📚 자격증 일타강사</h1>
				<p className={styles.subtitle}>AI 기반 실전 모의고사 & 3단계 해설</p>
			</header>

			<section className={styles.certGrid}>
				{certs.map(cert => (
					<button
						key={cert.code}
						className={styles.certCard}
						onClick={() => handleSelect(cert)}>
						<span className={styles.certName}>{cert.name}</span>
						{cert.count > 0 && (
							<span className={styles.certCount}>{cert.count}문제</span>
						)}
					</button>
				))}
			</section>

			{/* 문제 설정 모달 */}
			{showModal && selected && (
				<div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
					<div className={styles.modal} onClick={e => e.stopPropagation()}>
						<h2 className={styles.modalTitle}>{selected.name}</h2>
						<p className={styles.modalSub}>시험 설정</p>

						<div className={styles.formGroup}>
							<label className={styles.label}>문항 수</label>
							<div className={styles.countBtns}>
								{[10, 20, 50, 100].map(n => (
									<button
										key={n}
										className={`${styles.countBtn} ${settings.count === n ? styles.active : ''}`}
										onClick={() => setSettings(s => ({...s, count: n}))}>
										{n}문제
									</button>
								))}
							</div>
						</div>

						<div className={styles.formGroup}>
							<label className={styles.label}>난이도</label>
							<select
								className={styles.select}
								value={settings.difficulty}
								onChange={e => setSettings(s => ({...s, difficulty: e.target.value}))}>
								{DIFFICULTIES.map(d => (
									<option key={d.value} value={d.value}>
										{d.label}
									</option>
								))}
							</select>
						</div>

						<div className={styles.modalActions}>
							<button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
								취소
							</button>
							<button
								className={styles.startBtn}
								onClick={handleStart}
								disabled={loading}>
								{loading ? '로딩 중...' : '시험 시작 →'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
