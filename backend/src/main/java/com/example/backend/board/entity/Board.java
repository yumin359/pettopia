package com.example.backend.board.entity;

import com.example.backend.member.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "board")
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가
    private Integer id;

    private String title;
    private String content;

//    private String author;

    @Column(updatable = false, insertable = false) // 생성 시각 자동 default NOW();
    private LocalDateTime insertedAt;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BoardFile> files = new ArrayList<>();

    // 아마 얘가 작성자가 될 듯
    @ManyToOne
    @JoinColumn(name = "author_member_id")
    private Member author;


    // 공개/비공개 추가

}
