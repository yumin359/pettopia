package com.example.backend.favorite.entity;

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
public class FavoriteId implements Serializable {
    private static final long serialVersionUID = 1751311356465609205L;
    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        FavoriteId entity = (FavoriteId) o;
        return Objects.equals(this.facilityId, entity.facilityId) &&
                Objects.equals(this.memberId, entity.memberId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(facilityId, memberId);
    }

}