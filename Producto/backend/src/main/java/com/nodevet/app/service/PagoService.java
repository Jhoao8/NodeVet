package com.nodevet.app.service;

import com.nodevet.app.dto.flow.PagoInitRequestDTO;
import com.nodevet.app.dto.flow.PagoInitResponseDTO;
import com.nodevet.app.model.pago.EstadoPago;
import com.nodevet.app.model.pago.Pago;
import com.nodevet.app.model.reserva.Reserva;
// Importante: Asegúrate de tener estos repositorios creados (Reserva y EstadoPago)
// Si no los tienes, puedes crearlos rápidamente igual que hiciste con PagoRepository
import com.nodevet.app.repository.pago.EstadoPagoRepository;
import com.nodevet.app.repository.reserva.ReservaRepository;
import com.nodevet.app.repository.pago.PagoRepository;
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

    @Value("${flow.confirm-url}")
    private String flowConfirmUrl;

    // @Value("${flow.return-url}")
    // private String flowReturnUrl;

    /**
     * MÉTODO 1: Iniciar el pago. 
     * Se comunica con Flow y devuelve la URL a la que debe ir el usuario.
     */
    public PagoInitResponseDTO iniciarPago(PagoInitRequestDTO request) {
        // 1. Buscamos la reserva
        Reserva reserva = reservaRepository.findById(request.getIdReserva())
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        int montoCobro = 15000; 

        // 2. Preparamos los parámetros
        Map<String, String> params = new HashMap<>();
        params.put("apiKey", flowApiKey);
        params.put("commerceOrder", "RES-" + reserva.getIdReserva() + "-" + UUID.randomUUID().toString().substring(0, 5));
        params.put("subject", "Pago Reserva Consulta Veterinaria NodeVet");
        params.put("currency", "CLP");
        params.put("amount", String.valueOf(montoCobro));
        params.put("email", "cliente@correo.cl"); 
        params.put("paymentMethod", "9");

        // Usamos tu variable de entorno fija (Ngrok/AWS) para la confirmación
        params.put("urlConfirmation", flowConfirmUrl); 
        
        // Usamos la URL que viene desde el Frontend (la que generamos con Linking.createURL)
        params.put("urlReturn", request.getReturnUrl()); 
        // --------------------

        // 3. Firmamos y seguimos con el proceso igual que antes...
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