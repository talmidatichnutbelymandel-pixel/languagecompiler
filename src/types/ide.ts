export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
}

export interface OpenTab {
  fileId: string;
  name: string;
  language: string;
  isModified: boolean;
}

export type SupportedLanguage = 
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'csharp'
  | 'html'
  | 'css'
  | 'json'
  | 'plaintext';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  compile_output: string;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
}

export const LANGUAGE_CONFIG: Record<string, { id: number; name: string; extension: string; monacoLang: string }> = {
  python: { id: 71, name: 'Python 3', extension: '.py', monacoLang: 'python' },
  javascript: { id: 63, name: 'JavaScript', extension: '.js', monacoLang: 'javascript' },
  typescript: { id: 74, name: 'TypeScript', extension: '.ts', monacoLang: 'typescript' },
  java: { id: 62, name: 'Java', extension: '.java', monacoLang: 'java' },
  csharp: { id: 51, name: 'C#', extension: '.cs', monacoLang: 'csharp' },
  html: { id: 0, name: 'HTML', extension: '.html', monacoLang: 'html' },
  css: { id: 0, name: 'CSS', extension: '.css', monacoLang: 'css' },
  json: { id: 0, name: 'JSON', extension: '.json', monacoLang: 'json' },
};

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  const map: Record<string, string> = {
    '.py': 'python',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.java': 'java',
    '.cs': 'csharp',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.json': 'json',
  };
  return map[ext] || 'plaintext';
}
