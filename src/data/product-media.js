import { projectGalleryBySlug, projectImageList } from './project-media';
import { portfolioProjects } from './site-data';

const categoryProjectIndexes = {
  bots: [0, 2, 1],
  sites: [1, 4],
  custom: [4, 2, 3],
  crm: [2, 4],
  integrations: [2, 0, 1],
  apps: [3, 4],
};

const categoryGalleryIndexes = {
  bots: [0, 2, 1],
  sites: [1, 3, 0],
  custom: [2, 3, 1],
  crm: [2, 0, 3],
  integrations: [2, 1, 0],
  apps: [3, 2, 1],
};

export function getProductGallery(categoryId) {
  const indexes = categoryGalleryIndexes[categoryId] || [0, 1, 2];
  return indexes.map((index) => projectImageList[index % projectImageList.length]);
}

export function getRelatedProjects(categoryId) {
  const indexes = categoryProjectIndexes[categoryId] || [0, 1, 2];
  return indexes.map((index) => portfolioProjects[index]).filter(Boolean);
}

export function getProjectCover(projectSlug) {
  return projectGalleryBySlug[projectSlug]?.[0] || projectImageList[0];
}
