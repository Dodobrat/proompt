type DBFeedback = {
  onSuccess?: ({ data }: { data: any }) => void;
  onError?: () => void;
};

function get({ key, onSuccess, onError }: { key: string } & DBFeedback) {
  try {
    const data = localStorage.getItem(key);
    onSuccess?.({ data });
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error("Error getting data from localStorage");
    onError?.();
  }
}

function set({
  key,
  data,
  onError,
  onSuccess,
}: {
  key: string;
  data: any;
} & DBFeedback) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    onSuccess?.({ data });
  } catch (e) {
    console.error("Error setting data to localStorage");
    onError?.();
  }
}

function remove({ key, onError, onSuccess }: { key: string } & DBFeedback) {
  try {
    localStorage.removeItem(key);
    onSuccess?.({ data: key });
  } catch (e) {
    console.error("Error removing data from localStorage");
    onError?.();
  }
}

function create({
  key,
  data,
  onSuccess,
  onError,
}: { key: string; data: any } & DBFeedback) {
  const storedData = get({ key });

  if (!storedData) {
    return set({ key, data: [data], onSuccess, onError });
  }

  const latestData = [data, ...storedData];
  set({ key, data: latestData, onSuccess, onError });
}

function safeCreate({
  key,
  data,
  validator,
  onSuccess,
  onError,
}: {
  key: string;
  data: any;
  validator?: (data: any[]) => boolean;
} & DBFeedback) {
  const storedData = get({ key });
  if (!storedData) {
    return set({ key, data: [data], onSuccess, onError });
  }

  if (validator?.(storedData)) {
    return onError?.();
  }

  create({ key, data, onSuccess, onError });
}

function deleteEntry({
  key,
  locatorFn,
  onError,
  onSuccess,
}: {
  key: string;
  locatorFn: (item: any, index: number) => boolean;
} & DBFeedback) {
  const storedData = get({ key });

  if (!storedData) {
    return onError?.();
  }

  set({ key, data: storedData.filter(locatorFn), onSuccess, onError });
}

function update({
  key,
  locatorFn,
  data,
  onError,
  onSuccess,
}: {
  key: string;
  locatorFn: (item: any, index: number) => boolean;
  data: any;
} & DBFeedback) {
  const storedData = get({ key });

  if (!storedData) {
    return onError?.();
  }

  set({
    key,
    data: (storedData as any[]).map((item, index) => {
      if (locatorFn(item, index)) {
        return { ...item, ...data };
      }
      return item;
    }),
    onSuccess,
    onError,
  });
}

const DB_KEYS = {
  PROJECTS: "@proompt/projects",
  PROJECT_KEY: (id: string) => `@proompt/project-${id}`,
  THEME: "@proompt/theme",
};

export const DB = {
  get,
  set,
  create,
  safeCreate,
  update,
  remove,
  deleteEntry,
  KEYS: DB_KEYS,
};
