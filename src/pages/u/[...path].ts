import type { APIRoute } from 'astro';

export const prerender = false;

// import.meta.env freezes the value into the bundle at build; this has to be read at runtime.
const upstream = process.env.UMAMI_URL;

const forward = ['content-type', 'user-agent', 'x-umami-cache'];

// Allowlisted, so a response header naming the origin cannot leak by being added upstream.
const expose = ['content-type', 'cache-control', 'etag', 'last-modified'];

const proxy: APIRoute = async ({ params, request, clientAddress }) => {
	// A catch-all would publish Umami's login route on this domain.
	const path = params.path;
	if (!upstream || (path !== 'script.js' && path !== 'api/send')) {
		return new Response(null, { status: 404 });
	}

	const headers = new Headers();
	for (const name of forward) {
		const value = request.headers.get(name);
		if (value) headers.set(name, value);
	}

	let body: string | undefined;
	if (request.method === 'POST') {
		// Leftmost is safe only because Dokploy's Traefik replaces any client-sent X-Forwarded-For.
		const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress;
		const text = await request.text();
		try {
			const sent = JSON.parse(text);
			body = sent?.payload ? JSON.stringify({ ...sent, payload: { ...sent.payload, ip } }) : text;
		} catch {
			body = text;
		}
	}

	let response: Response;
	try {
		response = await fetch(`${upstream}/${path}`, {
			method: request.method,
			headers,
			body,
			signal: AbortSignal.timeout(3000),
		});
	} catch {
		return new Response(null, { status: 502 });
	}

	const out = new Headers();
	for (const name of expose) {
		const value = response.headers.get(name);
		if (value) out.set(name, value);
	}
	return new Response(response.body, { status: response.status, headers: out });
};

export const GET = proxy;
export const POST = proxy;
