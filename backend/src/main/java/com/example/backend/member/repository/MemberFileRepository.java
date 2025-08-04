package com.example.backend.member.repository;

import com.example.backend.member.entity.MemberFile;
import com.example.backend.member.entity.MemberFileId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface MemberFileRepository extends JpaRepository<MemberFile, MemberFileId> {
    @Query("SELECT mf FROM MemberFile mf WHERE mf.member.id IN :memberIds ORDER BY mf.id.name ASC")
    List<MemberFile> findByMemberIdIn(@Param("memberIds") Collection<Long> memberIds);
}