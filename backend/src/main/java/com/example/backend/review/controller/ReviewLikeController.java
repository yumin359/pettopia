package com.example.backend.review.controller;

import com.example.backend.review.dto.ReviewLikeDto;
import com.example.backend.review.dto.ReviewLikeForm;
import com.example.backend.review.service.ReviewLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviewlike")
public class ReviewLikeController {

    private final ReviewLikeService likeService;

    @PutMapping
    public ReviewLikeDto like(@RequestBody ReviewLikeForm likeForm, Authentication authentication) {
        return likeService.update(likeForm, authentication);
    }

    @GetMapping("review/{reviewId}")
    public ReviewLikeDto get(
            @PathVariable("reviewId") Integer reviewId,
            Authentication authentication) {

        return likeService.get(reviewId, authentication);
    }
}
