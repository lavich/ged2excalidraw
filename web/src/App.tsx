import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { ExcalidrawView } from './ExcalidrawView';
import { parseGedcom } from '../../src/shared/gedcom-parser';
import { assignGenerations } from '../../src/shared/generations';
import { layoutTree } from '../../src/shared/layout';
import { createExcalidraw } from '../../src/shared/excalidraw';

type State =
  | { status: 'idle' }
  | { status: 'converting'; name: string }
  | { status: 'done'; elements: any[]; name: string }
  | { status: 'error'; error: string };

export default function App() {
  const [state, setState] = useState<State>({ status: 'idle' });

  const handleFile = (content: string, name: string) => {
    setState({ status: 'converting', name });

    try {
      const { individuals, families } = parseGedcom(content);
      const generations = assignGenerations(individuals, families);
      const positions = layoutTree(individuals, families, generations);
      const excalidraw = createExcalidraw(positions, individuals, families, generations);

      setState({ status: 'done', elements: excalidraw.elements, name });
    } catch (e: any) {
      setState({ status: 'error', error: e.message });
    }
  };

  if (state.status === 'done') {
    return <ExcalidrawView elements={state.elements} filename={state.name} onBack={() => setState({ status: 'idle' })} />;
  }

  return (
    <div style={{
      maxWidth: 600,
      margin: '80px auto',
      padding: '0 20px',
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        GEDCOM → Excalidraw
      </h1>
      <p style={{ color: '#868e96', marginBottom: 32 }}>
        Загрузите файл .ged для визуализации семейного дерева
      </p>

      <FileUpload onFile={handleFile} />

      {state.status === 'converting' && (
        <div style={{ marginTop: 20, textAlign: 'center', color: '#4c6ef5' }}>
          Конвертация...
        </div>
      )}

      {state.status === 'error' && (
        <div style={{
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
          background: '#fff5f5',
          color: '#e03131',
        }}>
          Ошибка: {state.error}
        </div>
      )}
    </div>
  );
}
