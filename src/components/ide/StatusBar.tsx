import { GitBranch, Bell, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatusBarProps {
  language: string;
  lineCount: number;
  cursorLine?: number;
  cursorCol?: number;
  encoding?: string;
}

export default function StatusBar({ language, lineCount, cursorLine = 1, cursorCol = 1, encoding = 'UTF-8' }: StatusBarProps) {
  return (
    <div className="h-6 bg-primary flex items-center justify-between px-3 text-primary-foreground text-[11px] shrink-0 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>0</span>
          <AlertTriangle className="h-3 w-3 ml-1" />
          <span>0</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span>Ln {cursorLine}, Col {cursorCol}</span>
        <span>Spaces: 2</span>
        <span>{encoding}</span>
        <span>{language || 'Plain Text'}</span>
        <span className="flex items-center gap-1">
          <Bell className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
