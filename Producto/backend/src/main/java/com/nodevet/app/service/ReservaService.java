package com.nodevet.app.service;

import com.nodevet.app.dto.reserva.ReservaRequestDTO;
import com.nodevet.app.dto.reserva.ProximaCitaHomeDTO;
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
                                .map(reserva -> new ProximaCitaHomeDTO(
                                                reserva.getIdReserva(),
                                                reserva.getBloqueHorario().getFecHrInicio().format(fechaFmt),
                                                reserva.getBloqueHorario().getFecHrInicio().format(horaFmt),
                                                reserva.getMascota().getNomMascota()))
                                .toList();
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
        String urlDePago = flowService.crearOrdenDePago(ordenComercio, valor.getMonto(), correoTutor, descripcion);

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