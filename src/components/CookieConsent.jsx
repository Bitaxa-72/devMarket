import { Cookie } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const storageKey = 'devmarket-cookie-consent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(() => !window.localStorage.getItem(storageKey));

  const saveChoice = (choice) => {
    window.localStorage.setItem(storageKey, choice);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside className="cookie-consent" role="region" aria-label="Настройки файлов cookie">
      <span className="cookie-consent__icon"><Cookie size={23} /></span>
      <div className="cookie-consent__content">
        <strong>Файлы cookie</strong>
        <p>Используем обязательные cookie для работы сайта и, с вашего согласия, дополнительные — для улучшения сервиса. Подробнее в <Link to="/privacy">политике конфиденциальности</Link>.</p>
      </div>
      <div className="cookie-consent__actions">
        <button className="cookie-consent__button cookie-consent__button--secondary" type="button" onClick={() => saveChoice('necessary')}>Только необходимые</button>
        <button className="cookie-consent__button cookie-consent__button--primary" type="button" onClick={() => saveChoice('all')}>Принять все</button>
      </div>
    </aside>
  );
}
