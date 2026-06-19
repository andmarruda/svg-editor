import { SvgEditorRoot, Canvas, SelectionOverlay } from '@svg-editor/react';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { LayersPanel } from './components/LayersPanel';
import { MenuBar } from './components/MenuBar';

export function App() {
  return (
    <SvgEditorRoot>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <MenuBar />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Toolbar />
          <div style={{ flex: 1, position: 'relative', background: '#f0f0f0' }}>
            <Canvas style={{ width: '100%', height: '100%' }} />
            <SelectionOverlay />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', width: 240, borderLeft: '1px solid #ddd', background: 'white' }}>
            <PropertiesPanel />
            <LayersPanel />
          </div>
        </div>
      </div>
    </SvgEditorRoot>
  );
}
