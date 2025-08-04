package com.example.backend.review.entity;

import com.example.backend.review.entity.Review;
import com.example.backend.member.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Entity
@Table(name = "review_like", schema = "prj04")
public class ReviewLike {
    @EmbeddedId
    private ReviewLikeId id;

    @MapsId("reviewId")
    @ManyToOne(optional = false)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @MapsId("memberId")
    @ManyToOne(optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

}