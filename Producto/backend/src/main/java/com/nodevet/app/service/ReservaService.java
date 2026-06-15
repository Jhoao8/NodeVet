package com.nodevet.app.service;

import com.nodevet.app.dto.reserva.ReservaRequestDTO;
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
import com.nodevet.app.repository.agenda.EstadoBloqueRepository; // <-- IMPORTACIÓN AGREGADA
import com.nodevet.app.repository.reserva.EstadoReservaRepository;
import com.nodevet.app.repository.reserva.ReservaRepository;
import com.nodevet.app.repository.pago.PagoRepository;
import com.nodevet.app.repository.pago.EstadoPagoRepository;
import com.nodevet.app.service.pago.FlowService;
import com.nodevet.app.util.DtoMapper;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final BloqueHorarioRepository bloqueHorarioRepository;
    private final ValorRepository valorRepository;
    private final EstadoReservaRepository estadoReservaRepository;
    private final EstadoBloqueRepository estadoBloqueRepository; // <-- INYECCIÓN AGREGADA
    
    // --- INYECCIONES PARA PAGOS Y FLOW ---
    private final PagoRepository pagoRepository;
    private final EstadoPagoRepository estadoPagoRepository;
    private final FlowService flowService;

    @Transactional
    public com.nodevet.app.dto.reserva.ReservaDTO crearReserva(ReservaRequestDTO request) {

        // 1. Validar que todo lo que nos envían existe
        Mascota mascota = mascotaRepository.findById(request.getIdMascota())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        Veterinario veterinario = veterinarioRepository.findById(request.getIdVet())
                .orElseThrow(() -> new RuntimeException("Veterinario no encontrado"));

        BloqueHorario bloque = bloqueHorarioRepository.findById(request.getIdBloque())
                .orElseThrow(() -> new RuntimeException("Bloque horario no encontrado"));

        
        // A. Validar que el bloque realmente siga "Disponible" (ID = 1)
        if (bloque.getEstadoBloque() == null || bloque.getEstadoBloque().getIdEstBloque() != 1) {
            throw new RuntimeException("¡Lo sentimos! Este bloque horario ya fue ocupado por otro paciente.");
        }

        // B. Crear la referencia al estado "Ocupado" (ID = 2)
        EstadoBloque estadoOcupado = new EstadoBloque();
        estadoOcupado.setIdEstBloque(2);

        // C. Cambiar el estado del bloque y guardarlo
        bloque.setEstadoBloque(estadoOcupado);
        bloqueHorarioRepository.save(bloque);
        

        Valor valor = valorRepository.findById(request.getIdValor())
                .orElseThrow(() -> new RuntimeException("Valor no encontrado"));

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
        // Armamos un identificador único para la orden (Ej: RES-15)
        String ordenComercio = "RES-" + reservaGuardada.getIdReserva();
        
        // Descripción para la pasarela de pago
        String descripcion = "Reserva Veterinaria - Mascota: " + mascota.getNomMascota();
        
        // Obtenemos el correo del tutor
        String correoTutor = mascota.getTutor().getUsuario().getCorreoUsr();

        // Llamamos a Flow para generar el link
        String urlDePago = flowService.crearOrdenDePago(ordenComercio, valor.getMonto(), correoTutor, descripcion);
        
        // --- FIN DE LÓGICA DE PAGOS ---

        // 8. Convertimos a DTO y le adjuntamos la URL de Flow
        com.nodevet.app.dto.reserva.ReservaDTO responseDTO = DtoMapper.toReservaDTO(reservaGuardada);
        responseDTO.setUrlPago(urlDePago);

        return responseDTO;
    }

    @Transactional
    public void procesarConfirmacionPago(String token) {
        
        // 1. Validar el token con Flow
        Map<String, Object> datosFlow = flowService.consultarEstadoPago(token);
        
        // Flow nos devuelve un status numérico (2 significa PAGADO)
        Integer statusFlow = (Integer) datosFlow.get("status");
        
        // Obtenemos nuestra orden (Ej: "RES-15") y extraemos el ID numérico
        String commerceOrder = (String) datosFlow.get("commerceOrder");
        Integer idReserva = Integer.parseInt(commerceOrder.replace("RES-", ""));

        // 2. Buscar el pago en la base de datos
        com.nodevet.app.model.pago.Pago pago = pagoRepository.findByReserva_IdReserva(idReserva)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado para reserva: " + idReserva));

        // 3. Procesar según la respuesta
        if (statusFlow == 2) { 
            // --- ¡EL CLIENTE PAGÓ! ---
            
            // A) Actualizamos el Pago a "PAGADO" (ID = 2)
            pago.setEstadoPago(estadoPagoRepository.findById(2).orElseThrow());
            pago.setCodTransaccion(datosFlow.get("flowOrder").toString()); // Código real de Flow
            
            // B) Actualizamos la Reserva a "CONFIRMADA" (ID = 2)
            pago.getReserva().setEstadoReserva(estadoReservaRepository.findById(2).orElseThrow());
            
        } else if (statusFlow == 3 || statusFlow == 4) {
            // --- RECHAZADO O ANULADO ---
            
            // A) Actualizamos el Pago a "RECHAZADO" (ID = 3)
            pago.setEstadoPago(estadoPagoRepository.findById(3).orElseThrow());
            
            // B) Liberamos la hora (Vuelve a ID = 1 Disponible)
            BloqueHorario bloque = pago.getReserva().getBloqueHorario();
            bloque.setEstadoBloque(estadoBloqueRepository.findById(1).orElseThrow()); 
            
            // C) Pasamos la reserva a "CANCELADA" (ID = 4)
            pago.getReserva().setEstadoReserva(estadoReservaRepository.findById(4).orElseThrow());
        }

        pagoRepository.save(pago);
    }
}