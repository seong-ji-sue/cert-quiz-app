import fs from 'fs';
import path from 'path';

const REGISTRY_PATH = path.resolve(process.cwd(), '../../data/registry.json');

export default function handler(req, res) {
	if (req.method !== 'GET') return res.status(405).end();

	try {
		const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
		const certs = Object.entries(registry.categories)
			.filter(([, cat]) => cat.exams?.length > 0)
			.map(([code, cat]) => {
				// 총 문제 수 추산 (시험 수 × 100)
				const examCount = cat.exams.length;
				return {
					code,
					name: cat.name,
					examCount,
					count: examCount * 100,
				};
			});

		res.status(200).json({data: certs});
	} catch (e) {
		res.status(500).json({error: e.message});
	}
}
