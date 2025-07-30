package com.example.backend.support.service;

import com.example.backend.support.dto.SupportRequestDto;
import com.example.backend.support.entity.Support;
import com.example.backend.support.repository.SupportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportRepository supportRepository;

    public void saveSupport(SupportRequestDto dto) {
        Support support = new Support();
        support.setEmail(dto.getEmail());
        support.setTitle(dto.getSubject());
        support.setContent(dto.getMessage());

        supportRepository.save(support);
    }
}
