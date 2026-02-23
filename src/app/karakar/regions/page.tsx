import { RegionsPageClient } from '@/components/dashboard/RegionsPageClient';
import fs from 'fs/promises';
import path from 'path';

const REGIONS_DIR = path.join(process.cwd(), 'data/regions');

async function getRegions() {
  try {
    const files = await fs.readdir(REGIONS_DIR);
    const regions = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const data = await fs.readFile(path.join(REGIONS_DIR, file), 'utf-8');
          return JSON.parse(data);
        })
    );
    
    regions.sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return regions;
  } catch (error) {
    console.error('Regions load error:', error);
    return [];
  }
}

async function getDescription() {
  try {
    const contentPath = path.join(process.cwd(), 'data/content/regions-showcase.json');
    const data = await fs.readFile(contentPath, 'utf-8');
    const content = JSON.parse(data);
    return content.pageDescription || '';
  } catch (error) {
    return '';
  }
}

export default async function RegionsPage() {
  const regions = await getRegions();
  const description = await getDescription();

  return <RegionsPageClient initialRegions={regions} initialDescription={description} />;

}
