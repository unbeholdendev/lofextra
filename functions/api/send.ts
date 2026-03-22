import type { Env } from "../../env";

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
	return fetch(`${env.UMAMI_HOST}/api/send`, {
		method: request.method,
		headers: request.headers,
		body: request.body,
	});
};
