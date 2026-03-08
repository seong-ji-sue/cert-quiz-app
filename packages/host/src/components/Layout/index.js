import Nav from '@/components/Layout/Nav';
import Header from '@/components/Layout/Header';
import PrivateProvider from '@/provider/PrivateProvider';
import {DefaultComponent} from '@nextpr/client-common/components';

const Layout = ({children}) => {
	return (
		<>
			<div>
				<div>{children}</div>
				<Nav />
				<Header />
			</div>
			<DefaultComponent />
		</>
	);
};

export default PrivateProvider(Layout);
