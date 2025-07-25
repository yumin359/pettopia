package com.example.backend.member.repository;

import com.example.backend.member.entity.MemberFile;
import com.example.backend.member.entity.MemberFileId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberFileRepository extends JpaRepository<MemberFile, MemberFileId> {
}