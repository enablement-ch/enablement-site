// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.enablement.ch',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, '') || '/';
        return ![
          '/background-previews',
          '/block1-preview',
          '/meeting-booked',
          '/li-playbook-typ',
          '/legacy-case-studies',
        ].includes(path) && !path.startsWith('/case-study-variants/');
      },
    }),
  ],
});
