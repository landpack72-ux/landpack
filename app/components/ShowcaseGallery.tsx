type ShowcaseImage = {
  src: string;
  alt: string;
  caption: string;
};

export default function ShowcaseGallery({
  images,
  tone = "vivid",
}: {
  images: ShowcaseImage[];
  tone?: "vivid" | "soft";
}) {
  const cols =
    images.length >= 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : "sm:grid-cols-2";

  return (
    <div className={`grid gap-5 ${cols}`}>
      {images.map((img) => (
        <figure
          key={img.src}
          className="overflow-hidden rounded-2xl border-2 border-ink/10 bg-paper"
        >
          <div className="h-56 overflow-hidden sm:h-64">
            <img
              src={img.src}
              alt={img.alt}
              className={`h-full w-full object-cover transition-transform duration-700 hover:scale-105 ${
                tone === "vivid" ? "photo-kraft-tone" : ""
              }`}
              style={
                tone === "soft"
                  ? { filter: "saturate(1.04) contrast(1.02) brightness(1.03)" }
                  : undefined
              }
            />
          </div>
          <figcaption className="px-4 py-3 font-body text-sm text-ink-soft">
            {img.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
