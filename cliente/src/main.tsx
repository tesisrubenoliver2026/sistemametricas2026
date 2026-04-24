import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import './globals.css';
import { useDarkModeStore } from '../store/useDarkModeStore'

// Función helper para sincronizar la clase dark
const syncDarkMode = (isDark: boolean) => {
  const html = document.documentElement;
  if (isDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};

function AppWrapper() {
  const darkMode = useDarkModeStore((s) => s.darkMode);

  // Sincronizar clase 'dark' con <html> cuando cambie darkMode
  useEffect(() => {
    syncDarkMode(darkMode);
  }, [darkMode]);

  // Suscribirse a cambios del store (captura hidratación desde localStorage)
  useEffect(() => {
    // Sincronizar estado inicial
    syncDarkMode(useDarkModeStore.getState().darkMode);

    // Suscribirse a cambios futuros
    const unsub = useDarkModeStore.subscribe((state) => {
      syncDarkMode(state.darkMode);
    });

    return () => unsub();
  }, []);

  return <App />;
}

function App() {
  return useRoutes(routes);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AppWrapper />
    </HashRouter>
  </React.StrictMode>,
);
