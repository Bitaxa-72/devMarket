import { useEffect, useRef } from 'react';

const SCRIPT_ID = 'cloudflare-turnstile-script';
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || (import.meta.env.DEV ? '1x00000000000000000000AA' : '');

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    const script = existing || document.createElement('script');
    const ready = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile unavailable'));
    script.addEventListener('load', ready, { once: true });
    script.addEventListener('error', reject, { once: true });
    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
  });
}

export function TurnstileField({ action, onVerify, resetKey, website, onWebsiteChange }) {
  const container = useRef(null);

  useEffect(() => {
    let disposed = false;
    let widgetId;
    onVerify('');

    if (!SITE_KEY) return undefined;
    loadTurnstile()
      .then((turnstile) => {
        if (disposed || !container.current) return;
        widgetId = turnstile.render(container.current, {
          sitekey: SITE_KEY,
          action,
          appearance: 'interaction-only',
          size: 'flexible',
          callback: onVerify,
          'expired-callback': () => onVerify(''),
          'error-callback': () => onVerify(''),
        });
      })
      .catch(() => onVerify(''));

    return () => {
      disposed = true;
      if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [action, onVerify, resetKey]);

  return (
    <div className="turnstile-field">
      <div className="turnstile-field__widget" ref={container} />
      {!SITE_KEY && <p className="turnstile-field__error">Проверка от роботов пока не настроена.</p>}
      <label className="turnstile-field__honeypot" aria-hidden="true">
        <span>Ваш сайт</span>
        <input autoComplete="off" name="website" onChange={onWebsiteChange} tabIndex={-1} value={website} />
      </label>
    </div>
  );
}
