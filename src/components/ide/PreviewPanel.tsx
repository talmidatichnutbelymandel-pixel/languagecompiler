import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';

interface PreviewPanelProps {
  htmlContent: string;
}

export default function PreviewPanel({ htmlContent }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent, key]);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-sidebar-border bg-sidebar">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setKey(k => k + 1)}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex-1">
        <iframe
          ref={iframeRef}
          key={key}
          className="w-full h-full border-0 bg-white"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
