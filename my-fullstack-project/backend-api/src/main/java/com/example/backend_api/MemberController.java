package com.example.backend_api;

import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "http://localhost:4200") // 依你前端port調整
public class MemberController {

    private final MemberRepository repo;

    public MemberController(MemberRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "all") String field, // all | name | date
            @RequestParam(defaultValue = "newest") String sort, // newest | oldest | nameAsc
            @RequestParam(defaultValue = "1") int page, // 前端用 1-based
            @RequestParam(defaultValue = "8") int pageSize) {
        // sort mapping
        Sort s;
        switch (sort) {
            case "oldest" -> s = Sort.by(Sort.Direction.ASC, "date");
            case "nameAsc" -> s = Sort.by(Sort.Direction.ASC, "name");
            default -> s = Sort.by(Sort.Direction.DESC, "date"); // newest
        }

        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), pageSize, s);

        Page<Member> result;
        String keyword = q == null ? "" : q.trim();

        if (keyword.isEmpty()) {
            result = repo.findAll(pageable);
        } else {
            switch (field) {
                case "name" -> result = repo.findByNameContainingIgnoreCase(keyword, pageable);
                case "date" -> result = repo.findByDateContainingIgnoreCase(keyword, pageable);
                default ->
                    result = repo.findByNameContainingIgnoreCaseOrDateContainingIgnoreCase(keyword, keyword, pageable);
            }
        }

        Map<String, Object> body = new HashMap<>();
        body.put("items", result.getContent());
        body.put("total", result.getTotalElements());
        return ResponseEntity.ok(body);
    }

    // -------- CRUD 讓你前端 add/edit/delete 繼續用 --------

    @PostMapping
    public Member create(@RequestBody Member m) {
        return repo.save(m);
    }

    @PutMapping("/{id}")
    public Member update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Member m = repo.findById(id).orElseThrow();
        if (payload.containsKey("name"))
            m.setName(String.valueOf(payload.get("name")));
        if (payload.containsKey("date"))
            m.setDate(String.valueOf(payload.get("date")));
        return repo.save(m);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
