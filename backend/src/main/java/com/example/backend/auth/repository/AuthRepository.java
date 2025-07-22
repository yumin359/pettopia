package com.example.backend.auth.repository;

import com.example.backend.auth.entity.Auth;
import com.example.backend.auth.entity.AuthId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthRepository extends JpaRepository<Auth, AuthId> {
    List<Auth> findByMemberEmail(String email); // 권한 불러올 때 사용
}