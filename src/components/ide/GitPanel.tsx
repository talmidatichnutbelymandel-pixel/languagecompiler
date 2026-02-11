import { GitBranch, Plus, Check, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileNode } from '@/types/ide';

interface GitPanelProps {
  files: FileNode[];
}

function flattenFileNames(nodes: FileNode[], path = ''): string[] {
  const result: string[] = [];
  for (const node of nodes) {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    if (node.type === 'file') result.push(fullPath);
    if (node.children) result.push(...flattenFileNames(node.children, fullPath));
  }
  return result;
}

export default function GitPanel({ files }: GitPanelProps) {
  const allFiles = flattenFileNames(files);

  return (
    <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-sidebar-border flex items-center justify-between">
        <span>Source Control</span>
        <div className="flex items-center gap-1">
          <button title="Refresh" className="p-0.5 hover:bg-accent rounded">
            <RefreshCw className="h-3 w-3" />
          </button>
          <button title="Stage All" className="p-0.5 hover:bg-accent rounded">
            <Plus className="h-3 w-3" />
          </button>
          <button title="Commit" className="p-0.5 hover:bg-accent rounded">
            <Check className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="p-2">
        <input
          placeholder="Commit message"
          className="w-full bg-input rounded px-2 py-1 text-xs text-foreground border-none outline-none"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="px-2">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 px-1">
            Changes ({allFiles.length})
          </div>
          {allFiles.slice(0, 50).map((f, i) => (
            <div key={i} className="flex items-center justify-between px-1 py-0.5 text-[10px] hover:bg-accent rounded group">
              <span className="text-muted-foreground truncate">{f}</span>
              <span className="text-green-400 font-bold shrink-0 opacity-0 group-hover:opacity-100">M</span>
            </div>
          ))}
        </div>
        <div className="p-3 text-xs text-muted-foreground text-center mt-4">
          <GitBranch className="h-4 w-4 mx-auto mb-1 opacity-50" />
          <p>Use the terminal for full Git operations:</p>
          <p className="mt-1 font-mono text-[10px] text-primary">git init → git add . → git commit -m "msg"</p>
          <p className="font-mono text-[10px] text-primary">git remote add origin &lt;url&gt; → git push</p>
        </div>
      </ScrollArea>
    </div>
  );
}
