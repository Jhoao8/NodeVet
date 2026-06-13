package com.nodevet.app.service;

import com.nodevet.app.dto.flow.PagoInitRequestDTO;
import com.nodevet.app.dto.flow.PagoInitResponseDTO;
import com.nodevet.app.model.flow.EstadoPago;
import com.nodevet.app.model.flow.Pago;
import com.nodevet.app.model.flow.Reserva;
// Importante: Asegúrate de tener estos repositorios creados (Reserva y EstadoPago)
// Si no los tienes, puedes crearlos rápidamente igual que hiciste con PagoRepository
import com.nodevet.app.repository.flow.EstadoPagoRepository;
import com.nodevet.app.repository.flow.ReservaRepository;
import com.nodevet.app.repository.flow.PagoRepository;
import com.nodevet.app.util.FlowSignatureUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PagoService {

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private EstadoPagoRepository estadoPagoRepository;

    // ════════ INYECCIÓN DE VARIABLES DE ENTORNO (application.properties) ════════
    @Value("${flow.base-url}")
    private String flowBaseUrl;

    @Value("${flow.api-key}")
    private String flowApiKey;

    @Value("${flow.secret-key}")
    private String flowSecretKey;

    @Value("${flow.return-url}")
    private String flowReturnUrl;

    /**
     * MÉTODO 1: Iniciar el pago. 
     * Se comunica con Flow y devuelve la URL a la que debe ir el usuario.
     */
    public PagoInitResponseDTO iniciarPago(PagoInitRequestDTO request) {
        // 1. Buscamos la reserva en la base de datos
        Reserva reserva = reservaRepository.findById(request.getIdReserva())
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // (Mock) Aquí deberías sacar el valor real cruzando con tu tabla VALOR. 
        // Para que compile y pruebes, fijaremos 15000 por defecto.
        int montoCobro = 15000; 

        // 2. Preparamos los parámetros exactos que exige Flow
        Map<String, String> params = new HashMap<>();
        params.put("apiKey", flowApiKey);
        params.put("commerceOrder", "RES-" + reserva.getIdReserva() + "-" + UUID.randomUUID().toString().substring(0, 5));
        params.put("subject", "Pago Reserva Consulta Veterinaria NodeVet");
        params.put("currency", "CLP");
        params.put("amount", String.valueOf(montoCobro));
        params.put("email", "cliente@correo.cl"); // Lo ideal es sacarlo del Usuario asociado a la Mascota/Reserva
        params.put("paymentMethod", "9"); // 9 = Webpay Plus directo. (1 = Mostrar todas las opciones de Flow)
        params.put("urlConfirmation", flowReturnUrl); // Flow nos avisará por detrás
        params.put("urlReturn", flowReturnUrl); // Flow mandará al cliente de vuelta aquí

        // 3. Firmamos los parámetros con nuestra llave secreta (HMAC-SHA256)
        String signature = FlowSignatureUtil.signParameters(params, flowSecretKey);

        // 4. Armamos la petición HTTP (Form-URL-Encoded)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            map.add(entry.getKey(), entry.getValue());
        }
        map.add("s", signature); // Añadimos la firma al final

        HttpEntity<MultiValueMap<String, String>> httpRequest = new HttpEntity<>(map, headers);
        RestTemplate restTemplate = new RestTemplate();

        try {
            // 5. Disparamos la petición a la API de Flow
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(flowBaseUrl + "/payment/create", httpRequest, Map.class);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();

            if (responseBody != null && responseBody.containsKey("url") && responseBody.containsKey("token")) {
                String urlFlow = (String) responseBody.get("url");
                String tokenFlow = (String) responseBody.get("token");

                // 6. Guardamos el registro del Pago en estado "INICIADO" (Asumimos que el ID 1 es "Iniciado")
                EstadoPago estadoIniciado = estadoPagoRepository.findById(1)
                        .orElseThrow(() -> new RuntimeException("Estado de pago no configurado en BD"));

                Pago nuevoPago = Pago.builder()
                        .reserva(reserva)
                        .monto(montoCobro)
                        .estadoPago(estadoIniciado)
                        .codTransaccion(tokenFlow)
                        .fechaPago(LocalDateTime.now())
                        .build();
                pagoRepository.save(nuevoPago);

                // 7. Le devolvemos la URL armada al Frontend para que redirija al cliente
                String urlRedireccion = urlFlow + "?token=" + tokenFlow;
                return new PagoInitResponseDTO(urlRedireccion, tokenFlow);
            } else {
                throw new RuntimeException("Respuesta inválida desde Flow");
            }

        } catch (Exception e) {
            throw new RuntimeException("Error de comunicación con Flow: " + e.getMessage());
        }
    }
}