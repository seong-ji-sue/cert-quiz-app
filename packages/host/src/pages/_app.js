import '@nextpr/client-common/global-styles.scss';

import React, {Suspense} from 'react';
import Head from 'next/head';
import getConfig from 'next/config';
import {init} from '@module-federation/runtime';
import Provider from '@/Provider';
import Layout from '@/components/Layout';
import {DefaultComponent} from '@nextpr/client-common/components';
const {publicRuntimeConfig} = getConfig();

init({
	name: 'host',
	remotes: [
		{
			name: `remote`,
			entry: `${publicRuntimeConfig.remote}/_next/static/chunks/remoteEntry.js`,
		},
	],
});

function MyApp({Component, pageProps}) {
	const getLayout = Component.getLayout ?? ((page) => page);
	return (
		<>
			<Head>
				<meta charSet='UTF-8' />
				<meta name='viewport' content='width=device-width' />
				<title>Client</title>
			</Head>
			<Provider>
				{Component.getLayout ? (
					getLayout(
						<>
							<Component {...pageProps} />
						</>,
					)
				) : (
					<Layout>
						<Suspense fallback={<div>Loading</div>}>
							<Component {...pageProps} />
						</Suspense>
					</Layout>
				)}
			</Provider>
		</>
	);
}

export default MyApp;
