import { useCallback, useEffect, useState } from 'react';
import EntryScreen from './components/EntryScreen.jsx';
import ProjectHub from './components/ProjectHub.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import CollectionPage from './components/CollectionPage.jsx';
import StorySection from './components/StorySection.jsx';
import ExhibitionsSection from './components/ExhibitionsSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import Overlays from './components/Overlays.jsx';
import SeoHead from './components/SeoHead.jsx';
import { fallbackContent, loadGalleryContent } from './data/contentService.js';
import useAmbientSound from './hooks/useAmbientSound.js';
import useFadeReveal from './hooks/useFadeReveal.js';
import { languageFromLocation } from './seo/seo.js';
import {
  collectionPageUrl,
  collectionSelectionUrl,
} from './data/collectionPages.js';
import {
  PAGE_CONTACT,
  PAGE_EXHIBITIONS,
  PAGE_STORY,
  resolveSiteRoute,
  SITE_PATHS,
  sitePageUrl,
  VIEW_COLLECTION,
  VIEW_COLLECTIONS,
  VIEW_ENTRY,
  VIEW_PAGE,
} from './data/siteRoutes.js';

const INITIAL_SEO_CONTENT = fallbackContent();

export default function App() {
  const [content, setContent] = useState(null);
  const [view, setView] = useState(VIEW_ENTRY);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [activePage, setActivePage] = useState('');
  const [detailsWork, setDetailsWork] = useState(null);
  const [lightboxSelection, setLightboxSelection] = useState(null);
  const [language, setLanguage] = useState(() => languageFromLocation(window.location));
  const { ambientOn, scheduleAmbient, toggleAmbient } = useAmbientSound();
  useFadeReveal(Boolean(content));

  useEffect(() => {
    const english = language === 'en';
    document.body.classList.toggle('en', english);
    document.documentElement.lang = language;
    document.documentElement.dir = english ? 'ltr' : 'rtl';
  }, [language]);

  useEffect(() => {
    let active = true;
    loadGalleryContent()
      .then((loaded) => {
        if (active) setContent(loaded);
      })
      .catch((error) => {
        if (import.meta.env.DEV) console.error('[Ben Oz Gallery] Local content could not be loaded.', error);
        if (active) setContent(fallbackContent());
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!content) return undefined;

    function applyRoute(route) {
      setSelectedCollectionId(route.collectionId);
      setActivePage(route.page);
      setView(route.view);
    }

    function applyLocation({ initial = false } = {}) {
      const legacyMusicPath = window.location.pathname.replace(/\/+$/, '').toLowerCase() === '/music';
      if (legacyMusicPath) {
        window.history.replaceState(
          window.history.state,
          '',
          sitePageUrl(SITE_PATHS.gallery, window.location),
        );
      }
      const route = resolveSiteRoute(content.collections, window.location);
      applyRoute(route);
      setLanguage(languageFromLocation(window.location));
      if (initial) {
        window.history.replaceState(
          { benOzView: route.view, collectionId: route.collectionId, page: route.page, direct: true },
          '',
          window.location.href,
        );
      }
    }

    applyLocation({ initial: true });
    const handlePopState = () => applyLocation();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [content]);

  useEffect(() => {
    document.body.classList.toggle('locked', view === VIEW_ENTRY);
    if (view === VIEW_ENTRY) return undefined;
    const frame = window.requestAnimationFrame(() => {
      if (view === VIEW_COLLECTIONS) {
        window.scrollTo(0, 0);
        document.getElementById('projectHub')?.focus({ preventScroll: true });
        return;
      }

      const hashTarget = view === VIEW_COLLECTION && window.location.hash
        ? document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
        : null;
      if (hashTarget) hashTarget.scrollIntoView({ behavior: 'auto', block: 'start' });
      else window.scrollTo(0, 0);
      if (view === VIEW_COLLECTION) {
        document.getElementById(`collection-title-${selectedCollectionId}`)?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activePage, selectedCollectionId, view]);

  useEffect(() => {
    setDetailsWork(null);
    setLightboxSelection(null);
  }, [activePage, selectedCollectionId, view]);

  useEffect(() => {
    if (!content) return undefined;

    document.documentElement.dataset.contentSource = content.source;
    return () => {
      delete document.documentElement.dataset.contentSource;
    };
  }, [content]);

  function enterGallery(event) {
    event?.preventDefault();
    const url = collectionSelectionUrl(window.location, SITE_PATHS.gallery);
    window.history.replaceState(
      { benOzView: VIEW_COLLECTIONS },
      '',
      url,
    );
    setSelectedCollectionId('');
    setActivePage('');
    setView(VIEW_COLLECTIONS);
    scheduleAmbient();
  }

  function openCollection(collectionId, hash = '') {
    const collection = content.collections.find((item) => item.id === collectionId);
    if (!collection) return;

    window.history.pushState(
      { benOzView: VIEW_COLLECTION, collectionId, returnToCollections: view === VIEW_COLLECTIONS },
      '',
      collectionPageUrl(collection, window.location, hash, SITE_PATHS.gallery),
    );
    setSelectedCollectionId(collectionId);
    setActivePage('');
    setView(VIEW_COLLECTION);
  }

  function navigateTo(path, event, { replace = false } = {}) {
    if (event && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event?.preventDefault();
    const url = sitePageUrl(path, window.location);
    const route = resolveSiteRoute(content.collections, new URL(url, window.location.origin));
    window.history[replace ? 'replaceState' : 'pushState'](
      { benOzView: route.view, collectionId: route.collectionId, page: route.page },
      '',
      url,
    );
    setSelectedCollectionId(route.collectionId);
    setActivePage(route.page);
    setView(route.view);
  }

  function toggleLanguage() {
    const nextLanguage = language === 'en' ? 'he' : 'en';
    const url = new URL(window.location.href);
    if (nextLanguage === 'he') url.searchParams.set('lang', 'he');
    else url.searchParams.delete('lang');
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
    setLanguage(nextLanguage);
  }

  const closeDetails = useCallback(() => setDetailsWork(null), []);
  const closeLightbox = useCallback(() => setLightboxSelection(null), []);
  const selectLightbox = useCallback((index) => {
    setLightboxSelection((current) => (
      current ? { ...current, index } : current
    ));
  }, []);

  if (!content) {
    const initialRoute = resolveSiteRoute(INITIAL_SEO_CONTENT.collections, window.location);
    return (
      <div id="reactMigrationRoot" data-react-migration="loading" aria-busy="true">
        <SeoHead content={INITIAL_SEO_CONTENT} language={language} route={initialRoute} />
        <EntryScreen loading />
      </div>
    );
  }

  const siteActive = view === VIEW_COLLECTION || view === VIEW_PAGE;
  const showSharedSection = (page) => view === VIEW_COLLECTION || activePage === page;

  return (
    <div id="reactMigrationRoot" data-react-migration="ready">
      <SeoHead
        content={content}
        language={language}
        route={{ view, collectionId: selectedCollectionId, page: activePage }}
      />
      <EntryScreen active={view === VIEW_ENTRY} onEnter={enterGallery} />
      <ProjectHub
        active={view === VIEW_COLLECTIONS}
        collections={content.collections}
        onNavigate={navigateTo}
        onSelect={openCollection}
      />
      <main className={`site${siteActive ? ' active' : ''}`} hidden={!siteActive} id="site">
        <SiteHeader
          ambientOn={ambientOn}
          language={language}
          onNavigate={navigateTo}
          onToggleLanguage={toggleLanguage}
          onToggleSound={toggleAmbient}
        />
        {content.collections.map((collection) => (
          <CollectionPage
            active={view === VIEW_COLLECTION && collection.id === selectedCollectionId}
            collection={collection}
            key={collection.id}
            language={language}
            onOpenArtwork={(works, index, opener) => {
              setLightboxSelection({ index, opener, works });
            }}
            onViewDetails={setDetailsWork}
            songs={content.songs}
          />
        ))}
        <div hidden={!showSharedSection(PAGE_STORY)}>
          <StorySection standalone={view === VIEW_PAGE && activePage === PAGE_STORY} />
        </div>
        <div hidden={!showSharedSection(PAGE_EXHIBITIONS)}>
          <ExhibitionsSection standalone={view === VIEW_PAGE && activePage === PAGE_EXHIBITIONS} />
        </div>
        <div hidden={!showSharedSection(PAGE_CONTACT)}>
          <ContactSection standalone={view === VIEW_PAGE && activePage === PAGE_CONTACT} />
        </div>
        <SiteFooter />
      </main>
      <Overlays
        detailsWork={detailsWork}
        language={language}
        lightboxSelection={lightboxSelection}
        onCloseDetails={closeDetails}
        onCloseLightbox={closeLightbox}
        onSelectLightbox={selectLightbox}
      />
    </div>
  );
}
