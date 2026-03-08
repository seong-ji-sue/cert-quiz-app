import next from 'next';
import {parse} from 'url';
import express from 'express';
import config from './next.config.js';
import {resolve} from 'path';
import * as http from 'http';

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

	server.use((req, res, next) => {
		next();
	});

	server.use((req, res) => {
		const parsedUrl = parse(req.url, true);
		handle(req, res, parsedUrl);
	});

	//https 설정 넣기
	http
		.createServer(server)
		.listen(process.env.NEXT_PUBLIC_HOST_PORT, (err) => {
			if (err) {
				console.log(err);
				throw err;
			}
		});
});
