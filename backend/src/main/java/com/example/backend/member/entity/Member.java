package com.example.backend.member.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String nickName;
    private String info;

    private String provider;
    private String providerId;

    // 흠
    private Role role;

    @Column(insertable = false, updatable = false)
    private LocalDateTime insertedAt;

    public enum Role {USER, ADMIN}
}