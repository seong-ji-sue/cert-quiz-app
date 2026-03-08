import {compile} from 'path-to-regexp';

export const regExpToPathConvertor = (path, options) => {
	const compiler = compile(path);

	return compiler(options);
};

export const bffReqApi = Object.freeze({
	test: '/api/testa',
	auth: {
		login: '/api/auth/authorized',
	},
});

export const reqApiKeys = Object.freeze({
	test: {key: 'testNum'},
});
