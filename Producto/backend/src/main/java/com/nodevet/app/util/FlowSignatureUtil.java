package com.nodevet.app.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;

public class FlowSignatureUtil {

    /**
     * Genera la firma HMAC-SHA256 requerida por Flow.
     * @param parameters Los parámetros a enviar a Flow (sin la firma).
     * @param secretKey Tu llave secreta de Flow.
     * @return La firma en formato hexadecimal.
     */
    public static String signParameters(Map<String, String> parameters, String secretKey) {
        try {
            // 1. Flow exige que los parámetros se ordenen alfabéticamente por el nombre de la llave
            TreeMap<String, String> sortedParams = new TreeMap<>(parameters);
            StringBuilder dataToSign = new StringBuilder();

            // 2. Concatenamos las llaves y valores 
            for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
                dataToSign.append(entry.getKey()).append(entry.getValue());
            }

            // 3. Preparamos el algoritmo criptográfico
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);

            // 4. Firmamos el texto resultante
            byte[] hash = sha256_HMAC.doFinal(dataToSign.toString().getBytes(StandardCharsets.UTF_8));
            
            // 5. Convertimos el resultado a formato Hexadecimal minúscula (como lo pide Flow)
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
            throw new RuntimeException("Error fatal al generar la firma para Flow", e);
        }
    }
}