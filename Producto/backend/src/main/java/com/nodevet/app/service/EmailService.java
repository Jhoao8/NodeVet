package com.nodevet.app.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void enviarCorreoRecuperacion(String destino, String codigo) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destino);
        mensaje.setSubject("Código de Recuperación de Contraseña - NodeVet");
        
        // El cuerpo del correo ahora entrega el código directamente
        mensaje.setText("Hola,\n\nHas solicitado restablecer tu contraseña en NodeVet. " +
                        "Tu código de verificación es:\n\n" + codigo + 
                        "\n\nEste código expirará en 15 minutos.\n" +
                        "Si no solicitaste este cambio, por favor ignora este correo.");

        mailSender.send(mensaje);
    }
}