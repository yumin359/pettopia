package com.example.backend.auth.entity;

import com.example.backend.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

// 📁 com.example.backend.member.entity.Auth
@Entity
@Table(name = "auth")
@IdClass(AuthId.class)
@Getter
@Setter
@NoArgsConstructor
public class Auth {
    @Id
    @Column(name = "member_id")
    private Long memberId;

    @Id
    @Column(name = "auth_name")
    private String authName;

    // Member 엔티티와의 Many-to-One 관계 추가
    // member_id는 이미 PK의 일부로 매핑되었으므로, insertable/updatable을 false로 설정하여
    // JPA가 이 컬럼을 직접 삽입/업데이트하지 않도록 합니다.
    @ManyToOne
    @JoinColumn(name = "member_id", insertable = false, updatable = false)
    private Member member; // <-- 이 필드가 누락되어 있었습니다!
}