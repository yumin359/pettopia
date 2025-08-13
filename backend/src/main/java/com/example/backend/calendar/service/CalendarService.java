package com.example.backend.calendar.service;

import com.example.backend.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarService {

    private final ReviewRepository reviewRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.api.key}")
    private String googleApiKey;

    public Map<String, Object> getCalendarData(String email, int year, Integer month) {
        Map<String, Object> result = new HashMap<>();

        // 1. Google Calendar에서 공휴일 가져오기
        Map<String, Object> holidays = getKoreanHolidays(year);

        // 2. DB에서 리뷰 가져오기
        List<Map<String, Object>> reviews = getUserReviews(email, year, month);

        result.put("holidays", holidays);
        result.put("reviews", reviews);

        return result;
    }

    private Map<String, Object> getKoreanHolidays(int year) {
        try {
            String url = String.format(
                    "https://www.googleapis.com/calendar/v3/calendars/" +
                            "ko.south_korea%%23holiday@group.v.calendar.google.com/events" +
                            "?key=%s&timeMin=%d-01-01T00:00:00Z&timeMax=%d-12-31T23:59:59Z",
                    googleApiKey, year, year
            );

            Map response = restTemplate.getForObject(url, Map.class);
            List<Map> items = (List<Map>) response.get("items");

            Map<String, Object> holidays = new HashMap<>();
            for (Map item : items) {
                Map<String, String> start = (Map<String, String>) item.get("start");
                String date = start.get("date");

                Map<String, String> holiday = new HashMap<>();
                holiday.put("name", (String) item.get("summary"));
                holidays.put(date, holiday);
            }

            return holidays;

        } catch (Exception e) {
            log.error("Failed to fetch holidays", e);
            return new HashMap<>();  // 빈 맵 반환
        }
    }

    private List<Map<String, Object>> getUserReviews(String email, int year, Integer month) {
        List<Object[]> rawReviews;

        if (month != null) {
            rawReviews = reviewRepository.findReviewsByYearAndMonth(email, year, month);
        } else {
            rawReviews = reviewRepository.findReviewsByYear(email, year);
        }

        List<Map<String, Object>> reviews = new ArrayList<>();
        for (Object[] row : rawReviews) {
            Map<String, Object> review = new HashMap<>();
            review.put("id", row[0]);
            review.put("facilityName", row[1]);
            review.put("rating", row[2]);
            review.put("content", row[3]);
            review.put("date", row[4]);  // "2025-01-15" 형식
            review.put("facilityId", row[5]);
            reviews.add(review);
        }

        return reviews;
    }
}