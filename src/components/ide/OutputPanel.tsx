import { Trash2, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface OutputPanelProps {
  output: string;
  isRunning: boolean;
  onRun: (stdin: string) => void;
  onClear: () => void;
  canRun: boolean;
}

export default function OutputPanel({ output, isRunning, onRun, onClear, canRun }: OutputPanelProps) {
  const [stdin, setStdin] = useState('');
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-sidebar-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Console</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => setShowInput(!showInput)}
          >
            Input
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClear}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            className="h-6 text-xs px-2 gap-1"
            onClick={() => onRun(stdin)}
            disabled={isRunning || !canRun}
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run
          </Button>
        </div>
      </div>

      {showInput && (
        <div className="px-3 py-2 border-b border-sidebar-border">
          <Textarea
            value={stdin}
            onChange={e => setStdin(e.target.value)}
            placeholder="Program input (stdin)..."
            className="h-16 text-xs font-mono bg-background resize-none"
          />
        </div>
      )}

      <div className="flex-1 overflow-auto p-3">
        <pre className="text-xs font-mono whitespace-pre-wrap break-words text-foreground/90">
          {output || '// Output will appear here after running your code.\n// Click ▶ Run or press Ctrl+Enter to execute.'}
        </pre>
      </div>
    </div>
  );
}
