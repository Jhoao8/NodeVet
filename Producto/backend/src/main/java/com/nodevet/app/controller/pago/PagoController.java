package com.nodevet.app.controller.pago;

import com.nodevet.app.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final ReservaService reservaService;

    // Este es el endpoint que Flow visitará en secreto
    @PostMapping("/webhook")
    public ResponseEntity<String> recibirConfirmacionFlow(@RequestParam("token") String token) {
        try {
            // Le pasamos el token a nuestro servicio para que haga su magia
            reservaService.procesarConfirmacionPago(token);
            
            // Flow exige que le respondamos un "OK" rápido para saber que no hubo errores
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            System.err.println("Error procesando Webhook de Flow: " + e.getMessage());
            // Si algo explota, le devolvemos un error
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}