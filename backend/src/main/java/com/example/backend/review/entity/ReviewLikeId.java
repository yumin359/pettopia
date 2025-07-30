package com.example.backend.review.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class ReviewLikeId implements Serializable {
    private static final long serialVersionUID = 1538356022022487028L;
    @Column(name = "review_id", nullable = false)
    private Integer reviewId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ReviewLikeId entity = (ReviewLikeId) o;
        return Objects.equals(this.reviewId, entity.reviewId) &&
                Objects.equals(this.memberId, entity.memberId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reviewId, memberId);
    }

}