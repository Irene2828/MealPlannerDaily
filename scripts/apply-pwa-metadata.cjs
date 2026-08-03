const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const htmlPath = path.join(dist, 'index.html');
const app = {
  name: process.env.PWA_NAME || 'Meal Planner',
  shortName: process.env.PWA_SHORT_NAME || 'Planner',
  description: process.env.PWA_DESCRIPTION || 'A daily planning app for meals and routines.',
  themeColor: '#ffffff',
  backgroundColor: '#ffffff',
};

if (!fs.existsSync(htmlPath)) {
  throw new Error('dist/index.html not found. Run the Expo web export before applying PWA metadata.');
}

let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/<meta name="viewport" content="[^"]*" \/>/, '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />');
html = html.replace(/<title>[^<]*<\/title>/, '<title>' + app.name + '</title>');

const pwaHead = [
  '<meta name="description" content="' + app.description + '" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default" />',
  '<meta name="apple-mobile-web-app-title" content="' + app.shortName + '" />',
  '<meta name="application-name" content="' + app.shortName + '" />',
  '<meta name="theme-color" content="' + app.themeColor + '" />',
  '<link rel="manifest" href="/manifest.json" />',
  '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
  '<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />',
  '<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />',
  '<link rel="icon" href="/favicon.ico" />',
].map((line) => '    ' + line).join('\n');

html = html
  .replace(/\n\s*<meta name="description"[\s\S]*?<link rel="icon" href="\/favicon\.ico"\s*\/?>(?=\n\s*<\/head>)/, '\n' + pwaHead)
  .replace(/\n\s*<link rel="icon" href="\/favicon\.ico"\s*\/?>(?=\n\s*<\/head>)/, '\n' + pwaHead);
fs.writeFileSync(htmlPath, html);

const manifest = {
  name: app.name,
  short_name: app.shortName,
  description: app.description,
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: app.backgroundColor,
  theme_color: app.themeColor,
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
};
fs.writeFileSync(path.join(dist, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const sourceIcon = path.join(root, 'assets', 'icon.png');
for (const file of ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png']) {
  fs.copyFileSync(sourceIcon, path.join(dist, file));
}
