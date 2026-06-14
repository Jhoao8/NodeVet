package com.nodevet.app.controller;

import com.nodevet.app.model.Veterinario;
import com.nodevet.app.repository.VeterinarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/veterinarios")
@RequiredArgsConstructor
public class VeterinarioController {

    private final VeterinarioRepository veterinarioRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarVeterinarios() {
        List<Veterinario> veterinarios = veterinarioRepository.findAll();
        
        List<Map<String, Object>> response = veterinarios.stream().map(vet -> {
            Map<String, Object> map = new HashMap<>();
            map.put("idVet", vet.getIdVet());
            map.put("runVet", vet.getRunVet());
            map.put("dvVet", vet.getDvVet());
            
            if (vet.getUsuario() != null) {
                map.put("idUsuario", vet.getUsuario().getIdUsuario());
                map.put("nombre", vet.getUsuario().getNombreUsr());
                map.put("apellido", vet.getUsuario().getApellidoUsr());
                map.put("correo", vet.getUsuario().getCorreoUsr());
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}