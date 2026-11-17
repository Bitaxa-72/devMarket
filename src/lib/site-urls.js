const accountHost = import.meta.env.VITE_ACCOUNT_HOST || 'lk.testvitalydomen.ru';
const publicSiteUrl = (import.meta.env.VITE_PUBLIC_SITE_URL || 'https://testvitalydomen.ru').replace(/\/$/, '');

export function isAccountHost(hostname) {
  return hostname === accountHost;
}

export function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function isAccountPath(pathname) {
  return /^\/(account(?:\/|$)|login$|register$|forgot-password$|reset-password$|verify-email$)/.test(pathname);
}

export function getAccountUrl(path = '/login') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (isLocalHost(window.location.hostname)) {
    return `${window.location.origin}${normalizedPath}`;
  }

  return `https://${accountHost}${normalizedPath}`;
}

export function getPublicSiteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${publicSiteUrl}${normalizedPath}`;
}
