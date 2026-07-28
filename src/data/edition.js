const EDITION_TRANSLATIONS = {
  en: {
    label: 'Edition',
    unique: 'Unique Gallery Edition',
  },
  he: {
    label: 'מהדורה',
    unique: 'מהדורה יחידה',
  },
};

export function getEditionTranslations(language = 'en') {
  return EDITION_TRANSLATIONS[language] ?? EDITION_TRANSLATIONS.en;
}

function positiveInteger(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const number = Number(String(value).trim());
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export function normalizeEdition(editionNumber, editionTotal) {
  const number = positiveInteger(editionNumber);
  const total = positiveInteger(editionTotal);
  if (number === null || total === null || number > total) return null;
  return { editionNumber: number, editionTotal: total };
}

export function formatEdition(editionNumber, editionTotal, language = 'en') {
  const edition = normalizeEdition(editionNumber, editionTotal);
  if (!edition) return null;

  const translations = getEditionTranslations(language);
  const fraction = `${edition.editionNumber}/${edition.editionTotal}`;
  const isUnique = edition.editionNumber === 1 && edition.editionTotal === 1;
  const value = `${fraction}${isUnique ? ` (${translations.unique})` : ''}`;

  return {
    ...edition,
    fraction,
    isUnique,
    label: translations.label,
    uniqueLabel: translations.unique,
    value,
    text: `${translations.label}: ${value}`,
  };
}
