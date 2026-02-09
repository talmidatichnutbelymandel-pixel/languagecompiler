import { useState, useCallback, useEffect } from 'react';
import { FileNode, OpenTab, getLanguageFromFilename } from '@/types/ide';

const STORAGE_KEY = 'codecloud-files';

const DEFAULT_FILES: FileNode[] = [
  {
    id: 'folder-1',
    name: 'my-project',
    type: 'folder',
    children: [
      {
        id: 'file-1',
        name: 'main.py',
        type: 'file',
        content: '# Welcome to CodeCloud IDE!\nprint("Hello, World!")\n\nname = input("What is your name? ")\nprint(f"Hello, {name}!")\n',
        language: 'python',
      },
      {
        id: 'file-2',
        name: 'app.js',
        type: 'file',
        content: '// JavaScript Example\nconst greeting = "Hello from CodeCloud!";\nconsole.log(greeting);\n\nfor (let i = 0; i < 5; i++) {\n  console.log(`Count: ${i}`);\n}\n',
        language: 'javascript',
      },
      {
        id: 'file-3',
        name: 'index.html',
        type: 'file',
        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n  <style>\n    body { font-family: sans-serif; background: #1e1e2e; color: #cdd6f4; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n    h1 { color: #89b4fa; }\n  </style>\n</head>\n<body>\n  <div>\n    <h1>Hello CodeCloud!</h1>\n    <p>This is a live preview.</p>\n  </div>\n</body>\n</html>',
        language: 'html',
      },
      {
        id: 'file-4',
        name: 'Program.cs',
        type: 'file',
        content: 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello from C#!");\n    }\n}\n',
        language: 'csharp',
      },
      {
        id: 'file-5',
        name: 'Main.java',
        type: 'file',
        content: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}\n',
        language: 'java',
      },
    ],
  },
];

function loadFiles(): FileNode[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_FILES;
}

let idCounter = 100;
const genId = () => `node-${++idCounter}-${Date.now()}`;

export function useFileSystem() {
  const [files, setFiles] = useState<FileNode[]>(loadFiles);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }, [files]);

  const findNode = useCallback((nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const getFileContent = useCallback((fileId: string): string => {
    const node = findNode(files, fileId);
    return node?.content ?? '';
  }, [files, findNode]);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFiles(prev => {
      const update = (nodes: FileNode[]): FileNode[] =>
        nodes.map(n => {
          if (n.id === fileId) return { ...n, content };
          if (n.children) return { ...n, children: update(n.children) };
          return n;
        });
      return update(prev);
    });
    setOpenTabs(prev => prev.map(t => t.fileId === fileId ? { ...t, isModified: true } : t));
  }, []);

  const openFile = useCallback((fileId: string) => {
    const node = findNode(files, fileId);
    if (!node || node.type !== 'file') return;
    setActiveFileId(fileId);
    setOpenTabs(prev => {
      if (prev.some(t => t.fileId === fileId)) return prev;
      return [...prev, { fileId, name: node.name, language: node.language || getLanguageFromFilename(node.name), isModified: false }];
    });
  }, [files, findNode]);

  const closeTab = useCallback((fileId: string) => {
    setOpenTabs(prev => {
      const next = prev.filter(t => t.fileId !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(next.length > 0 ? next[next.length - 1].fileId : null);
      }
      return next;
    });
  }, [activeFileId]);

  const createFile = useCallback((parentId: string | null, name: string, type: 'file' | 'folder') => {
    const newNode: FileNode = {
      id: genId(),
      name,
      type,
      ...(type === 'file' ? { content: '', language: getLanguageFromFilename(name) } : { children: [] }),
    };

    setFiles(prev => {
      if (!parentId) return [...prev, newNode];
      const addChild = (nodes: FileNode[]): FileNode[] =>
        nodes.map(n => {
          if (n.id === parentId && n.type === 'folder') return { ...n, children: [...(n.children || []), newNode] };
          if (n.children) return { ...n, children: addChild(n.children) };
          return n;
        });
      return addChild(prev);
    });
    return newNode.id;
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setFiles(prev => {
      const remove = (nodes: FileNode[]): FileNode[] =>
        nodes.filter(n => n.id !== nodeId).map(n => n.children ? { ...n, children: remove(n.children) } : n);
      return remove(prev);
    });
    closeTab(nodeId);
  }, [closeTab]);

  const renameNode = useCallback((nodeId: string, newName: string) => {
    setFiles(prev => {
      const rename = (nodes: FileNode[]): FileNode[] =>
        nodes.map(n => {
          if (n.id === nodeId) {
            const updated = { ...n, name: newName };
            if (n.type === 'file') updated.language = getLanguageFromFilename(newName);
            return updated;
          }
          if (n.children) return { ...n, children: rename(n.children) };
          return n;
        });
      return rename(prev);
    });
    setOpenTabs(prev => prev.map(t => t.fileId === nodeId ? { ...t, name: newName, language: getLanguageFromFilename(newName) } : t));
  }, []);

  return {
    files,
    openTabs,
    activeFileId,
    setActiveFileId,
    getFileContent,
    updateFileContent,
    openFile,
    closeTab,
    createFile,
    deleteNode,
    renameNode,
    findNode: (id: string) => findNode(files, id),
  };
}
