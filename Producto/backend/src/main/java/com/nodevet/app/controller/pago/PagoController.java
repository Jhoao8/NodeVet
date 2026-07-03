package com.nodevet.app.controller.pago;

import com.nodevet.app.service.ReservaService;
import com.nodevet.app.service.pago.PagoConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/pagos")
@RequiredArgsConstructor
@Tag(name = "Pasarela de Pagos", description = "Integración con servicios de pago externos (Flow). Manejo de confirmaciones y transacciones de reservas.")
public class PagoController {

    private final ReservaService reservaService;
    private final PagoConfigService pagoConfigService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/config/obligatorio")
    @Operation(summary = "Obtener estado pago obligatorio", description = "Devuelve si actualmente es obligatorio pagar para concretar una reserva.")
    public ResponseEntity<Map<String, Boolean>> obtenerPagoObligatorio() {
        return ResponseEntity.ok(Map.of("pagoObligatorio", pagoConfigService.isPagoObligatorio()));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TUTOR','VET')")
    @GetMapping("/config/obligatorio/lectura")
    @Operation(summary = "Leer estado pago obligatorio (usuarios autenticados)", description = "Permite a usuarios autenticados consultar si el pago obligatorio está activo para mostrar avisos en interfaz.")
    public ResponseEntity<Map<String, Boolean>> obtenerPagoObligatorioLectura() {
        return ResponseEntity.ok(Map.of("pagoObligatorio", pagoConfigService.isPagoObligatorio()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/config/obligatorio")
    @Operation(summary = "Cambiar estado pago obligatorio", description = "Permite activar o desactivar la obligatoriedad de pago para crear reservas.")
    public ResponseEntity<Map<String, Boolean>> actualizarPagoObligatorio(@RequestBody Map<String, Boolean> body) {
        boolean habilitado = body.getOrDefault("pagoObligatorio", true);
        boolean estadoFinal = pagoConfigService.setPagoObligatorio(habilitado);
        return ResponseEntity.ok(Map.of("pagoObligatorio", estadoFinal));
    }

    @PostMapping(value = "/webhook", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    @Operation(summary = "Webhook de confirmación (Uso Interno Flow)", description = "Endpoint consumido automáticamente y en segundo plano por los servidores de la pasarela de pagos. Recibe el token de transacción para validar y marcar la reserva como pagada en la base de datos.")
    public ResponseEntity<String> recibirConfirmacionFlow(@RequestParam("token") String token) {
        try {
            // Le pasamos el token a nuestro servicio para procesar la confirmación
            reservaService.procesarConfirmacionPago(token);
            
            // Flow exige responder "OK" para saber que no hubo errores
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            System.err.println("Error procesando Webhook de Flow: " + e.getMessage());
            // Si algo falla, devolvemos bad request
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}