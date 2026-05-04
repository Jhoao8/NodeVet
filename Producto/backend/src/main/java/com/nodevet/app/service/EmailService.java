package com.nodevet.app.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void enviarCorreoRecuperacion(String destino, String token) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destino);
        mensaje.setSubject("Recuperación de Contraseña - NodeVet");
        
        // Aqui construyes el enlace que usara el frontend mas adelante
        String url = "http://localhost:3000/reset-password?token=" + token;
        
        mensaje.setText("Hola,\n\nHas solicitado restablecer tu contraseña en NodeVet. " +
                        "Haz clic en el siguiente enlace para continuar:\n" + url + 
                        "\n\nEste enlace expirará en 1 hora.");

        mailSender.send(mensaje);
    }
}