export default function manifest() {
  return {
    name: 'Radha Krishna BD',
    short_name: 'RadhaKrishna',
    description: 'Radha Krishna BD Application',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#eab308',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}