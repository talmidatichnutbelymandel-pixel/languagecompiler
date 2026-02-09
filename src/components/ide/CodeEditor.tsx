import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  language: string;
  theme: 'vs-dark' | 'light';
  onChange: (value: string) => void;
}

export default function CodeEditor({ value, language, theme, onChange }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme={theme}
      onChange={v => onChange(v ?? '')}
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
