import axios from 'axios';

const Axios = axios.create({
	withCredentials: true,
	paramsSerializer: {indexes: null},
	timeout: 10000,
});

Axios.interceptors.request.use(
	function (config) {
		return config;
	},
	function (error) {
		return Promise.reject(error);
	},
);

export default Axios;
