import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/SiteLayout';
import { AccountPage, LoginPage } from './pages/AccountPages';
import { CatalogPage, ProductPage, ServicesPage } from './pages/CatalogPages';
import { CartPage, CheckoutPage, CheckoutSuccessPage, PaymentPage } from './pages/CommercePages';
import { ArticlePage, NewsPage, ProjectPage, ProjectsPage, PromotionsPage } from './pages/ContentPages';
import { HomePage } from './pages/HomePage';
import { ContactsPage, NotFoundPage, OfferPage, PrivacyPage, SearchPage } from './pages/InfoPages';

export function App() {
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
        <Route path="account" element={<AccountPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="offer" element={<OfferPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
