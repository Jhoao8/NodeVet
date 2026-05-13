// src/utils/petData.ts

export type EspecieMascota = 'Perro' | 'Gato' | 'Ave' | 'Roedor' | 'Reptil' | 'Otros';

export const PET_DATA: Record<EspecieMascota, string[]> = {
  Perro: [
    'Afgano', 'Akita Inu', 'Beagle', 'Bichón Frisé', 'Border Collie', 'Boxer', 
    'Bulldog Francés', 'Bulldog Inglés', 'Caniche (Poodle)', 'Chihuahua', 
    'Cocker Spaniel', 'Dachshund (Teckel)', 'Dóberman', 'Dogo Argentino', 
    'Golden Retriever', 'Gran Danés', 'Labrador Retriever', 'Mastín', 
    'Mestizo', 'Pastor Alemán', 'Pug', 'Rottweiler', 'San Bernardo', 
    'Schnauzer', 'Shih Tzu', 'Terrier', 'Yorkshire Terrier'
  ],
  Gato: [
    'Abisinio', 'Angora Turco', 'Azul Ruso', 'Bengala', 'Británico de Pelo Corto', 
    'Burmés', 'Común Europeo', 'Esfinge (Sphynx)', 'Himalayo', 'Maine Coon', 
    'Munchkin', 'Persa', 'Ragdoll', 'Siamés', 'Somalí', 'Siberiano'
  ],
  Ave: [
    'Agapornis', 'Cacatúa', 'Canario', 'Cotorra Argentina', 'Diamante Mandarín', 
    'Guacamayo', 'Jilguero', 'Loro Amazonas', 'Ninfa (Carolina)', 'Periquito Australiano'
  ],
  Roedor: [
    'Cobaya (Cuy)', 'Chinchilla', 'Gerbo', 'Hámster Ruso', 'Hámster Sirio', 
    'Jerbo', 'Rata Doméstica', 'Ratón'
  ],
  Reptil: [
    'Camaleón', 'Dragón Barbudo (Pogona)', 'Gecko Leopardo', 'Iguana Verde', 
    'Serpiente del Maíz', 'Tortuga de Agua', 'Tortuga de Tierra'
  ],
  Otros: [
    'Hurón', 'Erizo de Tierra', 'Cerdo Miniatura (Minipig)', 'Anfibio', 'Desconocido'
  ]
};