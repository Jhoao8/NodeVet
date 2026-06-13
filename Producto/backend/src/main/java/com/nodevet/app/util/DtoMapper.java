package com.nodevet.app.util;

import com.nodevet.app.dto.AdminDTO;
import com.nodevet.app.dto.EspecialidadDTO;
import com.nodevet.app.dto.VeterinarioDTO;
import com.nodevet.app.dto.UsuarioDTO;
import com.nodevet.app.model.Admin;
import com.nodevet.app.model.Especialidad;
import com.nodevet.app.model.Usuario;
import com.nodevet.app.model.Veterinario;
import java.util.stream.Collectors;

public class DtoMapper {

    public static AdminDTO toAdminDTO(Admin admin) {
        Usuario usuario = admin.getUsuario();
        return new AdminDTO(
                admin.getId(),
                usuario.getIdUsuario(),
                usuario.getNombreUsr() + " " + usuario.getApellidoUsr(),
                usuario.getCorreoUsr(),
                usuario.getTelefonoUsr(),
                admin.getNivelAcceso()
        );
    }

    public static VeterinarioDTO toVeterinarioDTO(Veterinario veterinario) {
        Usuario usuario = veterinario.getUsuario();
        return new VeterinarioDTO(
                veterinario.getId(),
                usuario.getIdUsuario(),
                usuario.getNombreUsr() + " " + usuario.getApellidoUsr(),
                usuario.getCorreoUsr(),
                usuario.getTelefonoUsr(),
                veterinario.getRunVet(),
                veterinario.getDvVet(),
                veterinario.getEspecialidades().stream()
                        .map(DtoMapper::toEspecialidadDTO)
                        .collect(Collectors.toSet())
        );
    }

    public static EspecialidadDTO toEspecialidadDTO(Especialidad especialidad) {
        return new EspecialidadDTO(
                especialidad.getId(),
                especialidad.getNombre()
        );
    }

    public static UsuarioDTO toUsuarioDTO(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getIdUsuario(),
                usuario.getNombreUsr() + " " + usuario.getApellidoUsr(),
                usuario.getCorreoUsr(),
                usuario.getTelefonoUsr(),
                usuario.getFotoUsr(),
                usuario.getEstadoUsr()
        );
    }
}
