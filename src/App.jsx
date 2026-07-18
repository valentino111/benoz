import { useEffect, useState } from 'react';
import EntryScreen from './components/EntryScreen.jsx';
import ProjectHub from './components/ProjectHub.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import HeroSection from './components/HeroSection.jsx';
import ArtworkGallery from './components/ArtworkGallery.jsx';
import MusicSection from './components/MusicSection.jsx';
import StorySection from './components/StorySection.jsx';
import ExhibitionsSection from './components/ExhibitionsSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import Overlays from './components/Overlays.jsx';
import { fallbackContent, loadGalleryContent } from './data/contentService.js';

export default function App() {
  const [content, setContent] = useState(null);

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

    const previousBodyClass = document.body.className;
    document.body.className = 'locked en';
    document.documentElement.dataset.contentSource = content.source;
    const script = document.createElement('script');
    script.src = '/legacy.js';
    script.async = false;
    script.dataset.benOzLegacy = 'true';
    let loaderTimer;
    let fallbackEnterHandler;
    const enableRuntimeFallback = (error) => {
      if (import.meta.env.DEV) console.error('[Ben Oz Gallery] Interaction runtime could not start.', error);
      document.getElementById('reactMigrationRoot')?.setAttribute('data-react-migration', 'script-error');
      document.getElementById('museumLoader')?.classList.add('is-hidden');
      const enterButton = document.getElementById('enterBtn');
      fallbackEnterHandler = () => {
        document.getElementById('entry')?.style.setProperty('display', 'none');
        document.getElementById('projectHub')?.classList.add('active');
        document.body.classList.remove('locked');
      };
      enterButton?.addEventListener('click', fallbackEnterHandler, { once: true });
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
      document.getElementById('enterBtn')?.removeEventListener('click', fallbackEnterHandler);
      script.remove();
      document.body.className = previousBodyClass;
      delete document.documentElement.dataset.contentSource;
    };
  }, [content]);

  if (!content) {
    return <div id="reactMigrationRoot" data-react-migration="loading" aria-busy="true"><EntryScreen loading /></div>;
  }

  return (
    <div id="reactMigrationRoot" data-react-migration="loading">
      <EntryScreen />
      <ProjectHub collections={content.collections} />
      <main className="site" id="site">
        <SiteHeader />
        <HeroSection />
        <ArtworkGallery works={content.works} songs={content.songs} />
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
