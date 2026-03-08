import {useRouter} from 'next/router';
import styles from './index.module.scss';

export default function Home() {
	const router = useRouter();

	return (
		<div className={styles.home}>
			<div className={styles.hero}>
				<h1 className={styles.heroTitle}>
					📚 자격증 <span className={styles.highlight}>AI 일타강사</span>
				</h1>
				<p className={styles.heroDesc}>
					AI가 실전 모의고사를 출제하고, 틀린 문제만 골라 3단계 해설을 제공합니다.
					<br />정보처리기사 · 정보보안기사 · 컴퓨터활용능력 완벽 대비!
				</p>
				<div className={styles.heroBtns}>
					<button
						className={styles.primaryBtn}
						onClick={() => router.push('/quiz')}>
						지금 시작하기 →
					</button>
					<button
						className={styles.secondaryBtn}
						onClick={() => router.push('/auth/authorized')}>
						로그인
					</button>
				</div>
			</div>

			<div className={styles.features}>
				{[
					{icon: '🎯', title: '실전 모의고사', desc: '기출 기반 변형 문제, 보기 셔플로 시각적 힌트 제거'},
					{icon: '🤖', title: 'AI 3단계 해설', desc: '초등학생 비유 · 핵심 개념 · 보기 전면 해부'},
					{icon: '📊', title: '학습 이력 분석', desc: '오답 노트, 과목별 정답률, 약점 파악'},
				].map(f => (
					<div key={f.title} className={styles.featureCard}>
						<span className={styles.featureIcon}>{f.icon}</span>
						<h3 className={styles.featureTitle}>{f.title}</h3>
						<p className={styles.featureDesc}>{f.desc}</p>
					</div>
				))}
			</div>
		</div>
	);
}
