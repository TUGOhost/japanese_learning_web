import { useEffect, useMemo, useState } from "react";

import { BottomNav } from "./components/BottomNav";
import { useLearningProgress } from "./hooks/useLearningProgress";
import { HomePage } from "./pages/HomePage";
import { KanaPage } from "./pages/KanaPage";
import { LessonDetailPage } from "./pages/LessonDetailPage";
import { LessonsPage } from "./pages/LessonsPage";
import { PracticePage } from "./pages/PracticePage";
import { ProfilePage } from "./pages/ProfilePage";
import type { AppRoute, ParsedRoute } from "./types/navigation";

const bottomRoutes: AppRoute[] = [
  "home",
  "kana",
  "lessons",
  "practice",
  "profile"
];

const parseHashRoute = (): ParsedRoute => {
  if (typeof window === "undefined") {
    return { name: "home" };
  }

  const route = window.location.hash.replace(/^#\/?/, "");
  const [firstSegment, secondSegment] = route.split("/");

  if (firstSegment === "lessons" && secondSegment) {
    return { name: "lessonDetail", lessonId: secondSegment };
  }

  if (bottomRoutes.includes(firstSegment as AppRoute)) {
    return { name: firstSegment as AppRoute };
  }

  return { name: "home" };
};

const getActiveBottomRoute = (route: ParsedRoute): AppRoute => {
  if (route.name === "lessonDetail") {
    return "lessons";
  }

  return route.name;
};

const pageTitles: Record<ParsedRoute["name"], string> = {
  home: "从零开始学日语",
  kana: "五十音",
  lessons: "课程",
  lessonDetail: "课程详情",
  practice: "练习",
  profile: "我的"
};

export default function App() {
  const [route, setRoute] = useState<ParsedRoute>(() => parseHashRoute());
  const learning = useLearningProgress();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute());
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    document.title = `${pageTitles[route.name]} | 日语入门`;
  }, [route.name]);

  const currentPage = useMemo(() => {
    if (route.name === "kana") {
      return <KanaPage />;
    }

    if (route.name === "lessons") {
      return <LessonsPage progress={learning.progress} />;
    }

    if (route.name === "lessonDetail") {
      return (
        <LessonDetailPage
          lessonId={route.lessonId}
          progress={learning.progress}
          completeUnit={learning.completeUnit}
          setCurrentUnit={learning.setCurrentUnit}
          recordQuizAnswer={learning.recordQuizAnswer}
          toggleVocabularyFavorite={learning.toggleVocabularyFavorite}
          toggleVocabularyMastered={learning.toggleVocabularyMastered}
          toggleGrammarFavorite={learning.toggleGrammarFavorite}
          toggleGrammarMastered={learning.toggleGrammarMastered}
        />
      );
    }

    if (route.name === "practice") {
      return (
        <PracticePage
          progress={learning.progress}
          recordQuizAnswer={learning.recordQuizAnswer}
          toggleVocabularyFavorite={learning.toggleVocabularyFavorite}
          toggleVocabularyMastered={learning.toggleVocabularyMastered}
          setVocabularyMastered={learning.setVocabularyMastered}
        />
      );
    }

    if (route.name === "profile") {
      return (
        <ProfilePage
          progress={learning.progress}
          stats={learning.stats}
          resetProgress={learning.resetProgress}
          setLearningMode={learning.setLearningMode}
          toggleGrammarFavorite={learning.toggleGrammarFavorite}
          toggleGrammarMastered={learning.toggleGrammarMastered}
        />
      );
    }

    return <HomePage progress={learning.progress} stats={learning.stats} />;
  }, [learning, route]);

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,#dbf7eb_0,#f8fafc_30rem)] text-slate-900">
      <main className="mx-auto min-h-dvh w-full max-w-xl px-5 pb-[calc(6.75rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pt-8">
        {currentPage}
      </main>
      <BottomNav activeRoute={getActiveBottomRoute(route)} />
    </div>
  );
}
