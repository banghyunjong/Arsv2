import { useState, useEffect } from 'react';
import { UploadPage } from './pages/upload-page';
import { DashboardPage } from './pages/dashboard-page';
import { DashboardSplitPage } from './pages/dashboard-split-page';

type Page = 'upload' | 'dashboard' | 'dashboard-split';

function getInitialPage(): Page {
  const hash = window.location.hash;
  if (hash === '#split') return 'dashboard-split';
  if (hash === '#upload') return 'upload';
  return 'dashboard';
}

export function App() {
  const [page, setPage] = useState<Page>(getInitialPage);

  useEffect(() => {
    const onHashChange = () => setPage(getInitialPage());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (p: Page) => {
    const hash = p === 'dashboard-split' ? '#split' : p === 'upload' ? '#upload' : '#';
    window.location.hash = hash;
    setPage(p);
  };

  return (
    <>
      <header className="header">
        <div className="header-logo">패션 자동 <span className="header-logo-accent">리오더</span> 시스템</div>
        <nav className="header-nav">
          <a href="#upload" className={page === 'upload' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('upload'); }}>업로드</a>
          <a href="#" className={page === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}>대시보드</a>
          <a href="#split" className={page === 'dashboard-split' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('dashboard-split'); }}>대시보드(분할)</a>
        </nav>
      </header>

      {page === 'upload' && <UploadPage />}
      {page === 'dashboard' && <DashboardPage />}
      {page === 'dashboard-split' && <DashboardSplitPage />}
    </>
  );
}
