import { useMemo, useState } from "react";

import { FilterTabs, type FilterOption } from "../components/FilterTabs";
import { SearchBar } from "../components/SearchBar";
import { VocabularyCard } from "../components/VocabularyCard";
import { n3Vocabulary } from "../data/n3Vocabulary";
import { filterVocabulary, getPartOfSpeechOptions } from "../lib/vocabularyFilters";
import type {
  PartOfSpeechFilter,
  VocabularyProgressEntry,
  VocabularyProgressMap,
  VocabularyStats,
  VocabularyStatusFilter
} from "../types/vocabulary";

type StudyPageProps = {
  progress: VocabularyProgressMap;
  stats: VocabularyStats;
  getProgress: (id: string) => VocabularyProgressEntry;
  onToggleFavorite: (id: string) => void;
  onToggleMastered: (id: string) => void;
};

const statusOptions = (stats: VocabularyStats): FilterOption<VocabularyStatusFilter>[] => [
  { value: "all", label: "全部", count: stats.totalCount },
  { value: "unmastered", label: "未掌握", count: stats.unmasteredCount },
  { value: "mastered", label: "已掌握", count: stats.masteredCount },
  { value: "favorite", label: "已收藏", count: stats.favoriteCount }
];

export const StudyPage = ({
  progress,
  stats,
  getProgress,
  onToggleFavorite,
  onToggleMastered
}: StudyPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<VocabularyStatusFilter>("all");
  const [partOfSpeechFilter, setPartOfSpeechFilter] =
    useState<PartOfSpeechFilter>("all");

  const partOfSpeechOptions = useMemo<FilterOption<PartOfSpeechFilter>[]>(
    () =>
      getPartOfSpeechOptions(n3Vocabulary).map((option) => ({
        value: option,
        label: option === "all" ? "全部词性" : option
      })),
    []
  );

  const filteredVocabulary = useMemo(
    () =>
      filterVocabulary(n3Vocabulary, progress, {
        searchTerm,
        statusFilter,
        partOfSpeechFilter
      }),
    [partOfSpeechFilter, progress, searchTerm, statusFilter]
  );

  return (
    <div className="space-y-5">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-matcha-700">日本語 N3</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
              词汇学习
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {stats.totalCount} 个词条，{stats.unmasteredCount} 个待掌握
            </p>
          </div>
          <div className="rounded-lg bg-white px-3 py-2 text-right shadow-soft">
            <p className="text-xs font-medium text-slate-500">进度</p>
            <p className="text-lg font-semibold text-matcha-700">
              {stats.masteredPercent}%
            </p>
          </div>
        </div>
      </header>

      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      <div className="space-y-3">
        <FilterTabs
          label="学习状态筛选"
          options={statusOptions(stats)}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <FilterTabs
          label="词性筛选"
          options={partOfSpeechOptions}
          value={partOfSpeechFilter}
          onChange={setPartOfSpeechFilter}
        />
      </div>

      {filteredVocabulary.length > 0 ? (
        <div className="space-y-3">
          {filteredVocabulary.map((item) => (
            <VocabularyCard
              key={item.id}
              item={item}
              progress={getProgress(item.id)}
              onToggleFavorite={onToggleFavorite}
              onToggleMastered={onToggleMastered}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-soft">
          <p className="text-base font-semibold text-slate-800">没有匹配词汇</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            可以调整搜索内容或筛选条件。
          </p>
        </div>
      )}
    </div>
  );
};
