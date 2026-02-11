import { Settings, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  bracketPairColorization: boolean;
  fontFamily: string;
  cursorStyle: string;
  renderWhitespace: string;
  smoothScrolling: boolean;
  formatOnPaste: boolean;
  formatOnSave: boolean;
}

export const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  autoSave: true,
  bracketPairColorization: true,
  fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
  cursorStyle: 'line',
  renderWhitespace: 'selection',
  smoothScrolling: true,
  formatOnPaste: false,
  formatOnSave: true,
};

interface SettingsPanelProps {
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
  theme: 'vs-dark' | 'light';
  onThemeChange: (theme: 'vs-dark' | 'light') => void;
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
        <ChevronRight className="h-3 w-3" />
        {title}
      </h3>
      <div className="space-y-3 pl-2">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0">
        <div className="text-xs text-foreground">{label}</div>
        {description && <div className="text-[10px] text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPanel({ settings, onSettingsChange, theme, onThemeChange }: SettingsPanelProps) {
  const update = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-sidebar-border flex items-center gap-1.5">
        <Settings className="h-3.5 w-3.5" />
        Settings
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3">
          <SettingSection title="Appearance">
            <SettingRow label="Color Theme" description="Specifies the color theme">
              <Select value={theme} onValueChange={v => onThemeChange(v as 'vs-dark' | 'light')}>
                <SelectTrigger className="w-32 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vs-dark">Dark+</SelectItem>
                  <SelectItem value="light">Light+</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </SettingSection>

          <SettingSection title="Editor">
            <SettingRow label="Font Size" description={`${settings.fontSize}px`}>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([v]) => update('fontSize', v)}
                min={10}
                max={24}
                step={1}
                className="w-28"
              />
            </SettingRow>

            <SettingRow label="Font Family">
              <Select value={settings.fontFamily} onValueChange={v => update('fontFamily', v)}>
                <SelectTrigger className="w-36 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="'Cascadia Code', 'Fira Code', 'Consolas', monospace">Cascadia Code</SelectItem>
                  <SelectItem value="'Fira Code', monospace">Fira Code</SelectItem>
                  <SelectItem value="'Consolas', monospace">Consolas</SelectItem>
                  <SelectItem value="'JetBrains Mono', monospace">JetBrains Mono</SelectItem>
                  <SelectItem value="monospace">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="Tab Size">
              <Select value={String(settings.tabSize)} onValueChange={v => update('tabSize', Number(v))}>
                <SelectTrigger className="w-20 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="Cursor Style">
              <Select value={settings.cursorStyle} onValueChange={v => update('cursorStyle', v)}>
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="underline">Underline</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="Word Wrap" description="Controls how lines should wrap">
              <Switch checked={settings.wordWrap} onCheckedChange={v => update('wordWrap', v)} />
            </SettingRow>

            <SettingRow label="Minimap" description="Show code minimap">
              <Switch checked={settings.minimap} onCheckedChange={v => update('minimap', v)} />
            </SettingRow>

            <SettingRow label="Line Numbers" description="Show line numbers">
              <Switch checked={settings.lineNumbers} onCheckedChange={v => update('lineNumbers', v)} />
            </SettingRow>

            <SettingRow label="Bracket Pair Colorization">
              <Switch checked={settings.bracketPairColorization} onCheckedChange={v => update('bracketPairColorization', v)} />
            </SettingRow>

            <SettingRow label="Render Whitespace">
              <Select value={settings.renderWhitespace} onValueChange={v => update('renderWhitespace', v)}>
                <SelectTrigger className="w-28 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="selection">Selection</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="boundary">Boundary</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="Smooth Scrolling">
              <Switch checked={settings.smoothScrolling} onCheckedChange={v => update('smoothScrolling', v)} />
            </SettingRow>
          </SettingSection>

          <SettingSection title="Files">
            <SettingRow label="Auto Save" description="Save files automatically after delay">
              <Switch checked={settings.autoSave} onCheckedChange={v => update('autoSave', v)} />
            </SettingRow>

            <SettingRow label="Format On Save" description="Format file when saving">
              <Switch checked={settings.formatOnSave} onCheckedChange={v => update('formatOnSave', v)} />
            </SettingRow>

            <SettingRow label="Format On Paste" description="Format pasted content">
              <Switch checked={settings.formatOnPaste} onCheckedChange={v => update('formatOnPaste', v)} />
            </SettingRow>
          </SettingSection>
        </div>
      </ScrollArea>
    </div>
  );
}
