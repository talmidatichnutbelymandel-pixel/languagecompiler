import { useState, useEffect, useCallback } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { LANGUAGE_CONFIG } from '@/types/ide';
import FileTree from './FileTree';
import EditorTabs from './EditorTabs';
import CodeEditor from './CodeEditor';
import OutputPanel from './OutputPanel';
import PreviewPanel from './PreviewPanel';
import { Settings, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_KEY_STORAGE = 'codecloud-judge0-key';

export default function IDELayout() {
  const {
    files, openTabs, activeFileId, setActiveFileId,
    getFileContent, updateFileContent, openFile, closeTab,
    createFile, deleteNode, renameNode, findNode,
  } = useFileSystem();

  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { isRunning, output, executeCode, clearOutput } = useCodeExecution(apiKey);

  const activeFile = activeFileId ? findNode(activeFileId) : null;
  const activeContent = activeFileId ? getFileContent(activeFileId) : '';
  const activeLang = activeFile?.language || 'plaintext';
  const canRun = !!activeFile && !!LANGUAGE_CONFIG[activeLang] && LANGUAGE_CONFIG[activeLang].id > 0;
  const isHtml = activeLang === 'html';

  useEffect(() => {
    if (isHtml) setShowPreview(true);
  }, [isHtml]);

  const handleRun = useCallback((stdin: string) => {
    if (activeFile && canRun) {
      executeCode(activeContent, activeLang, stdin);
    }
  }, [activeFile, canRun, activeContent, activeLang, executeCode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleRun('');
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        // Files auto-save to localStorage
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRun]);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  };

  const isDark = theme === 'vs-dark';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDark ? 'dark' : ''}`}>
      {/* Title bar */}
      <div className="h-10 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold tracking-tight">CodeCloud IDE</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setTheme(isDark ? 'light' : 'vs-dark')}
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* File tree */}
          <ResizablePanel defaultSize={18} minSize={12} maxSize={30}>
            <FileTree
              files={files}
              activeFileId={activeFileId}
              onFileSelect={openFile}
              onCreateFile={createFile}
              onDeleteNode={deleteNode}
              onRenameNode={renameNode}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Editor + Output */}
          <ResizablePanel defaultSize={showPreview ? 50 : 82}>
            <ResizablePanelGroup direction="vertical">
              {/* Editor */}
              <ResizablePanel defaultSize={65}>
                <div className="h-full flex flex-col">
                  <EditorTabs
                    tabs={openTabs}
                    activeFileId={activeFileId}
                    onSelectTab={setActiveFileId}
                    onCloseTab={closeTab}
                  />
                  <div className="flex-1">
                    {activeFile ? (
                      <CodeEditor
                        value={activeContent}
                        language={LANGUAGE_CONFIG[activeLang]?.monacoLang || activeLang}
                        theme={theme}
                        onChange={val => updateFileContent(activeFileId!, val)}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        <div className="text-center space-y-2">
                          <Monitor className="h-12 w-12 mx-auto opacity-20" />
                          <p>Select a file to start editing</p>
                          <p className="text-xs">Or right-click in the explorer to create a new file</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Output */}
              <ResizablePanel defaultSize={35} minSize={15}>
                <OutputPanel
                  output={output}
                  isRunning={isRunning}
                  onRun={handleRun}
                  onClear={clearOutput}
                  canRun={canRun}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Preview panel */}
          {showPreview && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={32} minSize={20}>
                <PreviewPanel htmlContent={isHtml ? activeContent : ''} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Configure your CodeCloud IDE</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="api-key">Judge0 API Key (RapidAPI)</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={e => saveApiKey(e.target.value)}
                placeholder="Enter your RapidAPI key for Judge0..."
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get a free key at{' '}
                <a href="https://rapidapi.com/judge0-official/api/judge0-ce" target="_blank" rel="noreferrer" className="underline text-primary">
                  rapidapi.com/judge0
                </a>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
