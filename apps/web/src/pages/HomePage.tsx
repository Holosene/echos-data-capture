import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, GlassPanel, colors } from '@echos/ui';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: `radial-gradient(ellipse at 50% 30%, rgba(66, 33, 206, 0.12) 0%, transparent 70%), ${colors.black}`,
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '560px' }}>
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 700,
            letterSpacing: '-2px',
            marginBottom: '8px',
            background: `linear-gradient(135deg, ${colors.white} 0%, ${colors.primary} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ECHOS
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: colors.whiteDim,
            lineHeight: '1.6',
            marginBottom: '48px',
          }}
        >
          Archive perceptive des fonds aquatiques.
          <br />
          <span style={{ fontSize: '15px', color: colors.whiteMuted }}>
            Transformez vos captures d'ecran sonar et traces GPS en volumes 3D explorables.
          </span>
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" onClick={() => navigate('/scan')}>
            Start New Scan
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/manifesto')}>
            Manifesto
          </Button>
        </div>

        <GlassPanel
          style={{ marginTop: '48px', textAlign: 'left' }}
          padding="20px"
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: colors.primary,
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            How it works
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { step: '1', text: 'Record your sonar screen (MP4) and GPS track (GPX) simultaneously' },
              { step: '2', text: 'Import both files, crop the sonar region, set depth' },
              { step: '3', text: 'Generate a 3D volume and explore it in your browser' },
            ].map(({ step, text }) => (
              <div key={step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span
                  style={{
                    minWidth: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(66, 33, 206, 0.2)',
                    color: colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {step}
                </span>
                <span style={{ fontSize: '14px', color: colors.whiteDim, lineHeight: '1.5', paddingTop: '4px' }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>

        <div style={{ marginTop: '32px' }}>
          <button
            onClick={() => navigate('/docs')}
            style={{
              background: 'none',
              border: 'none',
              color: colors.whiteMuted,
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
