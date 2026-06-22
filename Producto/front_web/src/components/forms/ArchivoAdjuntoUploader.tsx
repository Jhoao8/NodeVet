import { useState } from 'react';
import { subirArchivoCloudinary } from '../../services/cloudinaryService';

export interface ArchivoEntry {
  nomArchivo: string;
  archivoUrl: string;
  idTipoArchivo: number;
}

interface Props {
  archivos: ArchivoEntry[];
  onChange: (archivos: ArchivoEntry[]) => void;
}

const TIPOS = [
  { id: 1, label: 'Imagen' },
  { id: 2, label: 'PDF' },
];

export default function ArchivoAdjuntoUploader({ archivos, onChange }: Props) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  const handleArchivoElegido = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    setSubiendo(true);
    const url = await subirArchivoCloudinary(file);
    setSubiendo(false);

    if (!url) {
      setError('No se pudo subir el archivo. Intenta nuevamente.');
      return;
    }

    const esPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    onChange([
      ...archivos,
      { nomArchivo: file.name, archivoUrl: url, idTipoArchivo: esPdf ? 2 : 1 },
    ]);
  };

  const quitar = (i: number) => onChange(archivos.filter((_, idx) => idx !== i));
  const actualizar = (i: number, campo: keyof ArchivoEntry, valor: string | number) =>
    onChange(archivos.map((a, idx) => (idx === i ? { ...a, [campo]: valor } : a)));

  return (
    <div>
      {archivos.length === 0 && (
        <span className="field-hint" style={{ display: 'block', marginBottom: '10px' }}>
          Adjunta imágenes o PDFs (radiografías, exámenes, etc.). Se suben de forma segura a la nube.
        </span>
      )}

      {archivos.map((a, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 110px auto auto',
            gap: '10px',
            alignItems: 'end',
            marginBottom: '12px',
          }}
        >
          <div className="form-field">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Ej. Radiografía tórax"
              value={a.nomArchivo}
              onChange={(e) => actualizar(i, 'nomArchivo', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Tipo</label>
            <select
              value={a.idTipoArchivo}
              onChange={(e) => actualizar(i, 'idTipoArchivo', Number(e.target.value))}
            >
              {TIPOS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <a
            href={a.archivoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cancel"
            style={{ height: '42px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            Ver
          </a>
          <button
            type="button"
            className="btn-cancel"
            style={{ height: '42px' }}
            onClick={() => quitar(i)}
          >
            Quitar
          </button>
        </div>
      ))}

      {error && <div className="error-message">{error}</div>}

      {}
      <label
        className="btn-submit"
        style={{
          display: 'inline-block',
          cursor: subiendo ? 'default' : 'pointer',
          opacity: subiendo ? 0.6 : 1,
        }}
      >
        {subiendo ? 'Subiendo...' : '+ Adjuntar archivo'}
        <input
          type="file"
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          onChange={handleArchivoElegido}
          disabled={subiendo}
        />
      </label>
    </div>
  );
}
