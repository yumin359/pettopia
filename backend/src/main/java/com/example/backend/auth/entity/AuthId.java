package com.example.backend.auth.entity;

import java.io.Serializable;
import java.util.Objects;

public class AuthId implements Serializable {
    private Long memberId;
    private String authName;

    public AuthId() {
    }

    public AuthId(Long memberId, String authName) {
        this.memberId = memberId;
        this.authName = authName;
    }

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