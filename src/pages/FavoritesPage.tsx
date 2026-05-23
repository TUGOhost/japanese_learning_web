import { Heart } from "lucide-react";
import { useMemo } from "react";

import { VocabularyCard } from "../components/VocabularyCard";
import { n3Vocabulary } from "../data/n3Vocabulary";
import { getProgressEntry } from "../lib/progressStorage";
import type {
  VocabularyProgressEntry,
  VocabularyProgressMap
} from "../types/vocabulary";

type FavoritesPageProps = {
  progress: VocabularyProgressMap;
  getProgress: (id: string) => VocabularyProgressEntry;
  onToggleFavorite: (id: string) => void;
  onToggleMastered: (id: string) => void;
};

export const FavoritesPage = ({
  progress,
  getProgress,
  onToggleFavorite,
  onToggleMastered
}: FavoritesPageProps) => {
  const favorites = useMemo(
    () =>
      n3Vocabulary.filter(
        (item) => getProgressEntry(progress, item.id).favorite
      ),
    [progress]
  );

  return (
    <div className="space-y-5">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-rose-600">Favorites</p>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
          我的收藏
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          已收藏 {favorites.length} 个词汇
        </p>
      </header>

      {favorites.length > 0 ? (
        <div className="space-y-3">
          {favorites.map((item) => (
            <VocabularyCard
              key={item.id}
              item={item}
              progress={getProgress(item.id)}
              onToggleFavorite={onToggleFavorite}
              onToggleMastered={onToggleMastered}
              initiallyExpanded
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-rose-100 bg-white px-5 py-12 text-center shadow-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
            <Heart className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-5 text-base font-semibold text-slate-800">
            还没有收藏词汇
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            在学习页点亮收藏按钮后，词汇会出现在这里。
          </p>
        </div>
      )}
    </div>
  );
};
