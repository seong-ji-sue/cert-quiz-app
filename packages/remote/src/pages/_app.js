import Head from 'next/head';
import React from 'react';
import Provider from '@/Provider';

function MyApp({Component, pageProps}) {
	return (
		<>
			<Head>
				<meta charSet='UTF-8' />
				<meta name='viewport' content='width=device-width' />
				<title>Remote</title>
			</Head>

			<Provider>
				<Component {...pageProps} />
			</Provider>
		</>
	);
}

export default MyApp;
