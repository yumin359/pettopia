package com.example.backend.review.entity;

import com.example.backend.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder // ✅ 이게 꼭 있어야 한다
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String facilityName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_email", referencedColumnName = "email", nullable = false)
    private Member memberEmail;

    @Column(nullable = false, length = 2000)
    private String review;

    @Column(nullable = false)
    private Integer rating;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL)
    private List<ReviewFile> files = new ArrayList<>();

    @Column(nullable = false)
    private Instant insertedAt;
}
