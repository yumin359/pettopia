package com.example.backend.favorite.entity;

import com.example.backend.member.entity.Member;
import com.example.backend.petFacility.PetFacility;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@ToString
@Entity
@Table(name = "favorite", schema = "prj04")
public class Favorite {
    @EmbeddedId
    private FavoriteId id;

    @MapsId("memberId")
    @ManyToOne(optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @MapsId("facilityId")
    @ManyToOne(optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "facility_id", nullable = false)
    private PetFacility facility;

}