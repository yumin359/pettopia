package com.example.backend.review.dto;

import com.example.backend.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@Getter
@Setter
@Builder
public class ReviewListDto {
    private Integer id;
    private String facilityName;
    private String memberEmail;            // 작성자 이메일
    private String memberEmailNickName;    // 작성자 닉네임 ✅ 추가
    private String review;
    private Integer rating;
    private Instant insertedAt;
    private List<String> files; // 리뷰 첨부 이미지 여러개
    private String profileImageUrl; // 프로필 이미지 한개만

    public ReviewListDto(Review review) {
        this.id = review.getId();
        this.facilityName = review.getFacilityName();
        this.memberEmail = review.getMemberEmail().getEmail();
        this.memberEmailNickName = review.getMemberEmail().getNickName();
        this.review = review.getReview();
        this.rating = review.getRating();
        this.insertedAt = review.getInsertedAt();

        // 리뷰 첨부파일 URL 생성
        String baseUrl = "https://prj3/";  // 실제 파일 저장 URL로 변경하세요
        this.files = review.getFiles().stream()
                .map(file -> baseUrl + file.getId().getName())  // ReviewFileId.name 사용
                .collect(Collectors.toList());

        // 프로필 이미지 URL: Member의 files 리스트 첫 번째 파일 사용 (없으면 null)
        String profileBaseUrl = "https://yourserver.com/profiles/";
        var memberFiles = review.getMemberEmail().getFiles();
        if (memberFiles != null && !memberFiles.isEmpty()) {
            this.profileImageUrl = profileBaseUrl + memberFiles.get(0).getId().getName();
        } else {
            this.profileImageUrl = null;
        }


    }

    public static ReviewListDto fromEntity(Review review) {
        return new ReviewListDto(review);
    }

}
