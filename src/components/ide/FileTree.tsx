import { useState } from 'react';
import { FileNode } from '@/types/ide';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, FilePlus, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';

interface FileTreeProps {
  files: FileNode[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onCreateFile: (parentId: string | null, name: string, type: 'file' | 'folder') => void;
  onDeleteNode: (nodeId: string) => void;
  onRenameNode: (nodeId: string, newName: string) => void;
}

function FileIcon({ name, isOpen }: { name: string; isOpen?: boolean }) {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  const colorMap: Record<string, string> = {
    '.py': 'text-yellow-400',
    '.js': 'text-yellow-300',
    '.jsx': 'text-blue-400',
    '.ts': 'text-blue-400',
    '.tsx': 'text-blue-400',
    '.java': 'text-orange-400',
    '.cs': 'text-green-400',
    '.html': 'text-orange-300',
    '.css': 'text-blue-300',
    '.json': 'text-yellow-200',
  };
  return <File className={cn('h-4 w-4 shrink-0', colorMap[ext] || 'text-muted-foreground')} />;
}

function TreeNode({
  node,
  depth,
  activeFileId,
  onFileSelect,
  onCreateFile,
  onDeleteNode,
  onRenameNode,
}: {
  node: FileNode;
  depth: number;
  activeFileId: string | null;
  onFileSelect: (id: string) => void;
  onCreateFile: (parentId: string | null, name: string, type: 'file' | 'folder') => void;
  onDeleteNode: (id: string) => void;
  onRenameNode: (id: string, name: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [newName, setNewName] = useState('');

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      onRenameNode(node.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateFile(node.type === 'folder' ? node.id : null, newName.trim(), isCreating!);
    }
    setIsCreating(null);
    setNewName('');
  };

  const isFolder = node.type === 'folder';

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 cursor-pointer text-sm hover:bg-accent/50 rounded-sm select-none',
              activeFileId === node.id && 'bg-accent text-accent-foreground'
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => {
              if (isFolder) setIsOpen(!isOpen);
              else onFileSelect(node.id);
            }}
          >
            {isFolder ? (
              <>
                {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                {isOpen ? <FolderOpen className="h-4 w-4 shrink-0 text-blue-400" /> : <Folder className="h-4 w-4 shrink-0 text-blue-400" />}
              </>
            ) : (
              <>
                <span className="w-3.5" />
                <FileIcon name={node.name} />
              </>
            )}
            {isRenaming ? (
              <Input
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={handleRename}
                onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsRenaming(false); }}
                className="h-5 text-xs py-0 px-1 bg-background"
                autoFocus
              />
            ) : (
              <span className="truncate">{node.name}</span>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isFolder && (
            <>
              <ContextMenuItem onClick={() => { setIsCreating('file'); setNewName(''); setIsOpen(true); }}>
                <FilePlus className="h-4 w-4 mr-2" /> New File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => { setIsCreating('folder'); setNewName(''); setIsOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> New Folder
              </ContextMenuItem>
            </>
          )}
          <ContextMenuItem onClick={() => { setIsRenaming(true); setRenameValue(node.name); }}>
            <Pencil className="h-4 w-4 mr-2" /> Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDeleteNode(node.id)} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {isFolder && isOpen && (
        <>
          {isCreating && (
            <div className="flex items-center gap-1 px-2 py-1" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
              {isCreating === 'folder' ? <Folder className="h-4 w-4 text-blue-400" /> : <File className="h-4 w-4 text-muted-foreground" />}
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onBlur={handleCreate}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setIsCreating(null); setNewName(''); } }}
                placeholder={isCreating === 'file' ? 'filename.ext' : 'folder name'}
                className="h-5 text-xs py-0 px-1 bg-background"
                autoFocus
              />
            </div>
          )}
          {node.children?.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeFileId={activeFileId}
              onFileSelect={onFileSelect}
              onCreateFile={onCreateFile}
              onDeleteNode={onDeleteNode}
              onRenameNode={onRenameNode}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default function FileTree({ files, activeFileId, onFileSelect, onCreateFile, onDeleteNode, onRenameNode }: FileTreeProps) {
  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-sidebar-border flex items-center justify-between">
        <span>Explorer</span>
        <div className="flex gap-1">
          <button onClick={() => onCreateFile(files[0]?.id || null, 'untitled.txt', 'file')} className="hover:text-foreground p-0.5">
            <FilePlus className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onCreateFile(files[0]?.id || null, 'new-folder', 'folder')} className="hover:text-foreground p-0.5">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {files.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            activeFileId={activeFileId}
            onFileSelect={onFileSelect}
            onCreateFile={onCreateFile}
            onDeleteNode={onDeleteNode}
            onRenameNode={onRenameNode}
          />
        ))}
      </div>
    </div>
  );
}
