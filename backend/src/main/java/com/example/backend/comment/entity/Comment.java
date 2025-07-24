package com.example.backend.comment.entity;

import com.example.backend.board.entity.Board;
import com.example.backend.member.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Table(name = "comment")
@Entity
@NoArgsConstructor
@Getter
@Setter
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "board_id")
    private Board board;

    private String author;
    // 아마 여기도 아래가 작성자가 될 듯
    @ManyToOne
    @JoinColumn(name = "author_member_id")
    private Member authorMember;

    private String comment;

    @Column(insertable = false, updatable = false)
    private LocalDateTime insertedAt;
}