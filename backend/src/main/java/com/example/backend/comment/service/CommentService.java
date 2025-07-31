package com.example.backend.comment.service;

import com.example.backend.board.entity.Board;
import com.example.backend.board.repository.BoardRepository;
import com.example.backend.comment.dto.CommentForm;
import com.example.backend.comment.entity.Comment;
import com.example.backend.comment.repository.CommentRepository;
import com.example.backend.comment.dto.CommentDto;
import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.MemberFile;
import com.example.backend.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Transactional
@Service
@RequiredArgsConstructor
public class CommentService {

    private final BoardRepository boardRepository;
    private final MemberRepository memberRepository;
    private final CommentRepository commentRepository;

    @Value("${image.prefix}")
    private String imagePrefix;

    public void add(CommentForm commentForm, Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("권한이 없습니다.");
        }
        Board board = boardRepository.findById(commentForm.getBoardId())
                .orElseThrow(() -> new RuntimeException("게시물이 존재하지 않습니다."));

        // 이메일로 멤버 조회 (MemberRepository에 findByEmail 메서드가 있다고 가정)
        Member member = memberRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("회원 정보가 존재하지 않습니다."));

        Comment comment = new Comment();
        comment.setBoard(board);
        comment.setComment(commentForm.getComment());
        comment.setAuthor(member);

        commentRepository.save(comment);
    }

    public List<CommentDto> findByBoardId(Integer boardId) {
        return commentRepository.findByBoardId(boardId).stream().map(comment -> {
            CommentDto dto = new CommentDto();
            dto.setId(comment.getId());
            dto.setComment(comment.getComment());
            dto.setAuthorNickName(comment.getAuthor().getNickName());
            dto.setAuthorEmail(comment.getAuthor().getEmail());

            if (comment.getInsertedAt() != null) {
                ZonedDateTime seoulTime = comment.getInsertedAt()
                        .atZone(ZoneId.systemDefault()) // 또는 UTC
                        .withZoneSameInstant(ZoneId.of("Asia/Seoul"));
                dto.setInsertedAt(seoulTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            }

            // ✅ DTO 생성 후 profileImageUrl을 채워주는 로직
            List<MemberFile> memberFiles = comment.getAuthor().getFiles();
            if (memberFiles != null && !memberFiles.isEmpty()) {
                MemberFile profileFile = memberFiles.get(0);
                dto.setProfileImageUrl(imagePrefix + "prj3/member/" + comment.getAuthor().getId() + "/" + profileFile.getId().getName());
            } else {
                dto.setProfileImageUrl(null); // 또는 기본 이미지 URL
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public boolean validate(CommentDto dto) {
        // 댓글 내용만 유효성 검사
        return dto.getComment() != null && !dto.getComment().trim().isEmpty();
    }

    public void update(CommentDto dto, Authentication authentication) {
        String email = authentication.getName();
        Comment comment = commentRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("해당 댓글이 없습니다."));
        if (!comment.getAuthor().getEmail().equals(email)) {
            throw new RuntimeException("본인 댓글만 수정할 수 있습니다.");
        }
        comment.setComment(dto.getComment().trim());
        commentRepository.save(comment);
    }

    public void deleteById(Integer commentId, Authentication authentication) {
        String email = authentication.getName();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("해당 댓글이 없습니다."));
        if (!comment.getAuthor().getEmail().equals(email)) {
            throw new RuntimeException("본인 댓글만 삭제할 수 있습니다.");
        }
        commentRepository.delete(comment);
    }
}