import {Head, Html, Main, NextScript} from 'next/document';

export default function Document() {
	return (
		<Html lang='en'>
			<Head />
			<body className={'main_area'}>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
