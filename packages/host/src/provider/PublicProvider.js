import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {useRecoilValue} from 'recoil';
import {authState} from '@nextpr/client-common/store/auth';

const PublicProvider = ({children}) => {
	const router = useRouter();
	const auth = useRecoilValue(authState);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		if (auth?.id) {
			router.replace('/');
		} else {
			setIsReady(true);
		}
	}, [auth, router]);

	if (!isReady) {
		return null;
	}

	return <>{children}</>;
};

export default PublicProvider;
