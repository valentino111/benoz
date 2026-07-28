import { useEffect, useRef } from 'react';
import { formatEdition } from '../data/edition.js';

function LanguageText({ en, he }) {
  return (
    <>
      <span data-lang="he" lang="he" dir="rtl">{he}</span>
      <span data-lang="en" lang="en" dir="ltr">{en}</span>
    </>
  );
}

function whatsappUrl(work) {
  if (!work) return 'https://wa.me/972544520987';
  const message = work.available
    ? `Hello, I am interested in "${work.titleEn}" (${work.price}).`
    : `Hello, I would like more information about "${work.titleEn}".`;
  return `https://wa.me/972544520987?text=${encodeURIComponent(message)}`;
}

export default function ArtworkDetailsDialog({ onClose, work }) {
  const dialogRef = useRef(null);
  const editionEn = work ? formatEdition(work.editionNumber, work.editionTotal, 'en') : null;
  const editionHe = work ? formatEdition(work.editionNumber, work.editionTotal, 'he') : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (work && !dialog.open) dialog.showModal();
    if (!work && dialog.open) dialog.close();
  }, [work]);

  return (
    <dialog
      aria-labelledby="dialogTitleEn dialogTitleHe"
      className="details-dialog"
      id="detailsDialog"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      onClose={onClose}
      ref={dialogRef}
    >
      <button aria-label="Close" className="dialog-close" onClick={onClose} type="button">×</button>
      {work && (
        <div className="dialog-content">
          <div className="dialog-kicker">
            <LanguageText en="Artwork Details" he="פרטי היצירה" />
          </div>
          <h2>
            <span data-lang="he" dir="rtl" id="dialogTitleHe" lang="he">{work.titleHe}</span>
            <span data-lang="en" dir="ltr" id="dialogTitleEn" lang="en">{work.titleEn}</span>
          </h2>
          <div className="dialog-status">
            <LanguageText
              en={work.available
                ? 'Original Artwork • Available'
                : 'Work from the Series • Not offered in this exhibition'}
              he={work.available
                ? 'יצירה מקורית • זמינה'
                : 'יצירה מתוך הסדרה • אינה מוצעת למכירה בתערוכה זו'}
            />
          </div>
          {editionEn && editionHe && (
            <div className="dialog-edition">
              <div className="dialog-edition-label">
                <LanguageText en={editionEn.label} he={editionHe.label} />
              </div>
              <div className="dialog-edition-value">
                <bdi dir="ltr">{editionEn.fraction}</bdi>
                <span data-lang="he" dir="rtl" lang="he">
                  {editionHe.isUnique && ` (${editionHe.uniqueLabel})`}
                </span>
                <span data-lang="en" dir="ltr" lang="en">
                  {editionEn.isUnique && ` (${editionEn.uniqueLabel})`}
                </span>
              </div>
            </div>
          )}
          {(work.descriptionEn || work.descriptionHe) && (
            <p className="dialog-description">
              <LanguageText en={work.descriptionEn} he={work.descriptionHe} />
            </p>
          )}
          <p>
            <span data-lang="he">Fine Art Canvas בגודל 40×60 ס״מ, מתוח על מסגרת עץ ומוכן לתלייה.</span>
            <span data-lang="en">Fine Art Canvas, 40×60 cm, stretched on a wooden frame and ready to hang.</span>
          </p>
          <p>
            <span data-lang="he">העבודה תימסר חתומה על ידי האמן.</span>
            <span data-lang="en">The work will be delivered signed by the artist.</span>
          </p>
          {work.available && <div className="dialog-price">{work.price}</div>}
          <a className="whatsapp" href={whatsappUrl(work)} rel="noopener" target="_blank">
            <LanguageText en="Contact on WhatsApp" he="יצירת קשר ב-WhatsApp" />
          </a>
        </div>
      )}
    </dialog>
  );
}
