import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileFloatingButtons } from '@/components/shared/MobileFloatingButtons';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import { getSiteSettings, getContactSettings } from '@/lib/seo/getContactSettings';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { TOC } from '@/components/shared/TOC';
import { RegionContent } from '@/components/regions/RegionContent';
import { RouteInfoSection } from '@/components/regions/RouteInfoSection';
import { PricingSection } from '@/components/homepage/PricingSection';
import { FAQSection } from '@/components/homepage/FAQSection';
import { ReviewsSection } from '@/components/regions/ReviewsSection';
import { Metadata } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';

const tocItems = [
  { id: 'genel-bilgi', title: 'Genel Bilgi', level: 1 },
  { id: 'rota-bilgileri', title: 'Rota Bilgileri', level: 1 },
  { id: 'icerik', title: 'Hizmet Detayları', level: 1 },
  { id: 'fiyatlandirma', title: 'Fiyatlandırma', level: 1 },
  { id: 'sss', title: 'Sık Sorulan Sorular', level: 1 },
  { id: 'yorumlar', title: 'Müşteri Yorumları', level: 1 },
  { id: 'cta', title: 'Teklif Alın', level: 1 },
];

// Tüm bölgeleri getir - SSG için
async function getAllRegions() {
  try {
    const regionsDir = path.join(process.cwd(), 'data/regions');
    const files = await fs.readdir(regionsDir);
    const regions = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const data = await fs.readFile(path.join(regionsDir, file), 'utf-8');
          return JSON.parse(data);
        })
    );
    return regions.filter(r => r.active || r.status === 'active');
  } catch (error) {
    console.error('Error reading regions:', error);
    return [];
  }
}

// Tek bölge getir - domain bağımsız
async function getRegion(slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'data/regions', `${slug}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    const region = JSON.parse(data);
    return (region.active || region.status === 'active') ? region : null;
  } catch (error) {
    return null;
  }
}

// SSG + ISR: Build-time'da oluştur, 1 saatte bir güncelle
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 saat cache

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// SSG: Tüm bölge sayfalarını build-time'da oluştur
export async function generateStaticParams() {
  const regions = await getAllRegions();
  return regions.map((region) => ({
    slug: region.slug || region.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const region = await getRegion(slug);

  if (!region) {
    return {
      title: 'Bölge Bulunamadı',
    };
  }

  // Title: metaTitle varsa kullan, yoksa title kullan
  const pageTitle = region.metaTitle || region.title;
  
  // Description: metaDescription varsa kullan, yoksa content'in ilk 150 karakterini al
  let pageDescription = region.metaDescription;
  if (!pageDescription && region.content) {
    // HTML tag'lerini temizle ve ilk 150 karakteri al
    const cleanContent = region.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    pageDescription = cleanContent.substring(0, 150) + (cleanContent.length > 150 ? '...' : '');
  }
  // Hala yoksa otomatik oluştur
  if (!pageDescription) {
    pageDescription = `${region.sourceCity || region.region} ${region.targetCity || region.city} arası evden eve nakliyat. ${region.distance || 0} km mesafe, ${region.duration || 0} saat süre. ${region.priceMin || 0}₺'den başlayan fiyatlarla sigortalı taşıma.`;
  }

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: `/${slug}`,
      languages: {
        'tr': `/${slug}`,
        'x-default': `/${slug}`,
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `/${slug}`,
      type: 'website',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${region.title} | Profesyonel Nakliyat`,
      description: `${region.sourceCity || region.region} ${region.targetCity || region.city} arası ${region.distance || 0} km profesyonel nakliyat hizmeti.`,
    },
    other: {
      'content-language': 'tr',
    },
  };
}

// Viewport ayrı export - Next.js 15 requirement
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RegionPage({ params }: PageProps) {
  const { slug } = await params;
  const region = await getRegion(slug);

  if (!region) {
    notFound();
  }

  const siteSettings = await getSiteSettings();
  const contactSettings = await getContactSettings();

  // Pricing data server-side fetch
  let pricingData = null;
  try {
    const pricingPath = path.join(process.cwd(), 'data/content/pricing.json');
    const pricingContent = await fs.readFile(pricingPath, 'utf-8');
    pricingData = JSON.parse(pricingContent);
  } catch (error) {
    console.error('Pricing data load error:', error);
  }

  // Regions data server-side fetch for footer
  let regionsData = [];
  try {
    const regionsDir = path.join(process.cwd(), 'data/regions');
    const files = await fs.readdir(regionsDir);
    const regions = await Promise.all(
      files
        .filter((file: string) => file.endsWith('.json'))
        .map(async (file: string) => {
          const filePath = path.join(regionsDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(data);
        })
    );
    const activeRegions = regions.filter((r: any) => r.active || r.status === 'active');
    activeRegions.sort((a: any, b: any) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    regionsData = activeRegions.slice(0, 6);
  } catch (error) {
    console.error('Regions data load error:', error);
  }

  // Footer data server-side fetch
  let footerData = null;
  try {
    const footerLayer1Path = path.join(process.cwd(), 'data/footer/layer-1.json');
    const footerLayer2Path = path.join(process.cwd(), 'data/footer/layer-2.json');
    const footerLayer3Path = path.join(process.cwd(), 'data/footer/layer-3.json');
    const [layer1, layer2, layer3] = await Promise.all([
      fs.readFile(footerLayer1Path, 'utf-8').then((d: string) => JSON.parse(d)).catch(() => null),
      fs.readFile(footerLayer2Path, 'utf-8').then((d: string) => JSON.parse(d)).catch(() => null),
      fs.readFile(footerLayer3Path, 'utf-8').then((d: string) => JSON.parse(d)).catch(() => null),
    ]);
    footerData = { layer1, layer2, layer3 };
  } catch (error) {
    console.error('Footer data load error:', error);
  }

  // Region data'dan routeInfo oluştur - domain bağımsız
  const routeInfo = {
    fromCity: region.sourceCity || region.region,
    toCity: region.targetCity || region.city,
    sourceCity: region.sourceCity || region.region,
    targetCity: region.targetCity || region.city,
    distance: region.distance || 0,
    duration: region.duration || 0,
    basePrice: region.priceMin || 1500,
    title: region.title,
    description: region.description || '',
  };

  // Reviews data - SSR uyumlu, doğrudan region JSON'dan
  const reviews = region.reviews || [];
  const aggregateRating = reviews.length > 0 ? {
    ratingValue: Math.round((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  } : null;

  return (
    <div className="min-h-screen bg-surface">
      <Header siteSettings={siteSettings} contactData={contactSettings} />
      
      {/* Hero Section */}
      <section className="bg-[#F3F3F3] border-b border-border py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-text-primary mb-6">
            {region.title}
          </h1>
          <Breadcrumbs 
            items={[
              { label: 'Hizmet Bölgeleri', href: '/bolgeler' },
              { label: region.title }
            ]} 
          />
        </div>
      </section>
      
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Rota Bilgileri */}
          <RouteInfoSection
            distance={region.distance || 0}
            duration={region.duration || 0}
            priceMin={region.priceMin || 0}
            sourceCity={region.sourceCity || region.region}
            targetCity={region.targetCity || region.city}
            regionTitle={region.title}
          />
          
          {/* TOC Section */}
          <div className="mb-8">
            <TOC items={tocItems} />
          </div>

          {/* İçerik */}
          <div id="icerik" className="bg-background p-8 rounded-xl border border-border mb-8">
            <RegionContent content={region.content} />
          </div>

          {/* Fiyatlandırma */}
          <div id="fiyatlandirma">
            <PricingSection regionTitle={`${region.sourceCity || region.region} ${region.targetCity || region.city}`} routeInfo={routeInfo} pricingData={pricingData} />
          </div>

          {/* SSS - Sık Sorulan Sorular */}
          {region.faqs && region.faqs.length > 0 && (
            <div id="sss">
              <FAQSection regionFaqs={region.faqs} />
            </div>
          )}

          {/* Müşteri Yorumları */}
          <div id="yorumlar">
            <ReviewsSection regionTitle={region.title} reviews={reviews} aggregateRating={aggregateRating} />
          </div>

        </div>
      </main>

      <Footer siteSettings={siteSettings} contactData={contactSettings} footerData={footerData} regionsData={regionsData} />
      
      {/* Mobile Floating Buttons */}
      <MobileFloatingButtons contactData={contactSettings} />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
