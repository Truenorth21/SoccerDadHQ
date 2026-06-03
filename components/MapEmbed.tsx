/** Real, interactive OpenStreetMap embed with a marker — no dependency, no API key. */
export default function MapEmbed({
  lat,
  lng,
  label,
  zip,
  city,
}: {
  lat: number;
  lng: number;
  label: string;
  zip?: string;
  city?: string;
}) {
  const d = 0.025; // ~1.7 mi bounding box around the point
  const bbox = `${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="card overflow-hidden">
      <iframe
        title={`Map showing ${label}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-56 w-full border-0"
      />
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-sm">
        <span className="text-slate-500">
          {city ? `${city}, FL` : "Florida"}
          {zip ? ` ${zip}` : ""}
        </span>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-blue hover:underline"
        >
          Directions →
        </a>
      </div>
    </div>
  );
}
