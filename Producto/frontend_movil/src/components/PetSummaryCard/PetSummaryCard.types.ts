export interface PetSummaryCardProps {
    id: number;
    nombreMasc: string; // <--- CÁMBIALO AQUÍ
    fotoUrl?: string;
    sexo: number;
    ultChequeo?: string;
    onPress?: () => void;
    isLast?: boolean;
}