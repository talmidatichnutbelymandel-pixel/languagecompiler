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
import StatusBar from './StatusBar';
import ActivityBar, { ActivityView } from './ActivityBar';
import CommandPalette from './CommandPalette';
import TerminalPanel from './TerminalPanel';
import SettingsPanel, { EditorSettings, DEFAULT_SETTINGS } from './SettingsPanel';
import SearchPanel from './SearchPanel';
import GitPanel from './GitPanel';
import WelcomeTab from './WelcomeTab';
import { Moon, Sun, Monitor, FolderOpen, FileUp, Plus } from 'lucide-react';
import { useLocalFileImport } from '@/hooks/useLocalFileImport';
import { Button } from '@/components/ui/button';
import { PROJECT_TEMPLATES } from '@/lib/projectTemplates';
import { FileNode } from '@/types/ide';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const SETTINGS_KEY = 'codecloud-settings';

function loadSettings(): EditorSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export default function IDELayout() {
  const {
    files, openTabs, activeFileId, setActiveFileId,
    getFileContent, updateFileContent, openFile, closeTab,
    createFile, deleteNode, renameNode, findNode, addProjectTree,
  } = useFileSystem();

  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [showPreview, setShowPreview] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeView, setActiveView] = useState<ActivityView>('explorer');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandPaletteMode, setCommandPaletteMode] = useState<'commands' | 'files'>('commands');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(loadSettings);
  const [showWelcome, setShowWelcome] = useState(true);

  const rootFolderId = files[0]?.id || null;
  const { openFilePicker, openFolderPicker } = useLocalFileImport(createFile, updateFileContent, openFile, rootFolderId);
  const { isRunning, output, executeCode, clearOutput } = useCodeExecution();

  const activeFile = activeFileId ? findNode(activeFileId) : null;
  const activeContent = activeFileId ? getFileContent(activeFileId) : '';
  const activeLang = activeFile?.language || 'plaintext';
  const canRun = !!activeFile && !!LANGUAGE_CONFIG[activeLang] && LANGUAGE_CONFIG[activeLang].id > 0;
  const isHtml = activeLang === 'html';

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(editorSettings));
  }, [editorSettings]);

  useEffect(() => {
    if (isHtml) setShowPreview(true);
  }, [isHtml]);

  useEffect(() => {
    if (activeFileId) setShowWelcome(false);
  }, [activeFileId]);

  const handleCreateProject = useCallback((projectNode: FileNode) => {
    addProjectTree(projectNode, rootFolderId);
    setShowPreview(true);
  }, [addProjectTree, rootFolderId]);

  const handleRun = useCallback((stdin: string) => {
    if (activeFile && canRun) {
      executeCode(activeContent, activeLang, stdin);
    }
  }, [activeFile, canRun, activeContent, activeLang, executeCode]);

  const handleCommandAction = useCallback((action: string) => {
    switch (action) {
      case 'toggle-terminal': setShowTerminal(p => !p); break;
      case 'toggle-sidebar': setShowSidebar(p => !p); break;
      case 'toggle-preview': setShowPreview(p => !p); break;
      case 'new-file': createFile(rootFolderId, 'untitled.txt', 'file'); break;
      case 'run-code': handleRun(''); break;
      case 'clear-output': clearOutput(); break;
      case 'toggle-theme': setTheme(t => t === 'vs-dark' ? 'light' : 'vs-dark'); break;
      case 'open-file': openFilePicker(); break;
      case 'open-folder': openFolderPicker(); break;
      case 'open-settings': setActiveView('settings'); setShowSidebar(true); break;
    }
  }, [handleRun, clearOutput, createFile, rootFolderId, openFilePicker, openFolderPicker]);

  const handleSettingsClick = useCallback(() => {
    setActiveView('settings');
    setShowSidebar(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (ctrl && e.key === 'Enter') { e.preventDefault(); handleRun(''); return; }
      if (ctrl && e.key === 's') { e.preventDefault(); return; }
      if (ctrl && !shift && e.key === 'p') { e.preventDefault(); setCommandPaletteMode('files'); setCommandPaletteOpen(true); return; }
      if (ctrl && shift && e.key === 'P') { e.preventDefault(); setCommandPaletteMode('commands'); setCommandPaletteOpen(true); return; }
      if (ctrl && e.key === 'b') { e.preventDefault(); setShowSidebar(p => !p); return; }
      if (ctrl && (e.key === 'j' || e.key === '`')) { e.preventDefault(); setShowTerminal(p => !p); return; }
      if (ctrl && e.key === 'w') { e.preventDefault(); if (activeFileId) closeTab(activeFileId); return; }
      if (ctrl && e.key === 'n') { e.preventDefault(); createFile(rootFolderId, 'untitled.txt', 'file'); return; }
      if (ctrl && shift && e.key === 'E') { e.preventDefault(); setActiveView('explorer'); setShowSidebar(true); return; }
      if (ctrl && shift && e.key === 'F') { e.preventDefault(); setActiveView('search'); setShowSidebar(true); return; }
      if (ctrl && shift && e.key === 'G') { e.preventDefault(); setActiveView('git'); setShowSidebar(true); return; }
      if (ctrl && shift && e.key === 'D') { e.preventDefault(); setActiveView('run'); setShowSidebar(true); return; }
      if (ctrl && shift && e.key === 'X') { e.preventDefault(); setActiveView('extensions'); setShowSidebar(true); return; }
      if (ctrl && e.key === ',') { e.preventDefault(); setActiveView('settings'); setShowSidebar(true); return; }
      if (ctrl && e.key === 'Tab') {
        e.preventDefault();
        if (openTabs.length > 1 && activeFileId) {
          const idx = openTabs.findIndex(t => t.fileId === activeFileId);
          const next = shift ? (idx - 1 + openTabs.length) % openTabs.length : (idx + 1) % openTabs.length;
          setActiveFileId(openTabs[next].fileId);
        }
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRun, activeFileId, openTabs, closeTab, createFile, rootFolderId, setActiveFileId]);

  const isDark = theme === 'vs-dark';
  const langConfig = LANGUAGE_CONFIG[activeLang];
  const langName = langConfig?.name || activeLang;
  const lineCount = activeContent.split('\n').length;

  const renderSidebarContent = () => {
    switch (activeView) {
      case 'explorer':
        return <FileTree files={files} activeFileId={activeFileId} onFileSelect={openFile} onCreateFile={createFile} onDeleteNode={deleteNode} onRenameNode={renameNode} />;
      case 'search':
        return <SearchPanel files={files} onFileSelect={openFile} />;
      case 'git':
        return <GitPanel files={files} />;
      case 'settings':
        return <SettingsPanel settings={editorSettings} onSettingsChange={setEditorSettings} theme={theme} onThemeChange={setTheme} />;
      default:
        return (
          <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-sidebar-border">
              {activeView === 'run' && 'Run & Debug'}
              {activeView === 'extensions' && 'Extensions'}
            </div>
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs p-4 text-center">
              {activeView === 'run' && 'Select a file and press Ctrl+Enter to run.'}
              {activeView === 'extensions' && 'Extensions marketplace coming soon.'}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDark ? 'dark' : ''}`}>
      {/* Title bar */}
      <div className="h-9 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold tracking-tight text-sidebar-foreground">CodeCloud</span>
          <div className="flex items-center gap-0 ml-4 text-[11px] text-muted-foreground">
            {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map(m => (
              <button key={m} className="px-2 py-0.5 hover:bg-accent/50 rounded-sm transition-colors">{m}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="New Project">
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {PROJECT_TEMPLATES.map(t => (
                <DropdownMenuItem key={t.framework} onClick={() => handleCreateProject(t.create(t.framework + '-app'))}>
                  📦 {t.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openFilePicker} title="Open File">
            <FileUp className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openFolderPicker} title="Open Folder">
            <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPreview(!showPreview)} title="Toggle Preview">
            <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTheme(isDark ? 'light' : 'vs-dark')} title="Toggle Theme">
            {isDark ? <Sun className="h-3.5 w-3.5 text-muted-foreground" /> : <Moon className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar
          activeView={activeView}
          onViewChange={v => { setActiveView(v); setShowSidebar(true); }}
          onSettingsClick={handleSettingsClick}
        />

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {showSidebar && (
              <>
                <ResizablePanel defaultSize={18} minSize={12} maxSize={30}>
                  {renderSidebarContent()}
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}

            <ResizablePanel defaultSize={showPreview ? 50 : 82}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={showTerminal ? 65 : 100}>
                  <div className="h-full flex flex-col">
                    <EditorTabs tabs={openTabs} activeFileId={activeFileId} onSelectTab={setActiveFileId} onCloseTab={closeTab} />
                    <div className="flex-1">
                      {activeFile ? (
                        <CodeEditor
                          value={activeContent}
                          language={LANGUAGE_CONFIG[activeLang]?.monacoLang || activeLang}
                          theme={theme}
                          onChange={val => updateFileContent(activeFileId!, val)}
                        />
                      ) : showWelcome ? (
                        <WelcomeTab onAction={handleCommandAction} />
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm bg-background">
                          <div className="text-center space-y-3">
                            <Monitor className="h-16 w-16 mx-auto opacity-10" />
                            <p className="text-base">CodeCloud</p>
                            <div className="text-xs space-y-1 text-muted-foreground/70">
                              <p>Ctrl+P — Quick Open</p>
                              <p>Ctrl+Shift+P — Command Palette</p>
                              <p>Ctrl+N — New File</p>
                              <p>Ctrl+` — Toggle Terminal</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ResizablePanel>

                {showTerminal && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={35} minSize={15}>
                      <div className="h-full flex flex-col">
                        <div className="flex bg-sidebar border-b border-sidebar-border text-[11px]">
                          <button
                            className="px-3 py-1 text-foreground border-b border-primary"
                          >
                            TERMINAL
                          </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <TerminalPanel
                            files={files}
                            onCreateProject={handleCreateProject}
                            onOpenFile={openFile}
                            onCreateFile={createFile}
                          />
                        </div>
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>

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
      </div>

      <StatusBar
        language={langName}
        lineCount={lineCount}
        cursorLine={cursorPos.line}
        cursorCol={cursorPos.col}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        mode={commandPaletteMode}
        files={files}
        onFileSelect={openFile}
        onAction={handleCommandAction}
      />
    </div>
  );
}
