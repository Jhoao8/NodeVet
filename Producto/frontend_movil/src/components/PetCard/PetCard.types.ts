export interface PetCardProps {
    id: number;
    nombreMasc: string;
    fotoUrl?: string;
    sexo: number;
    especie: string;
    onPress: () => void;
}