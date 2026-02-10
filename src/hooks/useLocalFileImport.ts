import { useCallback } from 'react';
import { getLanguageFromFilename } from '@/types/ide';

let importCounter = 500;
const genImportId = () => `import-${++importCounter}-${Date.now()}`;

interface ImportedFile {
  name: string;
  content: string;
  path: string;
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function isTextFile(filename: string): boolean {
  const textExts = [
    '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cs', '.html', '.htm',
    '.css', '.json', '.xml', '.md', '.txt', '.yml', '.yaml', '.toml',
    '.ini', '.cfg', '.conf', '.sh', '.bash', '.bat', '.cmd', '.ps1',
    '.rb', '.php', '.go', '.rs', '.c', '.cpp', '.h', '.hpp', '.swift',
    '.kt', '.kts', '.scala', '.r', '.sql', '.graphql', '.vue', '.svelte',
    '.sass', '.scss', '.less', '.lua', '.pl', '.pm', '.ex', '.exs',
    '.hs', '.ml', '.fs', '.fsx', '.dart', '.dockerfile', '.gitignore',
    '.env', '.lock', '.log',
  ];
  const name = filename.toLowerCase();
  return textExts.some(ext => name.endsWith(ext)) || !name.includes('.');
}

export function useLocalFileImport(
  createFile: (parentId: string | null, name: string, type: 'file' | 'folder') => string,
  updateFileContent: (fileId: string, content: string) => void,
  openFile: (fileId: string) => void,
  rootFolderId: string | null,
) {
  const importFiles = useCallback(async (fileList: FileList) => {
    const files: ImportedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (isTextFile(file.name)) {
        try {
          const content = await readFileAsText(file);
          const path = (file as any).webkitRelativePath || file.name;
          files.push({ name: file.name, content, path });
        } catch { /* skip binary files */ }
      }
    }

    if (files.length === 0) return;

    // Check if files have folder structure
    const hasFolders = files.some(f => f.path.includes('/'));

    if (hasFolders) {
      // Build folder structure
      const folderMap = new Map<string, string>(); // path -> id
      
      for (const file of files) {
        const parts = file.path.split('/');
        let currentParent = rootFolderId;
        
        // Create folders
        for (let i = 0; i < parts.length - 1; i++) {
          const folderPath = parts.slice(0, i + 1).join('/');
          if (!folderMap.has(folderPath)) {
            const folderId = createFile(currentParent, parts[i], 'folder');
            folderMap.set(folderPath, folderId);
          }
          currentParent = folderMap.get(folderPath)!;
        }
        
        // Create file
        const fileId = createFile(currentParent, parts[parts.length - 1], 'file');
        updateFileContent(fileId, file.content);
      }
      
      // Open first file
      if (files.length > 0) {
        const firstPath = files[0].path;
        const parts = firstPath.split('/');
        // We need to find the file id - open will be handled by the parent
      }
    } else {
      // Single files - add to root folder
      let lastFileId: string | null = null;
      for (const file of files) {
        const fileId = createFile(rootFolderId, file.name, 'file');
        updateFileContent(fileId, file.content);
        lastFileId = fileId;
      }
      if (lastFileId) openFile(lastFileId);
    }
  }, [createFile, updateFileContent, openFile, rootFolderId]);

  const openFilePicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.py,.js,.jsx,.ts,.tsx,.java,.cs,.html,.htm,.css,.json,.xml,.md,.txt,.yml,.yaml,.c,.cpp,.h,.go,.rs,.rb,.php,.sql,.sh,.lua,.dart,.swift,.kt';
    input.onchange = () => {
      if (input.files) importFiles(input.files);
    };
    input.click();
  }, [importFiles]);

  const openFolderPicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    (input as any).webkitdirectory = true;
    input.onchange = () => {
      if (input.files) importFiles(input.files);
    };
    input.click();
  }, [importFiles]);

  return { openFilePicker, openFolderPicker };
}
