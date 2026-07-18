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
import { loadGalleryContent } from './data/contentService.js';

export default function App() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let active = true;
    loadGalleryContent().then((loaded) => {
      if (active) setContent(loaded);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!content) return undefined;

    document.body.className = 'locked en';
    document.documentElement.dataset.contentSource = content.source;
    const script = document.createElement('script');
    script.src = '/legacy.js';
    script.async = false;
    script.dataset.benOzLegacy = 'true';
    script.onload = () => {
      document.getElementById('reactMigrationRoot')?.setAttribute('data-react-migration', 'ready');
      window.setTimeout(() => document.getElementById('museumLoader')?.classList.add('is-hidden'), 1200);
    };
    script.onerror = () => {
      document.getElementById('reactMigrationRoot')?.setAttribute('data-react-migration', 'script-error');
      document.getElementById('museumLoader')?.classList.add('is-hidden');
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
      document.body.className = '';
      delete document.documentElement.dataset.contentSource;
    };
  }, [content]);

  if (!content) {
    return <div id="reactMigrationRoot" data-react-migration="loading"><EntryScreen /></div>;
  }

  return (
    <div id="reactMigrationRoot" data-react-migration="loading">
      <EntryScreen />
      <ProjectHub collections={content.collections} />
      <div className="site" id="site">
        <SiteHeader />
        <HeroSection />
        <ArtworkGallery works={content.works} songs={content.songs} />
        <MusicSection songs={content.songs} />
        <StorySection />
        <ExhibitionsSection />
        <ContactSection />
        <SiteFooter />
      </div>
      <Overlays />
    </div>
  );
}
