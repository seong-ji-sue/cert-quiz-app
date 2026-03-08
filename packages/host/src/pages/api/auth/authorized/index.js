import {middleware} from '@nextpr/server-common/middleware';
import controllers from '@nextpr/server-common/controllers';
import {ApiMethods} from '@nextpr/server-common/methods';

export default async function handler(req, res) {
	try {
		if (req.method === ApiMethods.POST) {
			await middleware(req, res, controllers.auth.login);
		}
	} catch (e) {
		console.error(e);
	}
}

export const config = {api: {externalResolver: true}};
