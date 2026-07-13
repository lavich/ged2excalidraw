import React, { useState, useEffect, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

interface Props {
  elements: any[];
  filename: string;
  onBack: () => void;
}

export function ExcalidrawView({ elements, filename, onBack }: Props) {
  const excalidrawAPIRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  const handleDownload = () => {
    const excalidrawData = {
      type: 'excalidraw',
      version: 2,
      source: 'ged2excalidraw',
      elements,
      appState: { gridSize: null, viewBackgroundColor: '#ffffff' },
      files: {},
    };
    const blob = new Blob([JSON.stringify(excalidrawData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\.\w+$/, '') + '.excalidraw';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAPI = (api: any) => {
    excalidrawAPIRef.current = api;
    if (api) {
      setReady(true);
    }
  };

  useEffect(() => {
    if (ready && excalidrawAPIRef.current) {
      const api = excalidrawAPIRef.current;
      setTimeout(() => {
        try {
          api.scrollToContent(api.getSceneElements(), {
            fitToContent: true,
            animate: false,
          });
        } catch (e) {
          console.warn('scrollToContent failed:', e);
        }
      }, 200);
    }
  }, [ready]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{
        padding: '6px 12px',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#fff',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '4px 10px',
            borderRadius: 4,
            border: '1px solid #dee2e6',
            background: '#f8f9fa',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          ← Назад
        </button>
        <span style={{ fontWeight: 600, fontSize: 14 }}>GEDCOM → Excalidraw</span>
        <span style={{ color: '#868e96', fontSize: 13 }}>
          {elements.filter(e => e.type === 'rectangle').length - 1} карточек
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleDownload}
          style={{
            padding: '4px 12px',
            borderRadius: 4,
            border: 'none',
            background: '#4c6ef5',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Скачать .excalidraw
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Excalidraw
          excalidrawAPI={handleAPI}
          initialData={{ elements, appState: { viewBackgroundColor: "#ffffff" } }}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              saveToActiveFile: false,
              toggleTheme: false,
              export: false,
            },
            tools: {
              image: false,
            },
          }}
        />
      </div>
    </div>
  );
}
