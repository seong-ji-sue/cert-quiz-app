import dynamic from 'next/dynamic';
import {loadRemote} from '@module-federation/runtime';

const Component = dynamic(() => loadRemote('remote/Edit'), {ssr: false});

const Index = ({remoteUrl}) => {
	return <Component baseUrl={remoteUrl} />;
};

export default Index;

export async function getServerSideProps() {
	return {props: {remoteUrl: process.env.NEXT_PUBLIC_REMOTE_URL}};
}
