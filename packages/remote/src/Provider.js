'use client';

import {RecoilRoot} from 'recoil';
import {Suspense} from 'react';

function Provider({children}) {
	return (
		<RecoilRoot>
			<Suspense>{children}</Suspense>
		</RecoilRoot>
	);
}

export default Provider;
