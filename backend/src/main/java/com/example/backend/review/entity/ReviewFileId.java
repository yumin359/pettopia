package com.example.backend.review.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@ToString
@Embeddable
public class ReviewFileId implements Serializable {
    private static final long serialVersionUID = 4688003377648891414L;
    @Column(name = "review_id", nullable = false)
    private Integer reviewId;

    @Column(name = "name", nullable = false, length = 300)
    private String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ReviewFileId entity = (ReviewFileId) o;
        return Objects.equals(this.name, entity.name) &&
                Objects.equals(this.reviewId, entity.reviewId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, reviewId);
    }

}