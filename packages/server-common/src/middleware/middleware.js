export const middleware = async (req, res, next) => {
	await next(req, res);
};
