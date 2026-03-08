import fs from 'fs';
import path from 'path';

const DATA_ROOT = path.resolve(process.cwd(), '../../data');

function shuffle(arr) {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export default function handler(req, res) {
	if (req.method !== 'GET') return res.status(405).end();

	const {certificateCode, count = '20', subject} = req.query;
	const limit = Math.min(parseInt(count) || 20, 100);

	try {
		const registry = JSON.parse(
			fs.readFileSync(path.join(DATA_ROOT, 'registry.json'), 'utf-8'),
		);

		const cat = registry.categories[certificateCode];
		if (!cat || !cat.exams?.length) {
			return res.status(404).json({error: '해당 자격증 데이터 없음'});
		}

		// 모든 시험 파일에서 문제 수집
		let allQuestions = [];
		for (const exam of cat.exams) {
			const filePath = path.join(DATA_ROOT, '..', exam.file);
			if (!fs.existsSync(filePath)) continue;
			const examData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
			allQuestions.push(
				...examData.questions.map(q => ({
					id: `${exam.examId}-${q.no}`,
					number: q.no,
					subject: q.subject,
					content: q.question,
					options: q.options.map(o => o.text),
					answer: q.answer,
					source: `[${exam.date} ${q.no}번]`,
					examId: exam.examId,
				})),
			);
		}

		// 과목 필터
		if (subject) {
			allQuestions = allQuestions.filter(q => q.subject === subject);
		}

		// 셔플 후 제한
		const selected = shuffle(allQuestions).slice(0, limit);

		res.status(200).json({
			data: selected,
			meta: {total: allQuestions.length, returned: selected.length},
		});
	} catch (e) {
		res.status(500).json({error: e.message});
	}
}
