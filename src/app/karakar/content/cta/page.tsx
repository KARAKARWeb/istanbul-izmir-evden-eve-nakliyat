'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CTAContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    phoneButtonText: '',
    showPhoneButton: true,
  });

  useEffect(() => {
    fetchCTAData();
  }, []);

  const fetchCTAData = async () => {
    try {
      const response = await fetch('/api/content/cta');
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      console.error('CTA verisi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/content/cta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('CTA içeriği başarıyla kaydedildi!');
        router.refresh();
      } else {
        alert('Kaydetme sırasında hata oluştu');
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Kaydetme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CTA (Çağrı) Bölümü</h1>
        <p className="text-gray-600">Ana sayfadaki çağrı (call-to-action) bölümünü düzenleyin</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Başlık */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Başlık (H2)
          </label>
          <input
            type="text"
            value={formData.heading}
            onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Hemen Teklif Alın!"
            required
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Açıklama Metni
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Ücretsiz fiyat teklifi için formu doldurun veya bizi arayın"
            required
          />
        </div>

        {/* Buton Metni */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Ana Buton Metni
          </label>
          <input
            type="text"
            value={formData.buttonText}
            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Teklif Formu"
            required
          />
        </div>

        {/* Buton Linki */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Ana Buton Linki
          </label>
          <input
            type="text"
            value={formData.buttonLink}
            onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="#fiyat-teklifi"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Sayfa içi bağlantı için # kullanın (örn: #fiyat-teklifi)
          </p>
        </div>

        {/* Telefon Butonu Göster */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showPhoneButton"
            checked={formData.showPhoneButton}
            onChange={(e) => setFormData({ ...formData, showPhoneButton: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showPhoneButton" className="ml-2 text-sm font-medium">
            Telefon Butonunu Göster
          </label>
        </div>

        {/* Telefon Buton Metni */}
        {formData.showPhoneButton && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Telefon Buton Metni
            </label>
            <input
              type="text"
              value={formData.phoneButtonText}
              onChange={(e) => setFormData({ ...formData, phoneButtonText: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Hemen Ara"
              required={formData.showPhoneButton}
            />
            <p className="text-sm text-gray-500 mt-1">
              Telefon numarası otomatik olarak contact.json'dan alınır
            </p>
          </div>
        )}

        {/* Kaydet Butonu */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/karakar/content')}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            İptal
          </button>
        </div>
      </form>

      {/* Önizleme */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Önizleme</h2>
        <div className="bg-gray-50 border rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              {formData.heading || 'Başlık'}
            </h2>
            <p className="text-lg mb-8 text-gray-600">
              {formData.description || 'Açıklama metni'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium">
                {formData.buttonText || 'Buton Metni'}
              </button>
              {formData.showPhoneButton && (
                <button className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium">
                  {formData.phoneButtonText || 'Telefon Butonu'}: 0532 XXX XX XX
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
