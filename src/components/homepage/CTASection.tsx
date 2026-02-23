'use client';

interface CTASectionProps {
  contactData?: any;
  ctaData?: {
    heading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    phoneButtonText: string;
    showPhoneButton: boolean;
  };
}

export function CTASection({ contactData, ctaData }: CTASectionProps) {
  // Varsayılan değerler - ctaData yoksa
  const heading = ctaData?.heading || 'Hemen Teklif Alın!';
  const description = ctaData?.description || 'Ücretsiz fiyat teklifi için formu doldurun veya bizi arayın';
  const buttonText = ctaData?.buttonText || 'Teklif Formu';
  const buttonLink = ctaData?.buttonLink || '#fiyat-teklifi';
  const phoneButtonText = ctaData?.phoneButtonText || 'Hemen Ara';
  const showPhoneButton = ctaData?.showPhoneButton !== false;

  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-text-primary">
            {heading}
          </h2>
          <p className="text-lg mb-8 text-text-secondary">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={buttonLink}
              className="bg-accent text-white hover:bg-accent-hover px-8 py-4 rounded-lg font-medium transition-colors"
            >
              {buttonText}
            </a>
            {showPhoneButton && contactData && (
              <a
                href={`tel:${contactData.phone}`}
                className="bg-background border-2 border-border text-text-primary hover:border-accent hover:text-accent px-8 py-4 rounded-lg font-medium transition-colors"
              >
                {phoneButtonText}: {contactData.phone.replace('+90 ', '0').replace(/\s/g, ' ')}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
