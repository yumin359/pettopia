package com.example.backend.support.service;

import com.example.backend.support.dto.SupportRequestDto;
import com.example.backend.support.dto.SupportResponseDto;
import com.example.backend.support.entity.Support;
import com.example.backend.support.entity.SupportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportRepository supportRepository;

    // 문의 저장
    public void saveSupport(SupportRequestDto dto) {
        Support support = new Support();
        support.setEmail(dto.getEmail());
        support.setTitle(dto.getSubject());
        support.setContent(dto.getMessage());
        supportRepository.save(support);
    }

    // 문의 전체 조회 (최신순)
    public List<SupportResponseDto> getAllSupports() {
        List<Support> supports = supportRepository.findAllByOrderByInsertedAtDesc();

        return supports.stream()
                .map(support -> {
                    SupportResponseDto dto = new SupportResponseDto();
                    dto.setId(support.getId());
                    dto.setEmail(support.getEmail());
                    dto.setTitle(support.getTitle());
                    dto.setContent(support.getContent());
                    dto.setInsertedAt(support.getInsertedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
