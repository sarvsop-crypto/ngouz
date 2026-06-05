// Routing for the React member-app SPA mounted at /cabinet/.
//
// Why a Function instead of _redirects: Pages serves the static asset if one
// exists, but a `_redirects` `200` splat fallback (/cabinet/* -> index.html)
// doesn't fire for client-side routes here (the index.html -> /cabinet/
// canonicalization breaks the rewrite), so deep links like /cabinet/home 404.
// This Function (directory mode, runs before _redirects for /cabinet/*) serves
// real assets, 301s the legacy static-cabinet paths, and otherwise falls back
// to the SPA entry document so React Router can take over.

const LEGACY = {
  'cabinet-login': 'login',
  'cabinet-register': 'signup',
  'cabinet-forgot-password-request': 'forgot-password',
  'cabinet-dashboard': 'home',
  'cabinet-reports': 'reports',
  'cabinet-grants': 'grants',
  'cabinet-events': 'events',
  'cabinet-news': 'news',
  'cabinet-documents': 'documents',
  'cabinet-notifications': 'inbox',
  'cabinet-applications': 'grants/applications',
  'cabinet-organization': 'profile/organization',
  'cabinet-settings-security': 'profile/security/password',
  'cabinet-settings-org': 'profile/organization',
  'cabinet-settings': 'profile',
  'cabinet-support': 'home',
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Normalize bare /cabinet -> /cabinet/
  if (url.pathname === '/cabinet') {
    return Response.redirect(new URL('/cabinet/', url.origin).toString(), 301);
  }

  const rest = url.pathname.replace(/^\/cabinet\//, '');
  const firstSeg = rest.split('/')[0];

  // Legacy static-cabinet paths -> React routes (preserve old bookmarks).
  if (Object.prototype.hasOwnProperty.call(LEGACY, firstSeg)) {
    return Response.redirect(
      new URL('/cabinet/' + LEGACY[firstSeg], url.origin).toString(),
      301,
    );
  }

  // Serve the real static asset if one exists (assets/, brand/, i18n/, ...).
  const assetRes = await env.ASSETS.fetch(request);
  if (assetRes.status !== 404) return assetRes;

  // SPA fallback: serve the cabinet entry document with a 200 so React Router
  // can resolve the client-side route (e.g. /cabinet/home, /cabinet/profile).
  const indexRes = await env.ASSETS.fetch(new Request(new URL('/cabinet/', url.origin)));
  return new Response(indexRes.body, {
    status: 200,
    headers: indexRes.headers,
  });
}
