export type PublishedContent = {
  id: string;
  type: "blog" | "law";
  title: string;
  content: string;
  date: string;
  images: string[];
};

export type ContentDraft = Omit<PublishedContent, "id">;

const storageKey = "bayt-al-tarafaa-published-content";
const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function readLocalContent(): PublishedContent[] {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || "[]") as PublishedContent[];
  } catch {
    return [];
  }
}

function writeLocalContent(items: PublishedContent[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(items));
}

function normalizeList(payload: unknown): PublishedContent[] {
  if (Array.isArray(payload)) return payload as PublishedContent[];
  if (payload && typeof payload === "object" && "items" in payload && Array.isArray(payload.items)) {
    return payload.items as PublishedContent[];
  }
  return [];
}

export async function listPublishedContent(type?: PublishedContent["type"]) {
  if (apiBase) {
    try {
      const query = type ? `?type=${type}` : "";
      const response = await fetch(`${apiBase}/content${query}`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load content");
      return normalizeList(await response.json());
    } catch {
      // Keep the prepared frontend usable while the backend is unavailable.
    }
  }
  const items = readLocalContent();
  return type ? items.filter((item) => item.type === type) : items;
}

export async function getPublishedContent(id: string) {
  if (apiBase) {
    try {
      const response = await fetch(`${apiBase}/content/${encodeURIComponent(id)}`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load content");
      return await response.json() as PublishedContent;
    } catch {
      // Fall back to the browser preview data until the API is reachable.
    }
  }
  return readLocalContent().find((item) => item.id === id) || null;
}

export async function createPublishedContent(draft: ContentDraft) {
  if (apiBase) {
    const formData = new FormData();
    formData.append("type", draft.type);
    formData.append("title", draft.title);
    formData.append("content", draft.content);
    formData.append("date", draft.date);
    for (const [index, image] of draft.images.entries()) {
      const blob = await fetch(image).then((response) => response.blob());
      formData.append("images", blob, `content-image-${index + 1}.jpg`);
    }
    const response = await fetch(`${apiBase}/content`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!response.ok) throw new Error("Unable to publish content");
    return await response.json() as PublishedContent;
  }
  const item: PublishedContent = { ...draft, id: `${Date.now()}` };
  writeLocalContent([item, ...readLocalContent()]);
  return item;
}

export async function updatePublishedContent(id: string, draft: ContentDraft) {
  if (apiBase) {
    const formData = new FormData();
    formData.append("type", draft.type); formData.append("title", draft.title);
    formData.append("content", draft.content); formData.append("date", draft.date);
    for (const [index, image] of draft.images.entries()) {
      const blob = await fetch(image).then((response) => response.blob());
      formData.append("images", blob, `content-image-${index + 1}.jpg`);
    }
    const response = await fetch(`${apiBase}/content/${encodeURIComponent(id)}`, { method: "PUT", body: formData, credentials: "include" });
    if (!response.ok) throw new Error("Unable to update content");
    return await response.json() as PublishedContent;
  }
  const items = readLocalContent();
  const updated: PublishedContent = { ...draft, id };
  writeLocalContent(items.map((item) => item.id === id ? updated : item));
  return updated;
}

export async function deletePublishedContent(id: string) {
  if (apiBase) {
    const response = await fetch(`${apiBase}/content/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Unable to delete content");
    return;
  }
  writeLocalContent(readLocalContent().filter((item) => item.id !== id));
}
