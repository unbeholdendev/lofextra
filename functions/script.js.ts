import type { Env } from "../env";

export const onRequest: PagesFunction<Env> = async ({ env }) => {
	return fetch(`${env.UMAMI_HOST}/script.js`);
};
