package com.nodevet.app.service;

import com.nodevet.app.dto.reserva.ReservaRequestDTO;
import com.nodevet.app.dto.reserva.ProximaCitaHomeDTO;
import com.nodevet.app.dto.reserva.ReservaVetDiaDTO;
import com.nodevet.app.dto.reserva.ResumenTutorReservasDTO;
import com.nodevet.app.model.Mascota;
import com.nodevet.app.model.Valor;
import com.nodevet.app.model.agenda.BloqueHorario;
import com.nodevet.app.model.agenda.EstadoBloque;
import com.nodevet.app.model.reserva.EstadoReserva;
import com.nodevet.app.model.reserva.Reserva;
import com.nodevet.app.model.usuario.Veterinario;
import com.nodevet.app.model.pago.Pago;
import com.nodevet.app.model.pago.EstadoPago;
import com.nodevet.app.repository.MascotaRepository;
import com.nodevet.app.repository.ValorRepository;
import com.nodevet.app.repository.VeterinarioRepository;
import com.nodevet.app.repository.agenda.BloqueHorarioRepository;
import com.nodevet.app.repository.agenda.EstadoBloqueRepository; 
import com.nodevet.app.repository.reserva.EstadoReservaRepository;
import com.nodevet.app.repository.reserva.ReservaRepository;
import com.nodevet.app.repository.pago.PagoRepository;
import com.nodevet.app.repository.pago.EstadoPagoRepository;
import com.nodevet.app.service.pago.PagoConfigService;
import com.nodevet.app.service.pago.FlowService;
import com.nodevet.app.util.DtoMapper;
import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.List;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final BloqueHorarioRepository bloqueHorarioRepository;
    private final ValorRepository valorRepository;
    private final EstadoReservaRepository estadoReservaRepository;
    private final EstadoBloqueRepository estadoBloqueRepository;

    // --- INYECCIONES PARA PAGOS Y FLOW ---
    private final PagoRepository pagoRepository;
    private final EstadoPagoRepository estadoPagoRepository;
    private final FlowService flowService;
        private final PagoConfigService pagoConfigService;

        @Transactional(readOnly = true)
        public ResumenTutorReservasDTO obtenerResumenTutor(Integer idUsuario, String nombreCompleto) {
                long total = reservaRepository.countByMascota_Tutor_Usuario_IdUsuario(idUsuario);
                long asistidas = reservaRepository.countAsistidasByTutorUsuarioId(idUsuario);
                long ausentadas = reservaRepository.countAusentadasByTutorUsuarioId(idUsuario);

                return new ResumenTutorReservasDTO(
                                idUsuario,
                                nombreCompleto,
                                total,
                                asistidas,
                                ausentadas
                );
        }

        @Transactional(readOnly = true)
        public List<ProximaCitaHomeDTO> obtenerProximasCitasTutor(String correoTutor) {
                DateTimeFormatter fechaFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                DateTimeFormatter horaFmt = DateTimeFormatter.ofPattern("HH:mm");

                return reservaRepository.findProximasCitasByTutorCorreo(correoTutor)
                                .stream()
                                .limit(2)
                                                                .map(reserva -> {
                                                                                LocalDateTime inicio = reserva.getBloqueHorario().getFecHrInicio();
                                                                                return new ProximaCitaHomeDTO(
                                                                                                                reserva.getIdReserva(),
                                                                                                                inicio.format(fechaFmt),
                                                                                                                inicio.format(horaFmt),
                                                                                                                reserva.getMascota().getNomMascota(),
                                                                                                                inicio.toString(),
                                                                                                                esCancelablePorTutor(reserva));
                                                                })
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<ReservaVetDiaDTO> obtenerAgendaDiariaVeterinario(String correoVet, String fecha) {
                LocalDate fechaSeleccionada = LocalDate.parse(fecha);
                LocalDateTime inicioDia = fechaSeleccionada.atStartOfDay();
                LocalDateTime finDia = fechaSeleccionada.atTime(LocalTime.MAX);
                DateTimeFormatter horaFmt = DateTimeFormatter.ofPattern("HH:mm");

                return reservaRepository.findAgendaDiariaByVeterinarioCorreo(correoVet, inicioDia, finDia)
                                .stream()
                                .map(reserva -> new ReservaVetDiaDTO(
                                                reserva.getIdReserva(),
                                                reserva.getBloqueHorario().getFecHrInicio().format(horaFmt),
                                                reserva.getMascota().getTutor().getUsuario().getNombreUsr() + " " + reserva.getMascota().getTutor().getUsuario().getApellidoUsr(),
                                                reserva.getMascota().getNomMascota()))
                                .toList();
        }

        @Transactional
        public void cancelarReservaTutor(Integer idReserva, String correoTutor) {
                Reserva reserva = reservaRepository.findByIdAndTutorCorreo(idReserva, correoTutor)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada para el tutor autenticado."));

                if (!esEstadoCancelable(reserva)) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se pueden cancelar reservas en estado pendiente o confirmada.");
                }

                if (pagoRepository.findByReserva_IdReserva(idReserva).isPresent()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede cancelar esta cita porque fue creada con pago obligatorio.");
                }

                LocalDateTime inicioCita = reserva.getBloqueHorario().getFecHrInicio();
                LocalDateTime limiteCancelacion = inicioCita.minusHours(24);
                if (LocalDateTime.now().isAfter(limiteCancelacion)) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede cancelar la cita con menos de 24 horas de anticipación.");
                }

                EstadoReserva estadoCancelada = estadoReservaRepository.findById(4)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Estado CANCELADA no configurado."));
                reserva.setEstadoReserva(estadoCancelada);
                reservaRepository.save(reserva);

                BloqueHorario bloque = reserva.getBloqueHorario();
                bloque.setEstadoBloque(estadoBloqueRepository.findById(1)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Estado DISPONIBLE de bloque no configurado.")));
                bloqueHorarioRepository.save(bloque);
        }

        private boolean esCancelablePorTutor(Reserva reserva) {
                boolean estadoCancelable = esEstadoCancelable(reserva);
                boolean sinPagoObligatorio = pagoRepository.findByReserva_IdReserva(reserva.getIdReserva()).isEmpty();
                LocalDateTime inicioCita = reserva.getBloqueHorario().getFecHrInicio();
                boolean dentroVentanaPermitida = !LocalDateTime.now().isAfter(inicioCita.minusHours(24));

                return estadoCancelable && sinPagoObligatorio && dentroVentanaPermitida;
        }

        private boolean esEstadoCancelable(Reserva reserva) {
                String estado = reserva.getEstadoReserva().getNomEstReserva();
                if (estado == null) {
                        return false;
                }
                String estadoNormalizado = estado.toUpperCase();
                return "PENDIENTE".equals(estadoNormalizado) || "CONFIRMADA".equals(estadoNormalizado);
        }

    @Transactional
    public com.nodevet.app.dto.reserva.ReservaDTO crearReserva(ReservaRequestDTO request) {

        // 1. Validar que todo lo que nos envían existe
        Mascota mascota = mascotaRepository.findById(request.getIdMascota())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mascota no encontrada"));

        Veterinario veterinario = veterinarioRepository.findById(request.getIdVet())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veterinario no encontrado"));

        BloqueHorario bloque = bloqueHorarioRepository.findById(request.getIdBloque())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bloque horario no encontrado"));

        // A. Validar que el bloque realmente siga "Disponible" (ID = 1) -> PRUEBA TC-M2-B03 (409 Conflict)
        if (bloque.getEstadoBloque() == null || bloque.getEstadoBloque().getIdEstBloque() != 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "¡Lo sentimos! Este bloque horario ya fue ocupado por otro paciente.");
        }

        // B. Crear la referencia al estado "Ocupado" (ID = 2)
        EstadoBloque estadoOcupado = new EstadoBloque();
        estadoOcupado.setIdEstBloque(2);

        // C. Cambiar el estado del bloque y guardarlo
        bloque.setEstadoBloque(estadoOcupado);
        bloqueHorarioRepository.save(bloque);

        Valor valor = valorRepository.findById(request.getIdValor())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Valor no encontrado"));

        // 2. Asignar el estado inicial (ID 1 = Pendiente)
        EstadoReserva estado = estadoReservaRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Estado de reserva por defecto no configurado"));

        // 3. Armar la reserva
        Reserva nuevaReserva = Reserva.builder()
                .mascota(mascota)
                .veterinario(veterinario)
                .bloqueHorario(bloque)
                .valor(valor)
                .estadoReserva(estado)
                .build();

        // 4. Guardar la reserva
        Reserva reservaGuardada = reservaRepository.save(nuevaReserva);

        boolean pagoObligatorio = pagoConfigService.isPagoObligatorio();
        com.nodevet.app.dto.reserva.ReservaDTO responseDTO = DtoMapper.toReservaDTO(reservaGuardada);

        if (!pagoObligatorio) {
            EstadoReserva confirmadaSinPago = estadoReservaRepository.findById(2)
                    .orElseThrow(() -> new RuntimeException("Estado de reserva CONFIRMADA no configurado"));

            reservaGuardada.setEstadoReserva(confirmadaSinPago);
            reservaRepository.save(reservaGuardada);

            responseDTO.setIdEstReserva(confirmadaSinPago.getIdEstReserva());
            responseDTO.setUrlPago(null);
            responseDTO.setPagoObligatorio(false);
            return responseDTO;
        }

        // --- INICIO DE LÓGICA DE PAGOS ---

        // 5. Buscar el estado "Pendiente" para el pago
        EstadoPago estadoPagoPendiente = estadoPagoRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Estado de pago Pendiente no configurado"));

        // 6. Crear el registro en la tabla PAGO "congelando" el monto
        Pago nuevoPago = Pago.builder()
                .reserva(reservaGuardada)
                .monto(valor.getMonto()) 
                .estadoPago(estadoPagoPendiente)
                .codTransaccion("ESPERANDO_A_FLOW") 
                .build();

        pagoRepository.save(nuevoPago);

        // 7. Conexión con Flow
        String ordenComercio = "RES-" + reservaGuardada.getIdReserva() + "-" + System.currentTimeMillis();
        String descripcion = "Reserva Veterinaria - Mascota: " + mascota.getNomMascota();
        String correoTutor = mascota.getTutor().getUsuario().getCorreoUsr();
        String urlDePago = flowService.crearOrdenDePago(ordenComercio, valor.getMonto(), correoTutor, descripcion, request.getReturnUrl());
        // --- FIN DE LÓGICA DE PAGOS ---

                // 8. Convertimos a DTO y le adjuntamos la URL de Flow
        responseDTO.setUrlPago(urlDePago);
                responseDTO.setPagoObligatorio(true);

        return responseDTO;
    }

    @Transactional
    public void procesarConfirmacionPago(String token) {

        // 1. Validar el token con Flow
        Map<String, Object> datosFlow = flowService.consultarEstadoPago(token);
        Integer statusFlow = (Integer) datosFlow.get("status");
        String commerceOrder = (String) datosFlow.get("commerceOrder");
        Integer idReserva = Integer.parseInt(commerceOrder.split("-")[1]);

        // 2. Buscar el pago en la BD
        com.nodevet.app.model.pago.Pago pago = pagoRepository.findByReserva_IdReserva(idReserva)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado para reserva: " + idReserva));

        BloqueHorario bloque = pago.getReserva().getBloqueHorario();

        // 3. Procesar según la respuesta
        if (statusFlow == 2) { 
            // --- ¡EL CLIENTE PAGÓ! ---
            pago.setEstadoPago(estadoPagoRepository.findById(2).orElseThrow());
            pago.setCodTransaccion(datosFlow.get("flowOrder").toString()); 

            // PRIMERO guardamos el pago para que Hibernate vacíe su memoria
            pagoRepository.save(pago);

            // SEGUNDO lanzamos el ataque directo a MySQL (nadie lo va a sobreescribir)
            reservaRepository.actualizarEstadoNativo(idReserva, 2);

        } else if (statusFlow == 3 || statusFlow == 4) {
            // --- RECHAZADO O ANULADO ---
            pago.setEstadoPago(estadoPagoRepository.findById(3).orElseThrow());
            pagoRepository.save(pago); // Guardamos el pago primero
            
            reservaRepository.actualizarEstadoNativo(idReserva, 4); // Ataque nativo
            
            bloque.setEstadoBloque(estadoBloqueRepository.findById(1).orElseThrow()); 
            bloqueHorarioRepository.save(bloque); 
        }
    }

}