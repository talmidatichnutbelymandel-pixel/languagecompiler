import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { FileNode } from '@/types/ide';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchPanelProps {
  files: FileNode[];
  onFileSelect: (fileId: string) => void;
}

interface SearchResult {
  fileId: string;
  fileName: string;
  filePath: string;
  lineNumber: number;
  lineText: string;
  matchStart: number;
  matchEnd: number;
}

function searchFiles(nodes: FileNode[], query: string, path = ''): SearchResult[] {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  for (const node of nodes) {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    if (node.type === 'file' && node.content) {
      const lines = node.content.split('\n');
      lines.forEach((line, idx) => {
        const lowerLine = line.toLowerCase();
        let pos = 0;
        while ((pos = lowerLine.indexOf(lowerQuery, pos)) !== -1) {
          results.push({
            fileId: node.id,
            fileName: node.name,
            filePath: fullPath,
            lineNumber: idx + 1,
            lineText: line,
            matchStart: pos,
            matchEnd: pos + query.length,
          });
          pos += query.length;
        }
      });
    }
    if (node.children) {
      results.push(...searchFiles(node.children, query, fullPath));
    }
  }
  return results;
}

export default function SearchPanel({ files, onFileSelect }: SearchPanelProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (query.length < 2) return [];
    return searchFiles(files, query).slice(0, 100);
  }, [files, query]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const r of results) {
      if (!groups[r.filePath]) groups[r.filePath] = [];
      groups[r.filePath].push(r);
    }
    return groups;
  }, [results]);

  return (
    <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-sidebar-border">
        Search
      </div>
      <div className="p-2">
        <div className="flex items-center gap-1 bg-input rounded px-2 py-1">
          <Search className="h-3 w-3 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search across files..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-foreground"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-2 pb-2">
          {query.length >= 2 && results.length === 0 && (
            <div className="text-xs text-muted-foreground p-2 text-center">No results found.</div>
          )}
          {Object.entries(groupedResults).map(([filePath, fileResults]) => (
            <div key={filePath} className="mb-2">
              <div className="text-[10px] font-medium text-foreground px-1 py-0.5 truncate">{filePath}</div>
              {fileResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => onFileSelect(r.fileId)}
                  className="w-full text-left px-2 py-0.5 hover:bg-accent rounded text-[10px] font-mono text-muted-foreground truncate block"
                >
                  <span className="text-muted-foreground/60 mr-1">{r.lineNumber}:</span>
                  {r.lineText.slice(0, r.matchStart)}
                  <span className="bg-yellow-500/30 text-yellow-200">{r.lineText.slice(r.matchStart, r.matchEnd)}</span>
                  {r.lineText.slice(r.matchEnd)}
                </button>
              ))}
            </div>
          ))}
          {query.length > 0 && query.length < 2 && (
            <div className="text-xs text-muted-foreground p-2 text-center">Type at least 2 characters</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
