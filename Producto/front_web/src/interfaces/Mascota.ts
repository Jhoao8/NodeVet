export interface Mascota {
  idMascota?: number;
  nomMascota: string;
  especie: string;
  raza?: string;
  sexo: number; // 1 = Macho, 0 = Hembra
  fecNac?: string;
  estFecNac?: number;
  peso?: number;
  imagenMascota?: string;
  estadoMasc?: number;
}

export interface MascotaRequestDTO {
  nomMascota: string;
  especie: string;
  raza?: string;
  sexo: number;
  fecNac?: string;
  estFecNac?: number;
  peso?: number;
  imagenMascota?: string;
}
