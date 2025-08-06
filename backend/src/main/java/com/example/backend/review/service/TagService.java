package com.example.backend.review.service;

import com.example.backend.review.dto.TagDto;
import com.example.backend.review.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 조회 기능만 있으므로 readOnly = true 설정
public class TagService {

    private final TagRepository tagRepository;

    public List<TagDto> findAll() {
        return tagRepository.findAll().stream()
                .map(TagDto::fromEntity) // Tag 엔티티를 TagDto로 변환
                .collect(Collectors.toList());
    }
}
