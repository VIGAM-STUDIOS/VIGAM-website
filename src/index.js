// Serves the VIGAM site from static assets, and the KLANG site under /klang/
// by forwarding those requests to the separate klang-website Worker.

const KLANG_PREFIX = "/klang";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === KLANG_PREFIX) {
      url.pathname = `${KLANG_PREFIX}/`;
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname.startsWith(`${KLANG_PREFIX}/`)) {
      return proxyToKlang(request, url, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function proxyToKlang(request, url, env) {
  const upstream = new URL(url);
  upstream.pathname = url.pathname.slice(KLANG_PREFIX.length);

  const response = await env.KLANG.fetch(new Request(upstream, request));

  // KLANG's own redirects (e.g. /legal.html -> /legal) are root-relative,
  // so put them back under /klang.
  const location = response.headers.get("Location");
  if (!location) return response;

  const target = new URL(location, upstream);
  if (target.host !== upstream.host) return response;

  const headers = new Headers(response.headers);
  headers.set("Location", `${KLANG_PREFIX}${target.pathname}${target.search}${target.hash}`);
  return new Response(response.body, { status: response.status, headers });
}
