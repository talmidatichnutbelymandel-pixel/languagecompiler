import { OpenTab } from '@/types/ide';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorTabsProps {
  tabs: OpenTab[];
  activeFileId: string | null;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
}

export default function EditorTabs({ tabs, activeFileId, onSelectTab, onCloseTab }: EditorTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <div className="flex bg-sidebar border-b border-sidebar-border overflow-x-auto">
      {tabs.map(tab => (
        <div
          key={tab.fileId}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r border-sidebar-border min-w-0 group',
            activeFileId === tab.fileId
              ? 'bg-background text-foreground border-b-2 border-b-primary'
              : 'text-muted-foreground hover:bg-accent/30'
          )}
          onClick={() => onSelectTab(tab.fileId)}
        >
          <span className="truncate max-w-[120px]">
            {tab.isModified && <span className="text-primary mr-0.5">●</span>}
            {tab.name}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onCloseTab(tab.fileId); }}
            className="opacity-0 group-hover:opacity-100 hover:bg-accent rounded p-0.5 shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
