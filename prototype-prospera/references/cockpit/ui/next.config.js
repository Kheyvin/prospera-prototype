/** @type {import('next').NextConfig} */
// COCKPIT_UI_STATIC=1 (set por build-ui.sh) → output:'export', embebido en el
// binario `directorio` vía go:embed (Stage 4 · CK-07). Sin la env → `next dev`
// con rewrites hacia el backend Go real (:4100) — cockpit/ui nunca tuvo
// app/api/* propias, siempre habló con un backend real.
const isStatic = process.env.COCKPIT_UI_STATIC === '1';

const nextConfig = {
  output: isStatic ? 'export' : undefined,
  ...(isStatic ? { trailingSlash: true } : {}),
  reactStrictMode: true,
  ...(isStatic
    ? {}
    : {
        async rewrites() {
          return [
            { source: '/api/:path*', destination: 'http://localhost:4100/api/:path*' },
          ];
        },
      }),
};

module.exports = nextConfig;
