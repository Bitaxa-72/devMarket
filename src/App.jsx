import { Navigate, Route, Routes } from 'react-router-dom';
import { AccountLayout } from './components/AccountLayout';
import { SiteLayout } from './components/SiteLayout';
import { RequireAuth } from './components/RequireAuth';
import { AccountOrderPage, AccountPage, AccountPaymentPage } from './pages/AccountPages';
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from './pages/AuthPages';
import { CatalogPage, ProductPage, ServicesPage } from './pages/CatalogPages';
import { CartPage, CheckoutPage, CheckoutSuccessPage, PaymentPage } from './pages/CommercePages';
import { ArticlePage, NewsPage, ProjectPage, ProjectsPage, PromotionsPage } from './pages/ContentPages';
import { HomePage } from './pages/HomePage';
import { ContactsPage, NotFoundPage, OfferPage, PrivacyPage, SearchPage } from './pages/InfoPages';
import { getAccountUrl, getPublicSiteUrl, isAccountHost, isAccountPath, isLocalHost } from './lib/site-urls';

function ExternalAccountRedirect({ path }) {
  window.location.replace(getAccountUrl(path));
  return <main className="state-page">Открываем личный кабинет…</main>;
}

function ExternalPublicRedirect({ path }) {
  window.location.replace(getPublicSiteUrl(`${path}${window.location.search}`));
  return <main className="state-page">Открываем страницу входа…</main>;
}

function AccountRoutes() {
  return (
    <Routes>
      <Route element={<AccountLayout />}>
        <Route index element={<Navigate replace to="/account" />} />
        <Route path="account" element={<RequireAuth><AccountPage /></RequireAuth>} />
        <Route path="account/orders/:orderId" element={<RequireAuth><AccountOrderPage /></RequireAuth>} />
        <Route path="account/payment" element={<RequireAuth><AccountPaymentPage /></RequireAuth>} />
        <Route path="login" element={<ExternalPublicRedirect path="/login" />} />
        <Route path="register" element={<ExternalPublicRedirect path="/register" />} />
        <Route path="forgot-password" element={<ExternalPublicRedirect path="/forgot-password" />} />
        <Route path="reset-password" element={<ExternalPublicRedirect path="/reset-password" />} />
        <Route path="verify-email" element={<ExternalPublicRedirect path="/verify-email" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function PublicRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="catalog/:categoryId" element={<CatalogPage />} />
        <Route path="product/:productSlug" element={<ProductPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectSlug" element={<ProjectPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:articleSlug" element={<ArticlePage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="account/*" element={<ExternalAccountRedirect path="/account" />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="offer" element={<OfferPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  const accountHostname = isAccountHost(window.location.hostname);
  const localAccountRoute = isLocalHost(window.location.hostname) && isAccountPath(window.location.pathname);
  return accountHostname || localAccountRoute ? <AccountRoutes /> : <PublicRoutes />;
}
