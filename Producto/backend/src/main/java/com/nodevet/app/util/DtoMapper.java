package com.nodevet.app.util;

import com.nodevet.app.dto.EspecialidadDTO;
import com.nodevet.app.dto.agenda.BloqueHorarioDTO;
import com.nodevet.app.dto.agenda.JornadaDTO;
import com.nodevet.app.dto.reserva.ReservaDTO;
import com.nodevet.app.dto.usuario.AdminDTO;
import com.nodevet.app.dto.usuario.UsuarioDTO;
import com.nodevet.app.dto.usuario.VeterinarioDTO;
import com.nodevet.app.model.Especialidad;
import com.nodevet.app.model.agenda.BloqueHorario;
import com.nodevet.app.model.usuario.Admin;
import com.nodevet.app.model.usuario.Usuario;
import com.nodevet.app.model.usuario.Veterinario;

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

    public static BloqueHorarioDTO toBloqueHorarioDTO(BloqueHorario bloque) {
        return new BloqueHorarioDTO(
                bloque.getIdBloque(),
                bloque.getVeterinario().getId(), 
                bloque.getFecHrInicio(),
                bloque.getFecHrFin()
        );
    }

    public static JornadaDTO toJornadaDTO(com.nodevet.app.model.agenda.Jornada jornada) {
        return new JornadaDTO(
                jornada.getIdJornada(),
                jornada.getVeterinario().getId(),
                jornada.getDiaSemana(),
                jornada.getHoraInicio(),
                jornada.getHoraFin(),
                jornada.getEstJornada()
        );
    }

    public static ReservaDTO toReservaDTO(com.nodevet.app.model.reserva.Reserva reserva) {
        return new ReservaDTO(
                reserva.getIdReserva(),
                reserva.getMascota().getIdMascota(), // O getId() según tu modelo
                reserva.getVeterinario().getId(), // O getId() según tu modelo
                reserva.getBloqueHorario().getIdBloque(),
                reserva.getValor().getIdValor(),
                reserva.getEstadoReserva().getIdEstReserva(),
                reserva.getFecCreacion(),
                null
        );
    }
}