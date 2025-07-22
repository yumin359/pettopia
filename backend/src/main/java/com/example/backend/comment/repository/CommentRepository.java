package com.example.backend.comment.repository;

import com.example.backend.comment.entity.Comment;
import com.example.backend.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    @Modifying
    @Transactional
    @Query("DELETE FROM Comment c WHERE c.board.id = :boardId")
    void deleteByBoardId(Integer boardId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Comment c WHERE c.author = :author")
    void deleteByAuthor(Member author);

    List<Comment> findByBoardId(Integer boardId);
}