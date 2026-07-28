import ArtworkDetailsDialog from './ArtworkDetailsDialog.jsx';
import ArtworkLightbox from './ArtworkLightbox.jsx';

export default function Overlays({
  detailsWork,
  language,
  lightboxSelection,
  onCloseDetails,
  onCloseLightbox,
  onSelectLightbox,
}) {
  return (
    <>
      <ArtworkDetailsDialog onClose={onCloseDetails} work={detailsWork} />
      <ArtworkLightbox
        language={language}
        onClose={onCloseLightbox}
        onSelect={onSelectLightbox}
        selection={lightboxSelection}
      />
    </>
  );
}
