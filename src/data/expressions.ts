import { generatedExpressionsFromJson } from "./contentRepository";
import { filterVisibleContent } from "../lib/contentVisibility";
import type { ExpressionItem } from "../types/learning";

export const expressions: ExpressionItem[] =
  filterVisibleContent(generatedExpressionsFromJson);
