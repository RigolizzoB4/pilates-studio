'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './LiviaSplash.module.css';

const MIN_MS = 6000;
const FADE_MS = 1000;
const AUTO_DISMISS_MS = 7200;

/**
 * Splash oficial Lívia Farah Pilates Estúdio.
 *
 * Uso em app/layout.tsx:
 *
 * import LiviaSplash from '@/components/LiviaSplash';
 *
 * <body>
 *   <LiviaSplash />
 *   {children}
 * </body>
 *
 * A tela fecha após o tempo mínimo, por toque ou quando o app disparar:
 * window.dispatchEvent(new Event('app-ready'));
 */
export default function LiviaSplash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const startedAt = useRef(0);
  const dismissing = useRef(false);

  useEffect(() => {
    startedAt.current = performance.now();

    const dismiss = () => {
      if (dismissing.current) return;
      dismissing.current = true;
      setLeaving(true);

      window.setTimeout(() => {
        setVisible(false);
        window.dispatchEvent(new Event('splash:done'));
      }, FADE_MS);
    };

    const requestDismiss = () => {
      const elapsed = performance.now() - startedAt.current;
      const wait = Math.max(0, MIN_MS - elapsed);
      window.setTimeout(dismiss, wait);
    };

    const autoTimer = window.setTimeout(requestDismiss, AUTO_DISMISS_MS);

    window.addEventListener('app-ready', requestDismiss);
    window.addEventListener('keydown', requestDismiss);

    return () => {
      window.clearTimeout(autoTimer);
      window.removeEventListener('app-ready', requestDismiss);
      window.removeEventListener('keydown', requestDismiss);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`${styles.stage} ${leaving ? styles.leaving : ''}`}
      role="presentation"
      aria-label="Carregando Lívia Farah Pilates Estúdio"
      onPointerDown={() => window.dispatchEvent(new Event('app-ready'))}
    >
      <div className={styles.card}>
        <picture>
          <source
            srcSet="/splash/livia-splash-mobile.webp"
            media="(max-width: 640px)"
            type="image/webp"
          />
          <source
            srcSet="/splash/livia-splash-tablet.webp"
            type="image/webp"
          />
          <img
            className={styles.figure}
            src="/splash/livia-splash-tablet.jpg"
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </picture>

        <div className={styles.composition}>
          <img
            className={styles.logo}
            src="/logo-verde.png"
            alt="Lívia Farah Pilates Estúdio"
            draggable={false}
          />

          <div className={styles.loader} aria-hidden="true">
            <div className={styles.dots}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.word}>Carregando</div>
          </div>
        </div>
      </div>
    </div>
  );
}
