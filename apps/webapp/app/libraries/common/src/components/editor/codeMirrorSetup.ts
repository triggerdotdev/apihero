import {
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  lineNumbers,
  highlightActiveLineGutter,
} from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { highlightSelectionMatches } from "@codemirror/search";
import { json as jsonLang } from "@codemirror/lang-json";
import { closeBrackets } from "@codemirror/autocomplete";
import { bracketMatching } from "@codemirror/language";

export function getPreviewSetup(): Array<Extension> {
  return [
    jsonLang(),
    highlightSpecialChars(),
    drawSelection(),
    dropCursor(),
    bracketMatching(),
    highlightSelectionMatches(),
    lineNumbers(),
  ];
}

export function getViewerSetup(): Array<Extension> {
  return [drawSelection(), dropCursor(), bracketMatching(), lineNumbers()];
}

export function getEditorSetup(): Array<Extension> {
  return [
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    drawSelection(),
    dropCursor(),
    bracketMatching(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    lineNumbers(),
    closeBrackets(),
  ];
}
