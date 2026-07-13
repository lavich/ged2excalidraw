import React, { useCallback, useState } from 'react';

interface Props {
  onFile: (content: string, name: string) => void;
}

export function FileUpload({ onFile }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      onFile(reader.result as string, file.name);
    };
    reader.readAsText(file);
  }, [onFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${dragging ? '#4c6ef5' : '#dee2e6'}`,
        borderRadius: 12,
        padding: '60px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging ? '#edf2ff' : '#f8f9fa',
        transition: 'all 0.2s',
      }}
      onClick={() => document.getElementById('ged-input')?.click()}
    >
      <input
        id="ged-input"
        type="file"
        accept=".ged,.gedcom"
        onChange={onChange}
        style={{ display: 'none' }}
      />
      <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
        Загрузите GEDCOM файл
      </div>
      <div style={{ color: '#868e96' }}>
        Перетащите .ged файл сюда или нажмите для выбора
      </div>
    </div>
  );
}
