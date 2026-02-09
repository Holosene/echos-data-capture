import React, { useReducer } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContext, appReducer, INITIAL_STATE } from './store/app-state.js';
import { HomePage } from './pages/HomePage.js';
import { WizardPage } from './pages/WizardPage.js';
import { ManifestoPage } from './pages/ManifestoPage.js';
import { DocsPage } from './pages/DocsPage.js';

export function App() {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<WizardPage />} />
        <Route path="/manifesto" element={<ManifestoPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppContext.Provider>
  );
}
