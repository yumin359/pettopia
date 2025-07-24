package com.example.backend.auth.repository;

import com.example.backend.auth.entity.Auth;
import com.example.backend.auth.entity.AuthId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AuthRepository extends JpaRepository<Auth, AuthId> {
    List<Auth> findByMemberId(Long Id); // 권한 불러올 때 사용

    // memberId를 통해 권한 이름 조회 (권장)
    @Query("SELECT a.authName FROM Auth a WHERE a.memberId = :memberId")
    List<String> findAuthNamesByMemberId(@Param("memberId") Long memberId);

    // email을 통해 권한 이름 조회 (Auth 엔티티의 member 관계를 조인하여 사용)
    @Query("SELECT a.authName FROM Auth a JOIN a.member m WHERE m.email = :email")
    List<String> findAuthNamesByMemberEmail(@Param("email") String email);
}