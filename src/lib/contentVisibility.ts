import type {
  ImportStatus,
  PublishStatus,
  SourceReference
} from "../types/learning";

export type ContentMode = "private" | "public";

export type VisibilityControlledContent = {
  source?: SourceReference;
  contentSource?: SourceReference;
  publishStatus?: PublishStatus;
  importStatus?: ImportStatus;
};

const readEnvValue = (key: string): string | undefined =>
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.[
    key
  ] ??
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.[key];

export const getContentMode = (): ContentMode =>
  readEnvValue("VITE_CONTENT_MODE") === "public"
    ? "public"
    : "private";

const isOriginalSource = (source?: SourceReference): boolean =>
  source === "原创";

export const isContentVisible = (
  item: VisibilityControlledContent,
  mode: ContentMode = getContentMode()
): boolean => {
  if (item.importStatus === "needs_review" || item.importStatus === "skipped") {
    return false;
  }

  if (item.publishStatus === "do_not_publish") {
    return false;
  }

  if (isOriginalSource(item.source) || isOriginalSource(item.contentSource)) {
    return true;
  }

  if (mode === "public") {
    return item.publishStatus === "safe_to_publish";
  }

  return (
    item.publishStatus === undefined ||
    item.publishStatus === "private_only" ||
    item.publishStatus === "safe_to_publish"
  );
};

export const filterVisibleContent = <T extends VisibilityControlledContent>(
  items: T[],
  mode: ContentMode = getContentMode()
): T[] => items.filter((item) => isContentVisible(item, mode));

export const hasPrivateImportedContent = (
  items: VisibilityControlledContent[]
): boolean =>
  items.some(
    (item) =>
      item.publishStatus === "private_only" &&
      item.importStatus !== "needs_review" &&
      item.importStatus !== "skipped"
  );
