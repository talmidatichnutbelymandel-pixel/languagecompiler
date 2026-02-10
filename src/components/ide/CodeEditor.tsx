import { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { registerCompletionProviders } from '@/lib/monacoCompletions';

interface CodeEditorProps {
  value: string;
  language: string;
  theme: 'vs-dark' | 'light';
  onChange: (value: string) => void;
}

const registeredRef = { current: false };

export default function CodeEditor({ value, language, theme, onChange }: CodeEditorProps) {
  const handleMount: OnMount = (_editor, monaco) => {
    if (!registeredRef.current) {
      registerCompletionProviders(monaco);
      registeredRef.current = true;
    }
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme={theme}
      onChange={v => onChange(v ?? '')}
      onMount={handleMount}
      options={{
        fontSize: 14,
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
        fontLigatures: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        bracketPairColorization: { enabled: true },
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        cursorBlinking: 'smooth',
        smoothScrolling: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        padding: { top: 8 },
      }}
    />
  );
}
