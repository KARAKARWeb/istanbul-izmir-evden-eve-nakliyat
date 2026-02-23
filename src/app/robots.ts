import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default function robots(): MetadataRoute.Robots {
  // Dashboard settings'ten ayarları oku
  let crawlDelay = 0;
  let userAgentRules = '';
  let siteUrl = 'https://istanbulkusadasievdenevenakliyat.com';
  
  try {
    const settingsPath = path.join(process.cwd(), 'data/settings/robots.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    crawlDelay = parseInt(settings.crawlDelay) || 0;
    userAgentRules = settings.userAgentRules || '';
  } catch (error) {
    // Default settings
  }

  try {
    const siteSettingsPath = path.join(process.cwd(), 'data/settings/site.json');
    const siteSettings = JSON.parse(fs.readFileSync(siteSettingsPath, 'utf-8'));
    siteUrl = `https://${siteSettings.domain}`;
  } catch (error) {
    // Default domain - site.json'dan otomatik alınır
  }

  const rules: MetadataRoute.Robots['rules'] = [
    {
      userAgent: '*',
      allow: '/',
      disallow: ['/karakar/', '/api/'],
      crawlDelay: crawlDelay > 0 ? crawlDelay : undefined,
    },
    {
      userAgent: 'Googlebot',
      allow: '/',
      disallow: ['/karakar/', '/api/'],
    },
    {
      userAgent: 'Bingbot',
      allow: '/',
      disallow: ['/karakar/', '/api/'],
    },
  ];

  return {
    rules,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
