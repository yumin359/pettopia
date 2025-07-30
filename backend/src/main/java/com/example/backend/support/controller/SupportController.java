package com.example.backend.support.controller;

import com.example.backend.support.dto.SupportRequestDto;
import com.example.backend.support.entity.Support;
import com.example.backend.support.service.SupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @PostMapping
    public ResponseEntity<String> createSupport(@RequestBody SupportRequestDto dto) {
        try {
            supportService.saveSupport(dto);
            return ResponseEntity.ok("문의가 성공적으로 접수되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("문의 접수 중 오류가 발생했습니다.");
        }
    }
}
