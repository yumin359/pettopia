package com.example.backend.calendar.controller;

import com.example.backend.calendar.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getCalendarData(
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam String email) {  // 프론트에서 이메일 전달

        Map<String, Object> data = calendarService.getCalendarData(email, year, month);
        return ResponseEntity.ok(data);
    }
}