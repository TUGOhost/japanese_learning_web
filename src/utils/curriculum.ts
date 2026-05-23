import { curriculum, type CurriculumStage, type CurriculumUnit } from "../data/curriculum";
import type { LearningProgress } from "../types/learning";

export type UnitProgress = {
  completed: boolean;
  completedLessonCount: number;
  totalLessonCount: number;
  percent: number;
};

export type CurriculumProgressSummary = {
  currentStageId?: string;
  currentStageTitle: string;
  currentUnitId?: string;
  currentUnitTitle: string;
  nextUnitId?: string;
  nextUnitTitle: string;
  completedUnitCount: number;
  totalUnitCount: number;
  overallUnitPercent: number;
  shokyuJouPercent: number;
  shokyuGePercent: number;
  n3Unlocked: boolean;
};

const sortUnits = (units: CurriculumUnit[]) =>
  [...units].sort((a, b) => a.order - b.order);

export const getOrderedCurriculum = (): CurriculumStage[] =>
  [...curriculum]
    .sort((a, b) => a.order - b.order)
    .map((stage) => ({
      ...stage,
      units: sortUnits(stage.units)
    }));

export const getOrderedUnits = (): CurriculumUnit[] =>
  getOrderedCurriculum().flatMap((stage) => stage.units);

export const getStageForUnit = (
  unitId: string
): CurriculumStage | undefined =>
  getOrderedCurriculum().find((stage) =>
    stage.units.some((unit) => unit.id === unitId)
  );

export const getUnitById = (unitId: string): CurriculumUnit | undefined =>
  getOrderedUnits().find((unit) => unit.id === unitId);

export const isUnitUnlocked = (
  unit: CurriculumUnit,
  progress: LearningProgress
): boolean => {
  if (progress.learningMode === "free") {
    return true;
  }

  return (unit.prerequisites ?? []).every((unitId) =>
    progress.completedUnitIds.includes(unitId)
  );
};

export const getAvailableUnits = (
  progress: LearningProgress
): CurriculumUnit[] =>
  getOrderedUnits().filter((unit) => isUnitUnlocked(unit, progress));

export const getNextRecommendedUnit = (
  progress: LearningProgress
): CurriculumUnit | undefined =>
  getOrderedUnits().find(
    (unit) =>
      !progress.completedUnitIds.includes(unit.id) &&
      !(progress.learningMode === "textbook" && unit.source === "N3进阶")
  );

export const getCurrentUnit = (
  progress: LearningProgress
): CurriculumUnit | undefined => {
  if (progress.currentUnitId) {
    const currentUnit = getUnitById(progress.currentUnitId);
    if (currentUnit && !progress.completedUnitIds.includes(currentUnit.id)) {
      return currentUnit;
    }
  }

  return getNextRecommendedUnit(progress);
};

export const getUnitProgress = (
  unit: CurriculumUnit,
  progress: LearningProgress
): UnitProgress => {
  const completed = progress.completedUnitIds.includes(unit.id);
  const totalLessonCount = unit.lessonIds.length;
  const completedLessonCount = unit.lessonIds.filter((lessonId) =>
    progress.completedLessonIds.includes(lessonId)
  ).length;
  const percent = completed
    ? 100
    : totalLessonCount === 0
      ? 0
      : Math.round((completedLessonCount / totalLessonCount) * 100);

  return {
    completed,
    completedLessonCount,
    totalLessonCount,
    percent
  };
};

const getCompletionPercent = (
  units: CurriculumUnit[],
  progress: LearningProgress
): number => {
  if (units.length === 0) {
    return 0;
  }

  const completedCount = units.filter((unit) =>
    progress.completedUnitIds.includes(unit.id)
  ).length;

  return Math.round((completedCount / units.length) * 100);
};

export const getProgressSummary = (
  progress: LearningProgress
): CurriculumProgressSummary => {
  const orderedCurriculum = getOrderedCurriculum();
  const orderedUnits = orderedCurriculum.flatMap((stage) => stage.units);
  const currentUnit = getCurrentUnit(progress);
  const nextUnit = getNextRecommendedUnit(progress);
  const currentStage = currentUnit
    ? getStageForUnit(currentUnit.id)
    : orderedCurriculum[orderedCurriculum.length - 1];
  const shokyuJouUnits =
    orderedCurriculum.find((stage) => stage.id === "stage-shokyu-jou")?.units ?? [];
  const shokyuGeUnits =
    orderedCurriculum.find((stage) => stage.id === "stage-shokyu-ge")?.units ?? [];
  const n3Unit = getUnitById("unit-n3-vocabulary");

  return {
    currentStageId: currentStage?.id,
    currentStageTitle: currentStage?.title ?? "未开始",
    currentUnitId: currentUnit?.id,
    currentUnitTitle: currentUnit?.title ?? "已完成全部路线",
    nextUnitId: nextUnit?.id,
    nextUnitTitle: nextUnit?.title ?? "已完成全部路线",
    completedUnitCount: progress.completedUnitIds.length,
    totalUnitCount: orderedUnits.length,
    overallUnitPercent:
      orderedUnits.length === 0
        ? 0
        : Math.round((progress.completedUnitIds.length / orderedUnits.length) * 100),
    shokyuJouPercent: getCompletionPercent(shokyuJouUnits, progress),
    shokyuGePercent: getCompletionPercent(shokyuGeUnits, progress),
    n3Unlocked: n3Unit ? isUnitUnlocked(n3Unit, progress) : false
  };
};
