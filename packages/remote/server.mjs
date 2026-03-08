import next from 'next';
import express from 'express';
import config from './next.config.js';
import {resolve} from 'path';
import cors from 'cors';
import * as http from 'http';
import {parse} from 'url';

const __dirname = resolve();
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev, dir: __dirname, conf: config});
const handle = app.getRequestHandler();

// const sslOptions = {
//     key: fs.readFileSync('./../../certificates/STAR.netand.co.kr_key.pem'),
//     cert: fs.readFileSync('./../../certificates/STAR.netand.co.kr_crt.pem'),
// };

app.prepare().then(() => {
	const server = express();

	server.use(
		cors({origin: [process.env.NEXT_PUBLIC_HOST_URL], credentials: true}),
	);

	server.use((req, res, next) => {
		res.setHeader(
			'Access-Control-Allow-Origin',
			process.env.NEXT_PUBLIC_HOST_URL,
		);

		next();
	});

	server.use((req, res) => {
		const parsedUrl = parse(req.url, true);
		handle(req, res, parsedUrl);
	});
	http
		.createServer(server)
		.listen(process.env.NEXT_PUBLIC_REMOTE_PORT, (err) => {
			if (err) {
				console.log(err);
				throw err;
			}
		});
});
