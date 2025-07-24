package com.example.backend.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthId implements Serializable {
    private Long memberId;
    private String authName;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AuthId)) return false;
        AuthId authId = (AuthId) o;
        return memberId.equals(authId.memberId) && authName.equals(authId.authName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(memberId, authName);
    }
}