export interface Usuario {
    idUsuario?: number;
    nombreUsr: string;
    apellidoUsr: string;
    correoUsr: string;
    passUsr: string;
    telefonoUsr?: string;
    confirmPassword?: string;
    fotoUsr?: string;
    estadoUsr?: number;
    fecCreacion?: string;
}