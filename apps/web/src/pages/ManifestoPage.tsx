import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassPanel, Button, colors } from '@echos/ui';

export function ManifestoPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse at 50% 0%, rgba(66, 33, 206, 0.08) 0%, transparent 60%), ${colors.black}`,
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: colors.whiteMuted,
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Back to ECHOS
        </button>

        <h1
          style={{
            fontSize: '42px',
            fontWeight: 700,
            letterSpacing: '-1.5px',
            marginBottom: '12px',
            background: `linear-gradient(135deg, ${colors.white} 0%, ${colors.primary} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Manifesto
        </h1>
        <p style={{ fontSize: '18px', color: colors.primary, marginBottom: '48px', fontWeight: 500 }}>
          On the captured echo and the perceptive archive
        </p>

        <div style={{ display: 'grid', gap: '32px' }}>
          <GlassPanel>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
              The confined measurement
            </h2>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '15px' }}>
              Consumer sonar devices — fishfinders, depth sounders — produce a real acoustic
              measurement. Sound travels through water, bounces off the bottom, off vegetation,
              off suspended matter. The device captures this echo and turns it into an image.
            </p>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '15px', marginTop: '12px' }}>
              But this measurement is confined. The raw data — the acoustic samples, the return
              signal envelopes — are locked inside proprietary systems. You cannot export them.
              You cannot redistribute them. The screen becomes the only sanctioned output: a
              rendering, an interpretation, an image that the manufacturer decided to show you.
            </p>
          </GlassPanel>

          <GlassPanel>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
              The screen as primary source
            </h2>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '15px' }}>
              When the raw data is unreachable, the screen image becomes the primary source.
              Not a perfect source — it carries the biases of rendering algorithms, color maps,
              gain settings, screen resolution. But it is a faithful trace of what the instrument
              "decided to show." It is a perceptive record.
            </p>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '15px', marginTop: '12px' }}>
              ECHOS takes this position seriously: the screen recording is not a degraded copy
              of something better. It is the most accessible, most shareable, most reproducible
              form of the sonar observation. It is the echo we can actually work with.
            </p>
          </GlassPanel>

          <GlassPanel>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
              The perceptive archive
            </h2>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '15px' }}>
              By combining a screen capture (MP4) with a simultaneous GPS trace (GPX), ECHOS
              builds a spatial volume — a three-dimensional reconstruction of what the sonar
              showed, placed in geographic context. This is not a bathymetric survey. It does
              not claim metric truth. It claims perceptive coherence.
            </p>
            <p style={{ color: colors.whiteDim, lineHeight: '1.8', fontSize: '15px', marginTop: '12px' }}>
              The result is a volume you can slice, rotate, explore. A readable archive of an
              underwater observation session. Something you can share, compare, revisit. An
              "echo of echoes" — captured, structured, opened.
            </p>
          </GlassPanel>

          <GlassPanel>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
              What ECHOS is not
            </h2>
            <ul
              style={{
                color: colors.whiteDim,
                lineHeight: '1.8',
                fontSize: '15px',
                listStyle: 'none',
                padding: 0,
                display: 'grid',
                gap: '8px',
              }}
            >
              {[
                'Not a bathymetric tool — it does not produce metrically calibrated depth maps.',
                'Not a scientific instrument — the source data is a screen image, not raw acoustic samples.',
                'Not a replacement for professional survey software.',
                'Not dependent on any sonar brand or protocol.',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: colors.primary, flexShrink: 0 }}>—</span>
                  {item}
                </li>
              ))}
            </ul>
          </GlassPanel>

          <GlassPanel>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
              What ECHOS is
            </h2>
            <ul
              style={{
                color: colors.whiteDim,
                lineHeight: '1.8',
                fontSize: '15px',
                listStyle: 'none',
                padding: 0,
                display: 'grid',
                gap: '8px',
              }}
            >
              {[
                'A tool for building readable, shareable, explorable volumes from consumer sonar screens.',
                'An assertion that the screen capture is a valid primary source.',
                'An accessible bridge between consumer devices and scientific visualization.',
                'An open archive format for underwater perceptive data.',
                'A starting point — not an endpoint.',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: colors.primary, flexShrink: 0 }}>+</span>
                  {item}
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Button variant="primary" onClick={() => navigate('/scan')}>
            Start Using ECHOS
          </Button>
        </div>
      </div>
    </div>
  );
}
