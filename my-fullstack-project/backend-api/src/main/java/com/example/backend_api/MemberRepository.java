package com.example.backend_api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
  Page<Member> findByNameContainingIgnoreCase(String name, Pageable pageable);
  Page<Member> findByDateContainingIgnoreCase(String date, Pageable pageable);
  Page<Member> findByNameContainingIgnoreCaseOrDateContainingIgnoreCase(String name, String date, Pageable pageable);
}
