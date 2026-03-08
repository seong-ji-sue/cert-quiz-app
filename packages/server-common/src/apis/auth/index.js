const login = async ({id, password}) => {
	console.log(id, password);

	return {status: 200};
};

export default {
	login,
};
