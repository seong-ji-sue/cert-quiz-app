import {useEffect, useState} from 'react'; // useState 추가
import {isEmpty} from 'lodash-es';
import {useRouter} from 'next/router';
import {authState} from '@nextpr/client-common/store/auth';
import {useRecoilValue} from 'recoil';

const PrivateProvider = (Component) => {
	const WrappedComponent = (props) => {
		const router = useRouter();
		const auth = useRecoilValue(authState);
		// 1. 마운트 여부를 확인하는 상태 추가
		const [isMounted, setIsMounted] = useState(false);

		useEffect(() => {
			// 2. 컴포넌트가 브라우저에 마운트되면 true로 변경
			setIsMounted(true);

			if (isEmpty(auth)) {
				router.replace('/auth/authorized');
			}
		}, [auth, router]);

		// 3. 마운트가 아직 안 됐거나(서버 포함), 로그인이 안 된 경우
		// 아예 아무것도 렌더링하지 않음 (서버와 클라이언트 초기 상태 일치)
		if (!isMounted || isEmpty(auth)) {
			return null;
		}

		return <Component {...props} />;
	};

	// 아래 for문의 정체는 뒤에서 설명해 드릴게요.
	for (const key in Component) {
		if (Object.prototype.hasOwnProperty.call(Component, key)) {
			WrappedComponent[key] = Component[key];
		}
	}

	return WrappedComponent;
};

PrivateProvider.displayName = 'PrivateRouter';

export default PrivateProvider;
