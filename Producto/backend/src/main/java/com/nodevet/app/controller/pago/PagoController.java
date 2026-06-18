package com.nodevet.app.controller.pago;

import com.nodevet.app.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pagos")
@RequiredArgsConstructor
@Tag(name = "Pasarela de Pagos", description = "Integración con servicios de pago externos (Flow). Manejo de confirmaciones y transacciones de reservas.")
public class PagoController {

    private final ReservaService reservaService;

    @PostMapping("/webhook")
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