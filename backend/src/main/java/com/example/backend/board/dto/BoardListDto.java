package com.example.backend.board.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BoardListDto {
    private Integer id;
    private String title;
    private String nickName;
    private LocalDateTime insertedAt;
    private Long countComment;
    private Long countLike;
    private Long countFile;
    private String profileImageUrl; // 프로필 이미지 한개만, url을 담아야함
    private Long memberId; //

    // 안쓰는게 아니라 프론트에서 사용하면 IJ 가 인식을 못할 뿐.
    public String getTimesAgo() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        LocalDateTime insertedAt = this.getInsertedAt();

        Duration duration = Duration.between(insertedAt, now);

        long seconds = duration.toSeconds();

        if (seconds < 60) {
            return "방금 전";
        } else if (seconds < 60 * 60) { // 1시간 미만
            long minutes = seconds / 60;
            return minutes + "분 전";
        } else {
            // 1시간 이상부터는 절대 시간 표시 (yyyy-MM-dd)
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            return insertedAt.format(formatter);
        }
    }
}