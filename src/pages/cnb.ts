import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const date = url.searchParams.get("date");
  if (!date || !/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
    return new Response(null, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt?date=${date}`,
      { signal: AbortSignal.timeout(5000) }
    );
    return new Response(await response.text(), {
      status: response.status,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
};
