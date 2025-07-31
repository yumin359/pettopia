package com.example.backend.comment.controller;

import com.example.backend.comment.dto.CommentForm;
import com.example.backend.comment.entity.Comment;
import com.example.backend.comment.service.CommentService;
import com.example.backend.comment.dto.CommentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comment")
public class CommentController {

    private final CommentService commentService;

    // 추가
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> add(@RequestBody CommentForm comment,
                                 Authentication authentication) {
        try {
            commentService.add(comment, authentication);
            return ResponseEntity.ok()
                    .body(Map.of("message",
                            Map.of("type", "success",
                                    "text", "새 댓글이 등록되었습니다.")));
        } catch (Exception e) {
            return ResponseEntity.ok()
                    .body(Map.of("message",
                            Map.of("type", "error",
                                    "text", e.getMessage())));
        }

    }

    // 목록
    @GetMapping("/list")
    public ResponseEntity<?> list(@RequestParam Integer boardId) {
        List<CommentDto> commentDto = commentService.findByBoardId(boardId);

        return ResponseEntity.ok(Map.of("comments", commentDto));
    }


    // 수정
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@PathVariable Integer id,
                                    @RequestBody CommentDto dto,
                                    Authentication authentication) {
        dto.setId(id);
        if (!commentService.validate(dto)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", Map.of("type", "error", "text", "입력한 내용이 유효하지 않습니다.")));
        }
        commentService.update(dto, authentication);
        return ResponseEntity.ok(Map.of("message", Map.of("type", "success", "text", id + "번 댓글이 수정되었습니다.")));
    }

    // 삭제
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> delete(@PathVariable Integer id,
                                    Authentication authentication) {
        try {
            commentService.deleteById(id, authentication);
            return ResponseEntity.ok(Map.of("message", Map.of("type", "success", "text", id + "번 댓글이 삭제되었습니다.")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", Map.of("type", "error", "text", e.getMessage())));
        }
    }
}