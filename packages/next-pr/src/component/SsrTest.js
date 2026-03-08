import React, {useEffect, useState} from 'react';

function SsrTest(props) {
	const [asd, setAsd] = useState('SsrTest');

	useEffect(() => {
		setAsd('asdasd');
	}, []);
	return <div>{asd} 컴포넌트</div>;
}

export default SsrTest;
