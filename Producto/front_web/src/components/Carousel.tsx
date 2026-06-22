import { useEffect, useState } from 'react';

const modulos = import.meta.glob(
  '../assets/images/carousel/*.{png,jpg,jpeg,webp,gif,svg}',
  { eager: true, import: 'default' },
) as Record<string, string>;

const imagenes: string[] = Object.keys(modulos)
  .sort()
  .map((ruta) => modulos[ruta]);

const INTERVALO_MS = 4000;

export default function Carousel() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (imagenes.length <= 1) return;
    const id = setInterval(() => {
      setIndice((i) => (i + 1) % imagenes.length);
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, []);

  const hayImagenes = imagenes.length > 0;

  return (
    <div className="banner-carousel">
      <div
        className="carousel-slide"
        style={
          hayImagenes
            ? {
                backgroundImage: `url(${imagenes[indice]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {!hayImagenes && (
          <div
            style={{
              display: 'flex',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '20px',
              color: 'var(--color-dark-green)',
              fontWeight: 600,
            }}
          >
            Agrega imágenes en <code>src/assets/images/carousel/</code> y aparecerán aquí.
          </div>
        )}
      </div>

      {imagenes.length > 1 && (
        <div className="carousel-controls">
          {imagenes.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === indice ? 'active' : ''}`}
              onClick={() => setIndice(i)}
              role="button"
              aria-label={`Ir a la imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
