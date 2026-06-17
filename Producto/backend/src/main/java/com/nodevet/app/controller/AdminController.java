package com.nodevet.app.controller;

import com.nodevet.app.dto.usuario.AdminRegistroDTO;
import com.nodevet.app.model.usuario.Admin;
import com.nodevet.app.service.usuario.AdminService;
import com.nodevet.app.util.DtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admins")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarAdmin(@Valid @RequestBody AdminRegistroDTO dto) {
        try {
            Admin adminGuardado = adminService.crearAdmin(dto);
            return new ResponseEntity<>(DtoMapper.toAdminDTO(adminGuardado), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}