import { Files, Search, GitBranch, Play, Settings, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActivityView = 'explorer' | 'search' | 'git' | 'run' | 'extensions' | 'settings';

interface ActivityBarProps {
  activeView: ActivityView;
  onViewChange: (view: ActivityView) => void;
  onSettingsClick: () => void;
}

const items: { view: ActivityView; icon: React.ElementType; label: string }[] = [
  { view: 'explorer', icon: Files, label: 'Explorer (Ctrl+Shift+E)' },
  { view: 'search', icon: Search, label: 'Search (Ctrl+Shift+F)' },
  { view: 'git', icon: GitBranch, label: 'Source Control (Ctrl+Shift+G)' },
  { view: 'run', icon: Play, label: 'Run & Debug (Ctrl+Shift+D)' },
  { view: 'extensions', icon: LayoutGrid, label: 'Extensions (Ctrl+Shift+X)' },
];

export default function ActivityBar({ activeView, onViewChange, onSettingsClick }: ActivityBarProps) {
  return (
    <div className="w-12 bg-sidebar border-r border-sidebar-border flex flex-col items-center justify-between py-1 shrink-0">
      <div className="flex flex-col items-center gap-0.5">
        {items.map(({ view, icon: Icon, label }) => (
          <button
            key={view}
            title={label}
            onClick={() => onViewChange(view)}
            className={cn(
              'w-12 h-12 flex items-center justify-center relative transition-colors',
              activeView === view
                ? 'text-foreground before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-foreground before:rounded-r'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-0.5 mb-1">
        <button
          title="Settings (Ctrl+,)"
          onClick={onSettingsClick}
          className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
