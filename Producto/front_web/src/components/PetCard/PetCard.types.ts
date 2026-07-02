export interface Mascota {
  idMascota?: number;
  nomMascota: string;
  especie: string;
  raza?: string;
  sexo: number;
  fecNac?: string;
  fecNacEst?: number;
  peso?: number;
  imagenMascota?: string;
  estadoMasc?: number;
}

export interface PetCardProps {
  mascota: Mascota;
  onEdit?: (mascota: Mascota) => void;
  onDelete?: (id: number) => void;
  onClick?: () => void;
}

