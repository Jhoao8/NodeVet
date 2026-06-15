package com.nodevet.app.service.pago;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class FlowService {

    @Value("${flow.base-url}")
    private String flowApiUrl;

    @Value("${flow.api-key}")
    private String flowApiKey;

    @Value("${flow.secret-key}")
    private String flowSecretKey;

    @Value("${flow.return-url}")
    private String flowUrlReturn;

    @Value("${flow.confirm-url}")
    private String flowUrlConfirm;

    private final RestTemplate restTemplate;

    /**
     * Genera la orden de pago en Flow y retorna la URL donde el usuario debe pagar.
     */
    @SuppressWarnings("rawtypes")
    public String crearOrdenDePago(String ordenComercio, Integer monto, String correoTutor, String descripcion) {
        
        // 1. Usamos un TreeMap porque ordena automáticamente las llaves alfabéticamente (Requisito de Flow)
        Map<String, String> parametros = new TreeMap<>();
        parametros.put("apiKey", flowApiKey);
        parametros.put("commerceOrder", ordenComercio);
        parametros.put("subject", descripcion);
        parametros.put("currency", "CLP");
        parametros.put("amount", monto.toString());
        parametros.put("email", correoTutor);
        parametros.put("paymentMethod", "9"); // 9 = Mostrar todas las opciones de pago (Webpay, Mach, Servipag)
        parametros.put("urlConfirmation", flowUrlConfirm);
        parametros.put("urlReturn", flowUrlReturn);

        // 2. Concatenar todas las llaves y valores para la firma
        StringBuilder dataParaFirmar = new StringBuilder();
        for (Map.Entry<String, String> entry : parametros.entrySet()) {
            dataParaFirmar.append(entry.getKey()).append(entry.getValue());
        }

        // 3. Generar la firma criptográfica (Se usa flowSecretKey)
        String firma = generarFirmaHmacSha256(dataParaFirmar.toString(), flowSecretKey);
        parametros.put("s", firma); // Agregamos la firma al paquete

        // 4. Preparar la petición HTTP (Form URL Encoded, como lo exige Flow)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        parametros.forEach(body::add);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        // 5. Enviar la petición a Flow (Endpoint: /payment/create)
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(flowApiUrl + "/payment/create", request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Flow nos devuelve una URL base y un Token. Hay que juntarlos.
                String url = (String) response.getBody().get("url");
                String token = (String) response.getBody().get("token");
                return url + "?token=" + token; // URL final para el frontend
            } else {
                throw new RuntimeException("Error al comunicarse con Flow. Código: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Excepción al crear el pago en Flow: " + e.getMessage());
        }
    }

    /**
     * Consulta el estado real de un pago en Flow usando su token.
     */
    @SuppressWarnings("rawtypes")
    public Map<String, Object> consultarEstadoPago(String token) {
        
        // 1. Preparar los parámetros requeridos
        Map<String, String> parametros = new TreeMap<>();
        parametros.put("apiKey", flowApiKey);
        parametros.put("token", token);

        // 2. Concatenar y firmar
        StringBuilder dataParaFirmar = new StringBuilder();
        for (Map.Entry<String, String> entry : parametros.entrySet()) {
            dataParaFirmar.append(entry.getKey()).append(entry.getValue());
        }
        
        // 3. Llamamos a generar firma (Se usa flowSecretKey)
        String firma = generarFirmaHmacSha256(dataParaFirmar.toString(), flowSecretKey);

        // 4. Armar la URL de consulta
        String url = flowApiUrl + "/payment/getStatus?apiKey=" + flowApiKey + "&token=" + token + "&s=" + firma;

        // 5. Preguntarle a Flow
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody(); // Esto trae el status (1=Pendiente, 2=Pagado, etc.)
            } else {
                throw new RuntimeException("Error al consultar token en Flow");
            }
        } catch (Exception e) {
            throw new RuntimeException("Excepción consultando estado en Flow: " + e.getMessage());
        }
    }

    /**
     * Método interno para generar la firma criptográfica HMAC-SHA256
     */
    private String generarFirmaHmacSha256(String data, String secretKey) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);

            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            // Convertir el hash a formato Hexadecimal
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar la firma para Flow", e);
        }
    }
}