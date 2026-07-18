import ArtworkGallery from './ArtworkGallery.jsx';
import HeroSection from './HeroSection.jsx';

export default function CollectionPage({ active, collection, songs }) {
  return (
    <section
      aria-labelledby={`collection-title-${collection.id}`}
      className="collection-page"
      data-collection-page={collection.id}
      hidden={!active}
    >
      <HeroSection collection={collection} />
      <ArtworkGallery works={collection.works} songs={songs} />
    </section>
  );
}
