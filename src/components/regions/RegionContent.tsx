interface RegionContentProps {
  content?: string;
}

export function RegionContent({ content }: RegionContentProps) {
  if (!content) {
    return (
      <div className="prose prose-gray max-w-none">
        <h2>Hizmet Detayları</h2>
        <p>Bu bölge için detaylı içerik hazırlanmaktadır.</p>
      </div>
    );
  }

  return (
    <div 
      className="prose prose-gray max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
