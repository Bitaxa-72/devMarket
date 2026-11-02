import botOrWebServiceImage from '../assets/news/bot-or-web-service.jpg';
import businessIntegrationsImage from '../assets/news/business-integrations.jpg';
import mvpPrioritiesImage from '../assets/news/mvp-priorities.jpg';
import productSupportImage from '../assets/news/product-support.jpg';
import technicalSpecificationImage from '../assets/news/technical-specification.jpg';

export const newsImageList = [technicalSpecificationImage, botOrWebServiceImage, productSupportImage, businessIntegrationsImage, mvpPrioritiesImage];

export const newsImagesBySlug = Object.fromEntries(newsImageList.map((image, index) => [`article-${index + 1}`, image]));
