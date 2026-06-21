package com.nodevet.app.controller;

import com.nodevet.app.dto.usuario.AdminRegistroDTO;
import com.nodevet.app.model.usuario.Admin;
import com.nodevet.app.service.usuario.AdminService;
import com.nodevet.app.util.DtoMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admins")
@RequiredArgsConstructor
@Tag(name = "Administradores", description = "Gestión de cuentas con privilegios administrativos en la plataforma.")
public class AdminController {

    private final AdminService adminService;

    @PostMapping
    @Operation(summary = "Registrar nuevo administrador", description = "Crea un usuario y le asigna el rol de Administrador. Esta acción está reservada para el superusuario o administradores existentes.")
    public ResponseEntity<?> registrarAdmin(@Valid @RequestBody AdminRegistroDTO dto) {
        try {
            Admin adminGuardado = adminService.crearAdmin(dto);
            return new ResponseEntity<>(DtoMapper.toAdminDTO(adminGuardado), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}