package com.example.backend.member.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class MemberForm {
    private String email;
    private String password;
    private String nickName;
    private String info;
    private List<MultipartFile> files;
}