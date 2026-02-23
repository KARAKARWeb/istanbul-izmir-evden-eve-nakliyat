import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CTA_FILE_PATH = path.join(process.cwd(), 'data/content/cta.json');

// GET - CTA verisini getir
export async function GET() {
  try {
    const data = await fs.readFile(CTA_FILE_PATH, 'utf-8');
    const ctaData = JSON.parse(data);
    return NextResponse.json(ctaData);
  } catch (error) {
    console.error('CTA verisi okunurken hata:', error);
    // Varsayılan veri döndür
    return NextResponse.json({
      heading: 'Hemen Teklif Alın!',
      description: 'Ücretsiz fiyat teklifi için formu doldurun veya bizi arayın',
      buttonText: 'Teklif Formu',
      buttonLink: '#fiyat-teklifi',
      phoneButtonText: 'Hemen Ara',
      showPhoneButton: true,
    });
  }
}

// POST - CTA verisini güncelle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veriyi doğrula
    if (!body.heading || !body.description || !body.buttonText || !body.buttonLink) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    // Güncellenme zamanını ekle
    const ctaData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Dosyaya yaz
    await fs.writeFile(CTA_FILE_PATH, JSON.stringify(ctaData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, data: ctaData });
  } catch (error) {
    console.error('CTA verisi kaydedilirken hata:', error);
    return NextResponse.json(
      { error: 'Kaydetme sırasında hata oluştu' },
      { status: 500 }
    );
  }
}
