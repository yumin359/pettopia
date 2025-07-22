package com.example.backend.auth.entity;

import java.io.Serializable;
import java.util.Objects;

public class AuthId implements Serializable {
    private String memberEmail;  // 변경됨: member -> memberEmail
    private String authName;

    public AuthId() {
    }

    public AuthId(String memberEmail, String authName) {
        this.memberEmail = memberEmail;
        this.authName = authName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AuthId)) return false;
        AuthId authId = (AuthId) o;
        return memberEmail.equals(authId.memberEmail) && authName.equals(authId.authName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(memberEmail, authName);
    }
}