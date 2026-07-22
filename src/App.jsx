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
} from './data/collectionPages.js';
import {
  PAGE_CONTACT,
  PAGE_EXHIBITIONS,
  PAGE_MUSIC,
  PAGE_STORY,
  resolveSiteRoute,
  SITE_PATHS,
  sitePageUrl,
  VIEW_COLLECTION,
  VIEW_COLLECTIONS,
  VIEW_ENTRY,
  VIEW_PAGE,
} from './data/siteRoutes.js';

export default function App() {
  const [content, setContent] = useState(null);
  const [view, setView] = useState(VIEW_ENTRY);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [activePage, setActivePage] = useState('');

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
      const route = resolveSiteRoute(content.collections, window.location);
      applyRoute(route);
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

  if (!content) {
    return <div id="reactMigrationRoot" data-react-migration="loading" aria-busy="true"><EntryScreen loading /></div>;
  }

  const siteActive = view === VIEW_COLLECTION || view === VIEW_PAGE;
  const showSharedSection = (page) => view === VIEW_COLLECTION || activePage === page;

  return (
    <div id="reactMigrationRoot" data-react-migration="loading">
      <EntryScreen active={view === VIEW_ENTRY} onEnter={enterGallery} />
      <ProjectHub
        active={view === VIEW_COLLECTIONS}
        collections={content.collections}
        onNavigate={navigateTo}
        onSelect={openCollection}
      />
      <main className={`site${siteActive ? ' active' : ''}`} hidden={!siteActive} id="site">
        <SiteHeader onNavigate={navigateTo} />
        {content.collections.map((collection) => (
          <CollectionPage
            active={view === VIEW_COLLECTION && collection.id === selectedCollectionId}
            collection={collection}
            key={collection.id}
            songs={content.songs}
          />
        ))}
        <div hidden={!showSharedSection(PAGE_MUSIC)}><MusicSection songs={content.songs} /></div>
        <div hidden={!showSharedSection(PAGE_STORY)}><StorySection /></div>
        <div hidden={!showSharedSection(PAGE_EXHIBITIONS)}><ExhibitionsSection /></div>
        <div hidden={!showSharedSection(PAGE_CONTACT)}><ContactSection /></div>
        <SiteFooter />
      </main>
      <Overlays />
    </div>
  );
}
