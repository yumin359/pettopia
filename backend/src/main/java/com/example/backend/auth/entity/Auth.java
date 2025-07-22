package com.example.backend.auth.entity;

import jakarta.persistence.*;
import lombok.*;

// 📁 com.example.backend.member.entity.Auth
@Entity
@IdClass(AuthId.class)
@Table(name = "auth")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Auth {
    @Id
    @Column(name = "member_email")
    private String memberEmail;

    @Id
    @Column(name = "auth_name")
    private String authName;
}