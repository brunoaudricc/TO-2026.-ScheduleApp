'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">G</div>
          <div className="logo-text">
            <h1>Grade Horaria</h1>
            <p>Gerenciador de Restricoes</p>
          </div>
        </div>
        <nav className="nav-links">
          <Link 
            href="/" 
            className={`nav-item ${pathname === '/' ? 'active' : ''}`}
          >
            Montagem da Grade
          </Link>
          <Link 
            href="/graph" 
            className={`nav-item ${pathname === '/graph' ? 'active' : ''}`}
          >
            Visualizacao em Grafo
          </Link>
        </nav>
      </div>
    </header>
  );
}
