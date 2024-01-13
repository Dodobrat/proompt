const DB_KEYS = {
  PROJECTS: "@proompt/projects",
  TEMPLATES: "@proompt/templates",
  PROJECT_KEY: (id: string) => `@proompt/project-${id}`,
  PROJECT_KEY_PROMPTS: (id: string) => `@proompt/project-${id}/prompts`,
  PROJECT_KEY_FILTERS: (id: string) => `@proompt/project-${id}/filters`,
  THEME: "@proompt/theme",
  FILTERS_SIDEBAR_WIDTH: "@proompt/filters-sidebar-width",
  PROJECTS_SIDEBAR_WIDTH: "@proompt/projects-sidebar-width",
  SESSION_API_KEY: "@proompt/session-api-key",
};

export const DB = {
  KEYS: DB_KEYS,
};
