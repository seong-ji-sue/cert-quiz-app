import {urlPath} from '@nextpr/client-common/contents';

export const navContent = [
	{
		title: urlPath.label,
		url: urlPath.path,
	},
	{
		title: urlPath.test.label,
		url: urlPath.test.path,
	},
	{
		title: urlPath.table.label,
		base: urlPath.table.path,
		content: [
			{
				title: urlPath.table.basic.label,
				url: urlPath.table.basic.path,
			},
		],
	},
];
