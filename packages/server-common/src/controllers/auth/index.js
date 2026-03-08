import apis from '../../apis';

const login = async (req, res) => {
	console.log(req.body);
	const data = await apis.auth.login({
		id: req.body.id,
		password: req.body.password,
	});

	res.status(data.status).send({id: req.body.id});
};

export default {login};
