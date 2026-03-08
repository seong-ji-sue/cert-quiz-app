import {useCallback, useEffect, useState} from 'react';
import Axios from '@nextpr/client-common/axios';

const TestComponents = ({api}) => {
	const [data, setData] = useState([]);

	const getData = useCallback(async () => {
		try {
			const res = await Axios.get(api);

			setData(res?.data || []);
		} catch (e) {
			console.error(e);
			setData([]);
		}
	}, [api]);

	useEffect(() => {
		if (api) getData();
	}, [api]);

	return (
		<div>
			{data.map((d) => (
				<ul key={d.name}>
					<li>{d.name}</li>
					<li>{d.description}</li>
				</ul>
			))}
		</div>
	);
};

export default TestComponents;
