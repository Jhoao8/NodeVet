package com.nodevet.app.service;

import com.nodevet.app.dto.consulta.ArchivoAdjuntoRequestDTO;
import com.nodevet.app.dto.consulta.ConsultaRequestDTO;
import com.nodevet.app.dto.consulta.ConsultaResponseDTO;
import com.nodevet.app.model.consulta.ArchivoAdjunto;
import com.nodevet.app.model.consulta.Consulta;
import com.nodevet.app.model.consulta.TipoArchivo;
import com.nodevet.app.model.reserva.Reserva;
import com.nodevet.app.model.Valor;
import com.nodevet.app.model.servicio.*;
import com.nodevet.app.model.servicio.examen.Examen;
import com.nodevet.app.repository.*;
import com.nodevet.app.repository.consulta.ExamServRepository;
import com.nodevet.app.repository.consulta.ServicioRepository;
import com.nodevet.app.repository.consulta.TipoArchivoRepository;
import com.nodevet.app.repository.consulta.VacServRepository;
import com.nodevet.app.repository.reserva.ReservaRepository;

import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConsultaService {

private final ConsultaRepository consultaRepository;
private final ReservaRepository reservaRepository;
private final ValorRepository valorRepository;

// Repositorios para procesar los servicios médicos
private final ServicioRepository servicioRepository;
private final VacunaRepository vacunaRepository;
private final ExamenRepository examenRepository;
private final VacServRepository vacServRepository;
private final ExamServRepository examServRepository;

private final ArchivoAdjuntoRepository archivoAdjuntoRepository;
private final TipoArchivoRepository tipoArchivoRepository;

@Transactional
public Consulta crearConsulta(ConsultaRequestDTO dto) {
        
        // 1. Validaciones
        if (consultaRepository.existsByReserva_IdReserva(dto.getIdReserva())) {
        throw new IllegalStateException("Error: Ya existe una ficha clínica asociada a la reserva ID " + dto.getIdReserva());
        }

        Reserva reserva = reservaRepository.findById(dto.getIdReserva())
                .orElseThrow(() -> new IllegalArgumentException("La reserva no existe."));

        if (reserva.getEstadoReserva() == null || reserva.getEstadoReserva().getIdEstReserva() != 2) { 
        throw new IllegalStateException("Error: No se puede crear una atención clínica para una reserva que no está pagada o confirmada.");
        }

        Valor valor = valorRepository.findById(dto.getIdValor())
                .orElseThrow(() -> new IllegalArgumentException("El valor asociado no existe."));

        // 2. Crear y guardar la Consulta principal
        Consulta nuevaConsulta = Consulta.builder()
                .reserva(reserva)
                .valor(valor)
                .notas(dto.getNotas())
                .diagnostico(dto.getDiagnostico())
                .indicacionReceta(dto.getIndicacionReceta())
                .build();

        Consulta consultaGuardada = consultaRepository.save(nuevaConsulta);

        // 3. Procesar las Vacunas aplicadas
        if (dto.getVacunasIds() != null && !dto.getVacunasIds().isEmpty()) {
        for (Integer idVacuna : dto.getVacunasIds()) {
                Vacuna vacuna = vacunaRepository.findById(idVacuna)
                        .orElseThrow(() -> new IllegalArgumentException("Vacuna no encontrada con ID: " + idVacuna));
                
                // Generamos un registro maestro de servicio
                Servicio nuevoServicio = servicioRepository.save(new Servicio());

                // Creamos el puente entre Vacuna y Servicio
                VacServ vacServ = VacServ.builder()
                        .id(new VacServId(vacuna.getIdVac(), nuevoServicio.getIdServ()))
                        .vacuna(vacuna)
                        .servicio(nuevoServicio)
                        .build();
                
                vacServRepository.save(vacServ);
        }
        }

        // 4. Procesar los Exámenes realizados
        if (dto.getExamenesIds() != null && !dto.getExamenesIds().isEmpty()) {
        for (Integer idExamen : dto.getExamenesIds()) {
                Examen examen = examenRepository.findById(idExamen)
                        .orElseThrow(() -> new IllegalArgumentException("Examen no encontrado con ID: " + idExamen));
                
                // Generamos un registro maestro de servicio
                Servicio nuevoServicio = servicioRepository.save(new Servicio());

                // Creamos el puente entre Examen y Servicio
                ExamServ examServ = ExamServ.builder()
                        .id(new ExamServId(examen.getIdExamen(), nuevoServicio.getIdServ()))
                        .examen(examen)
                        .servicio(nuevoServicio)
                        .build();
                        
                examServRepository.save(examServ);
        }
        }

        return consultaGuardada;
}

@Transactional
public void agregarArchivo(Integer idConsulta, ArchivoAdjuntoRequestDTO dto) {
        // Buscamos que la ficha clínica realmente exista
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new IllegalArgumentException("La consulta médica no existe."));
        
        // Buscamos que el tipo de archivo sea válido
        TipoArchivo tipo = tipoArchivoRepository.findById(dto.getIdTipoArchivo())
                .orElseThrow(() -> new IllegalArgumentException("El tipo de archivo no es válido."));

        // Armamos la entidad y la guardamos
        ArchivoAdjunto nuevoArchivo = ArchivoAdjunto.builder()
                .nomArchivo(dto.getNomArchivo())
                .archivoUrl(dto.getArchivoUrl())
                .consulta(consulta)
                .tipoArchivo(tipo)
                .build();

        archivoAdjuntoRepository.save(nuevoArchivo);
}

@Transactional(readOnly = true)
public ConsultaResponseDTO obtenerConsultaPorReserva(Integer idReserva) {
        
        // 1. Buscamos la ficha clínica por el ID de la reserva
        Consulta consulta = consultaRepository.findByReserva_IdReserva(idReserva)
                .orElseThrow(() -> new IllegalArgumentException("No hay una ficha clínica asociada a esta reserva."));

        // 2. Buscamos todos los archivos adjuntos de esa consulta
        List<ArchivoAdjunto> archivos = archivoAdjuntoRepository.findByConsulta_IdConsulta(consulta.getIdConsulta());

        // 3. Extraemos solo las URLs usando Stream
        List<String> urls = archivos.stream()
                .map(ArchivoAdjunto::getArchivoUrl)
                .toList();

        // 4. Armamos y retornamos el sobre final
        return ConsultaResponseDTO.builder()
                .idConsulta(consulta.getIdConsulta())
                .idReserva(consulta.getReserva().getIdReserva())
                .diagnostico(consulta.getDiagnostico())
                .notas(consulta.getNotas())
                .indicacionReceta(consulta.getIndicacionReceta())
                .archivosUrls(urls)
                .build();
}

@Transactional(readOnly = true)
public List<ConsultaResponseDTO> obtenerHistorialPorMascota(Integer idMascota) {
List<Consulta> consultas = consultaRepository.findByReserva_Mascota_IdMascota(idMascota);

DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

return consultas.stream().map(consulta -> {
        // Navegación segura hacia el profesional (Veterinario -> Usuario)
        String nombreProfesional = "No asignado";
        if (consulta.getReserva().getVeterinario() != null && consulta.getReserva().getVeterinario().getUsuario() != null) {
        nombreProfesional = "Dr(a). " + consulta.getReserva().getVeterinario().getUsuario().getNombreUsr() + " " +
                                consulta.getReserva().getVeterinario().getUsuario().getApellidoUsr();
        }

        // Navegación segura hacia la fecha del bloque de atención
        String fechaAtencion = "Sin fecha";
        if (consulta.getReserva().getBloqueHorario() != null && consulta.getReserva().getBloqueHorario().getFecHrInicio() != null) {
        fechaAtencion = consulta.getReserva().getBloqueHorario().getFecHrInicio().format(formatter);
        }

        // Obtención de URLs de archivos adjuntos asociados a esta consulta específica
        List<String> urls = archivoAdjuntoRepository.findByConsulta_IdConsulta(consulta.getIdConsulta())
                .stream()
                .map(ArchivoAdjunto::getArchivoUrl)
                .collect(Collectors.toList());

        return ConsultaResponseDTO.builder()
                .idConsulta(consulta.getIdConsulta())
                .idReserva(consulta.getReserva().getIdReserva())
                .fecha(fechaAtencion)
                .profesional(nombreProfesional)
                .diagnostico(consulta.getDiagnostico())
                .notas(consulta.getNotas())
                .indicacionReceta(consulta.getIndicacionReceta())
                .archivosUrls(urls)
                .build();
}).collect(Collectors.toList());
}
}