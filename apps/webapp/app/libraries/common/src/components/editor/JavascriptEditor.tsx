import { javascript } from "@codemirror/lang-javascript";
import type {
  ReactCodeMirrorProps,
  UseCodeMirror,
  ViewUpdate,
} from "@uiw/react-codemirror";
import { useCodeMirror } from "@uiw/react-codemirror";
import clsx from "clsx";
import { useRef, useEffect } from "react";
import { getEditorSetup } from "./codeMirrorSetup";
import { lightTheme } from "./codeMirrorTheme";

export interface JavascriptEditorProps
  extends Omit<ReactCodeMirrorProps, "onBlur"> {
  content: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onUpdate?: (update: ViewUpdate) => void;
  onBlur?: (code: string) => void;
}

type JavascriptEditorDefaultProps = Partial<JavascriptEditorProps>;

const defaultProps: JavascriptEditorDefaultProps = {
  readOnly: true,
  basicSetup: false,
};

export function JavascriptEditor(opts: JavascriptEditorProps) {
  const { content, readOnly, onChange, onUpdate, onBlur } = {
    ...defaultProps,
    ...opts,
  };

  const extensions = getEditorSetup();

  extensions.push(javascript({ typescript: true }));

  const editor = useRef<HTMLDivElement>(null);
  const settings: Omit<UseCodeMirror, "onBlur"> = {
    ...opts,
    container: editor.current,
    extensions,
    editable: !readOnly,
    contentEditable: !readOnly,
    value: content,
    autoFocus: false,
    theme: lightTheme(),
    indentWithTab: false,
    basicSetup: false,
    onChange,
    onUpdate,
  };
  const { setContainer } = useCodeMirror(settings);

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
    }
  }, [setContainer]);

  return (
    <div
      className={clsx("no-scrollbar overflow-y-auto", opts.className)}
      ref={editor}
      onBlur={() => {
        if (!onBlur) return;
        onBlur(editor.current?.textContent ?? "");
      }}
    />
  );
}
