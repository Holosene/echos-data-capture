import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, colors } from '@echos/ui';
import { useTranslation } from '../i18n/index.js';
import { DocsSection } from '../components/DocsSection.js';

export function DocsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ background: colors.black, padding: 'clamp(40px, 5vw, 80px) var(--layout-padding)' }}>
      <DocsSection />
      <div style={{ textAlign: 'center', maxWidth: 'var(--layout-max-width)', margin: '56px auto 0' }}>
        <Button variant="primary" size="lg" onClick={() => navigate('/scan')}>
          {t('docs.cta')}
        </Button>
      </div>
    </div>
  );
}
