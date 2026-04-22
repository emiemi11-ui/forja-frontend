import { useState, useRef } from 'react';

export default function ImageUploadButton({ onImageSelect, currentImage, onRemove, label = 'Adaugă imagine', compact = false }) {
  const [preview, setPreview] = useState(currentImage || null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      setPreview(url);
      onImageSelect?.(url);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--c-border)';
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect?.(null);
    onRemove?.();
  };

  if (preview) {
    return (
      <div style={{ position: 'relative', display: 'inline-block', marginTop: 6 }}>
        <img src={preview} alt="" style={{
          width: compact ? 80 : '100%', height: compact ? 60 : 120,
          objectFit: 'cover', borderRadius: 10,
          border: '2px solid var(--c-lime)',
        }} />
        <button onClick={handleRemove} style={{
          position: 'absolute', top: -6, right: -6,
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--c-coral)', color: '#fff',
          border: 'none', fontSize: 10, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}>✕</button>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--c-lime)'; }}
      onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--c-border)'; }}
      onDrop={handleDrop}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: compact ? '6px 12px' : '10px 16px',
        borderRadius: 10,
        border: '1.5px dashed var(--c-border)',
        background: 'var(--c-bg)',
        cursor: 'pointer',
        fontSize: compact ? 11 : 13,
        color: 'var(--c-ink3)',
        fontFamily: 'var(--fb)',
        fontWeight: 600,
        transition: 'all 0.2s',
        marginTop: 6,
      }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
      <span style={{ fontSize: compact ? 14 : 18 }}>📷</span>
      {label}
    </label>
  );
}
