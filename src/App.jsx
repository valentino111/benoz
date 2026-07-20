import { useEffect, useState } from 'react';
import EntryScreen from './components/EntryScreen.jsx';
import ProjectHub from './components/ProjectHub.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import CollectionPage from './components/CollectionPage.jsx';
import MusicSection from './components/MusicSection.jsx';
import StorySection from './components/StorySection.jsx';
import ExhibitionsSection from './components/ExhibitionsSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import Overlays from './components/Overlays.jsx';
import { fallbackContent, loadGalleryContent } from './data/contentService.js';
import {
  collectionPageUrl,
  collectionSelectionUrl,
  resolveCollectionFromSearch,
} from './data/collectionPages.js';

const VIEW_ENTRY = 'entry';
const VIEW_COLLECTIONS = 'collections';
const VIEW_COLLECTION = 'collection';

export default function App() {
  const [content, setContent] = useState(null);
  const [view, setView] = useState(VIEW_ENTRY);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');

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

    function applyLocation({ initial = false } = {}) {
      const collection = resolveCollectionFromSearch(content.collections, window.location.search);
      if (collection) {
        setSelectedCollectionId(collection.id);
        setView(VIEW_COLLECTION);
        if (initial && window.history.state?.benOzView !== VIEW_COLLECTION) {
          window.history.replaceState(
            { benOzView: VIEW_COLLECTION, collectionId: collection.id, direct: true },
            '',
            window.location.href,
          );
        }
        return;
      }

      setSelectedCollectionId('');
      if (!initial || window.history.state?.benOzView === VIEW_COLLECTIONS) {
        setView(VIEW_COLLECTIONS);
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

      const hashTarget = window.location.hash
        ? document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
        : null;
      if (hashTarget) hashTarget.scrollIntoView({ behavior: 'auto', block: 'start' });
      else window.scrollTo(0, 0);
      document.getElementById(`collection-title-${selectedCollectionId}`)?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedCollectionId, view]);

  useEffect(() => {
    if (!content) return undefined;

    const previousBodyClass = document.body.className;
    document.body.className = 'locked en';
    document.documentElement.dataset.contentSource = content.source;
    const script = document.createElement('script');
    script.src = '/legacy.js';
    script.async = false;
    script.dataset.benOzLegacy = 'true';
    let loaderTimer;
    const enableRuntimeFallback = (error) => {
      if (import.meta.env.DEV) console.error('[Ben Oz Gallery] Interaction runtime could not start.', error);
      document.getElementById('reactMigrationRoot')?.setAttribute('data-react-migration', 'script-error');
      document.getElementById('museumLoader')?.classList.add('is-hidden');
    };
    script.onload = () => {
      try {
        if (!window.BenOzLegacyRuntime?.init) throw new Error('Legacy runtime API is unavailable.');
        window.BenOzLegacyRuntime.init();
        document.getElementById('reactMigrationRoot')?.setAttribute('data-react-migration', 'ready');
        loaderTimer = window.setTimeout(() => document.getElementById('museumLoader')?.classList.add('is-hidden'), 1200);
      } catch (error) {
        enableRuntimeFallback(error);
      }
    };
    script.onerror = enableRuntimeFallback;
    document.body.appendChild(script);
    return () => {
      window.clearTimeout(loaderTimer);
      window.BenOzLegacyRuntime?.destroy();
      script.remove();
      document.body.className = previousBodyClass;
      delete document.documentElement.dataset.contentSource;
    };
  }, [content]);

  function enterGallery() {
    window.history.replaceState(
      { benOzView: VIEW_COLLECTIONS },
      '',
      collectionSelectionUrl(window.location),
    );
    setSelectedCollectionId('');
    setView(VIEW_COLLECTIONS);
  }

  function openCollection(collectionId, hash = '') {
    const collection = content.collections.find((item) => item.id === collectionId);
    if (!collection) return;

    window.history.pushState(
      { benOzView: VIEW_COLLECTION, collectionId, returnToCollections: view === VIEW_COLLECTIONS },
      '',
      collectionPageUrl(collection, window.location, hash),
    );
    setSelectedCollectionId(collectionId);
    setView(VIEW_COLLECTION);
  }

  function returnToCollections(event) {
    event?.preventDefault();
    if (window.history.state?.returnToCollections) {
      window.history.back();
      return;
    }

    window.history.replaceState(
      { benOzView: VIEW_COLLECTIONS },
      '',
      collectionSelectionUrl(window.location),
    );
    setSelectedCollectionId('');
    setView(VIEW_COLLECTIONS);
  }

  function openAbout() {
    const firstCollection = content.collections[0];
    if (firstCollection) openCollection(firstCollection.id, 'story');
  }

  if (!content) {
    return <div id="reactMigrationRoot" data-react-migration="loading" aria-busy="true"><EntryScreen loading /></div>;
  }

  const selectedCollection = content.collections.find((collection) => collection.id === selectedCollectionId);

  return (
    <div id="reactMigrationRoot" data-react-migration="loading">
      <EntryScreen active={view === VIEW_ENTRY} onEnter={enterGallery} />
      <ProjectHub
        active={view === VIEW_COLLECTIONS}
        collections={content.collections}
        onAbout={openAbout}
        onSelect={openCollection}
      />
      <main className={`site${view === VIEW_COLLECTION ? ' active' : ''}`} hidden={view !== VIEW_COLLECTION} id="site">
        <SiteHeader galleryTarget={selectedCollection?.pageId} onBack={returnToCollections} />
        {content.collections.map((collection) => (
          <CollectionPage
            active={collection.id === selectedCollectionId}
            collection={collection}
            key={collection.id}
            songs={content.songs}
          />
        ))}
        <MusicSection songs={content.songs} />
        <StorySection />
        <ExhibitionsSection />
        <ContactSection />
        <SiteFooter />
      </main>
      <Overlays />
    </div>
  );
}
