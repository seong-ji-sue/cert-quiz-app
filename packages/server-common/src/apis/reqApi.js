import {compile} from 'path-to-regexp';

export const regExpToPathConvertor = (path, options) => {
	const compiler = compile(path);

	return compiler(options);
};

export const reqApi = Object.freeze({
	test: '/test/:testNum',
});
