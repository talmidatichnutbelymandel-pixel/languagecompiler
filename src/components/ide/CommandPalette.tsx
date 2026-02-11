import { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { FileNode } from '@/types/ide';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  mode: 'commands' | 'files';
  files: FileNode[];
  onFileSelect: (fileId: string) => void;
  onAction: (action: string) => void;
}

const COMMANDS = [
  { id: 'toggle-terminal', label: 'Toggle Terminal', shortcut: 'Ctrl+`' },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', shortcut: 'Ctrl+B' },
  { id: 'toggle-preview', label: 'Toggle Preview', shortcut: '' },
  { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N' },
  { id: 'run-code', label: 'Run Code', shortcut: 'Ctrl+Enter' },
  { id: 'clear-output', label: 'Clear Console', shortcut: '' },
  { id: 'toggle-theme', label: 'Toggle Light/Dark Theme', shortcut: '' },
  { id: 'open-file', label: 'Open File from Disk', shortcut: '' },
  { id: 'open-folder', label: 'Open Folder from Disk', shortcut: '' },
];

function flattenFiles(nodes: FileNode[], path = ''): { id: string; name: string; path: string }[] {
  const result: { id: string; name: string; path: string }[] = [];
  for (const node of nodes) {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    if (node.type === 'file') {
      result.push({ id: node.id, name: node.name, path: fullPath });
    }
    if (node.children) {
      result.push(...flattenFiles(node.children, fullPath));
    }
  }
  return result;
}

export default function CommandPalette({ open, onClose, mode, files, onFileSelect, onAction }: CommandPaletteProps) {
  const flatFiles = useMemo(() => flattenFiles(files), [files]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="p-0 max-w-lg overflow-hidden border-primary/30 shadow-2xl [&>button]:hidden">
        <Command className="rounded-lg border-0">
          <CommandInput placeholder={mode === 'files' ? 'Search files by name...' : 'Type a command...'} />
          <CommandList className="max-h-72">
            <CommandEmpty>No results found.</CommandEmpty>
            {mode === 'files' ? (
              <CommandGroup heading="Files">
                {flatFiles.map(f => (
                  <CommandItem
                    key={f.id}
                    value={f.path}
                    onSelect={() => { onFileSelect(f.id); onClose(); }}
                    className="text-sm"
                  >
                    <span className="text-muted-foreground text-xs mr-2">📄</span>
                    <span>{f.name}</span>
                    <span className="ml-auto text-muted-foreground text-xs">{f.path}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandGroup heading="Commands">
                {COMMANDS.map(cmd => (
                  <CommandItem
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={() => { onAction(cmd.id); onClose(); }}
                    className="text-sm"
                  >
                    <span>{cmd.label}</span>
                    {cmd.shortcut && (
                      <span className="ml-auto text-muted-foreground text-xs font-mono">{cmd.shortcut}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
