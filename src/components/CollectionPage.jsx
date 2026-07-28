import ArtworkGallery from './ArtworkGallery.jsx';
import HeroSection from './HeroSection.jsx';

export default function CollectionPage({
  active,
  collection,
  language,
  onOpenArtwork,
  onViewDetails,
  songs,
}) {
  return (
    <section
      aria-labelledby={`collection-title-${collection.id}`}
      className="collection-page"
      data-collection-page={collection.id}
      hidden={!active}
    >
      <HeroSection active={active} collection={collection} />
      <ArtworkGallery
        active={active}
        language={language}
        onOpenArtwork={onOpenArtwork}
        onViewDetails={onViewDetails}
        songs={songs}
        works={collection.works}
      />
    </section>
  );
}
