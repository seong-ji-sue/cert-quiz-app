import Axios from '@nextpr/client-common/axios';
import {bffReqApi} from '@nextpr/client-common/api';
import Editor from '@/components/edit/Editor';
import {DefaultComponent} from '@nextpr/client-common/components';

const Index = ({baseUrl}) => {
	if (baseUrl && Axios.defaults.baseURL != baseUrl) {
		console.log(baseUrl);
		Axios.defaults.baseURL = baseUrl;
	}

	const api = bffReqApi.test;

	const props = {
		api: api,
	};

	return (
		<div>
			<Editor {...props} />
			<DefaultComponent />
		</div>
	);
};

export default Index;

export const getServerSideProps = async () => {
	return {props: {baseUrl: process.env.NEXT_PUBLIC_REMOTE_URL}};
};
