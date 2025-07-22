package com.example.backend.like.repository;

import com.example.backend.like.entity.BoardLike;
import com.example.backend.like.entity.BoardLikeId;
import com.example.backend.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface BoardLikeRepository extends JpaRepository<BoardLike, BoardLikeId> {
    Optional<BoardLike> findByBoardIdAndMemberEmail(Integer boardId, String memberEmail);

    Long countByBoardId(Integer boardId);

    @Transactional
    @Modifying
    @Query("delete from BoardLike bl where bl.board.id = :boardId")
    void deleteByBoardId(Integer boardId);

    @Transactional
    @Modifying
    @Query("delete from BoardLike bl where bl.member.email = :memberEmail")
    void deleteByMemberEmail(String memberEmail);  // 수정된 부분
}