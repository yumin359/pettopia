package com.example.backend.review.service;

import com.example.backend.board.entity.BoardFile;
import com.example.backend.board.entity.BoardFileId;
import com.example.backend.member.entity.Member;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.review.dto.ReviewDto;
import com.example.backend.review.entity.Review;
import com.example.backend.review.entity.ReviewFile;
import com.example.backend.review.entity.ReviewFileId;
import com.example.backend.review.repository.ReviewFileRepository;
import com.example.backend.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;
    private final ReviewFileRepository reviewFileRepository;
    private final S3Client s3Client;

    @Value("${image.prefix}")
    private String imagePrefix;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    // S3에 파일 업로드
    private void uploadFile(MultipartFile file, String objectKey) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .acl(ObjectCannedACL.PUBLIC_READ) // 공개 읽기 권한
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (Exception e) {
            throw new RuntimeException("파일 업로드 실패: " + objectKey, e);
        }
    }

    // S3에서 파일 삭제
    private void deleteFile(String objectKey) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }

    // 리뷰 저장
    public void save(ReviewDto dto) {
        Member member = memberRepository.findByEmail(dto.getMemberEmail())
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다: " + dto.getMemberEmail()));

        Review review = Review.builder()
                .facilityName(dto.getFacilityName())
                .memberEmail(member)
                .review(dto.getReview())
                .rating(dto.getRating())
                .insertedAt(Instant.now())
                .build();

        reviewRepository.save(review);

        saveFiles(review, dto);
    }

    // 리뷰 사진 저장( DB 저장 + S3 업로드)
    private void saveFiles(Review review, ReviewDto dto) {
        List<MultipartFile> files = dto.getFiles();
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file != null && file.getSize() > 0) {
                    // DB에 파일 메타정보 저장
                    ReviewFile reviewFile = new ReviewFile();
                    ReviewFileId reviewFileId = new ReviewFileId();
                    reviewFileId.setReviewId(review.getId());
                    reviewFileId.setName(file.getOriginalFilename());
                    reviewFile.setReview(review);
                    reviewFile.setId(reviewFileId);
                    reviewFileRepository.save(reviewFile);

                    // S3에 파일 업로드
                    String objectKey = "prj3/review/" + review.getId() + "/" + file.getOriginalFilename();
                    uploadFile(file, objectKey);
                }
            }
        }
    }

    // 특정 시설 리뷰 목록 조회
    public List<ReviewDto> findAllByFacilityName(String facilityName) {
        return reviewRepository.findAllByFacilityNameOrderByInsertedAtDesc(facilityName)
                .stream()
                .map(review -> ReviewDto.builder()
                        .id(review.getId())
                        .facilityName(review.getFacilityName())
                        .memberEmail(review.getMemberEmail().getEmail())
                        .memberEmailNickName(review.getMemberEmail().getNickName()) // ✅ 닉네임 포함
                        .review(review.getReview())
                        .rating(review.getRating())
                        .insertedAt(review.getInsertedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // 리뷰 수정
    public void update(Integer id, ReviewDto dto) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("리뷰를 찾을 수 없습니다: " + id));

        if (!review.getMemberEmail().getEmail().equals(dto.getMemberEmail())) {
            throw new SecurityException("자신이 작성한 리뷰만 수정할 수 있습니다.");
        }

        review.setReview(dto.getReview());
        review.setRating(dto.getRating());
        reviewRepository.save(review);
    }

    // 리뷰 삭제
    public void delete(Integer id, String requesterEmail) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("리뷰를 찾을 수 없습니다: " + id));

        if (!review.getMemberEmail().getEmail().equals(requesterEmail)) {
            throw new SecurityException("자신이 작성한 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepository.deleteById(id);
    }

    // ✅ 최신 리뷰 5개 조회
    public List<ReviewDto> getLatestReviews() {
        return reviewRepository.findTop5ByOrderByInsertedAtDesc()
                .stream()
                .map(review -> ReviewDto.builder()
                        .id(review.getId())
                        .facilityName(review.getFacilityName())
                        .memberEmail(review.getMemberEmail().getEmail())
                        .memberEmailNickName(review.getMemberEmail().getNickName())
                        .review(review.getReview())
                        .rating(review.getRating())
                        .insertedAt(review.getInsertedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
