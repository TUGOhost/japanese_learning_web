export type AppRoute = "home" | "kana" | "lessons" | "practice" | "profile";

export type ParsedRoute =
  | { name: "home" }
  | { name: "kana" }
  | { name: "lessons" }
  | { name: "lessonDetail"; lessonId: string }
  | { name: "practice" }
  | { name: "profile" };
