package com.nodevet.app.controller;

import com.nodevet.app.dto.flow.PagoInitRequestDTO;
import com.nodevet.app.dto.flow.PagoInitResponseDTO;
import com.nodevet.app.service.PagoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pagos")
@CrossOrigin(origins = "*") // Permite al frontend en React Native se pueda conectar sin bloqueos de seguridad CORS
public class PagoController {

    @Autowired
    private PagoService pagoService;

     //ENDPOINT 1: Iniciar el proceso de pago.
     //React Native hace un POST a /api/v1/pagos/iniciar enviando el ID de la reserva.

    @PostMapping("/iniciar")
    public ResponseEntity<PagoInitResponseDTO> iniciarPago(@RequestBody PagoInitRequestDTO request) {
        try {
            // Llamamos a toda la lógica que construimos en el servicio
            PagoInitResponseDTO response = pagoService.iniciarPago(request);
            
            // Si todo sale bien, devolvemos un estado 200 (OK) con la URL de Flow
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Si algo falla (ej. la reserva no existe), devolvemos un error 400 (Bad Request)
            return ResponseEntity.badRequest().build();
        }
    }


     // ENDPOINT 2: Confirmación desde Flow (Placeholder temporal).
     // Aquí es donde Flow nos avisará cuando el cliente termine de pagar.

    @PostMapping("/confirmar")
    public ResponseEntity<String> confirmarPagoDesdeFlow(@RequestParam("token") String token) {
        // Por ahora solo imprimiremos el token en la consola para saber que Flow nos contactó.
        // En el próximo paso crearemos la lógica para verificar si el pago fue aprobado o rechazado.
        System.out.println("¡Flow nos devolvió la respuesta! El token es: " + token);
        return ResponseEntity.ok("Recibido");
    }
}