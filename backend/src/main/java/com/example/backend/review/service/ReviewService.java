package com.example.backend.review.service;

import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.MemberFile;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.review.dto.ReviewFormDto;
import com.example.backend.review.dto.ReviewListDto;
import com.example.backend.review.dto.TagDto;
import com.example.backend.review.entity.Review;
import com.example.backend.review.entity.ReviewFile;
import com.example.backend.review.entity.ReviewFileId;
import com.example.backend.review.entity.Tag;
import com.example.backend.review.repository.ReviewFileRepository;
import com.example.backend.review.repository.ReviewRepository;
import com.example.backend.review.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;
    private final ReviewFileRepository reviewFileRepository;
    private final TagRepository tagRepository;
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

    // 리뷰 사진 저장( DB 저장 + S3 업로드)
    private void saveFiles(Review review, List<MultipartFile> files) {
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file != null && file.getSize() > 0) {
                    String originalFileName = file.getOriginalFilename();
                    // 파일 이름이 중복될 수 있으므로 고유한 이름으로 변경하는 것을 권장합니다.
                    String uuidFileName = UUID.randomUUID().toString() + "_" + originalFileName;

                    ReviewFile reviewFile = new ReviewFile();
                    ReviewFileId reviewFileId = new ReviewFileId();
                    reviewFileId.setReviewId(review.getId());
                    reviewFileId.setName(uuidFileName); // 고유한 이름으로 저장
                    reviewFile.setReview(review);
                    reviewFile.setId(reviewFileId);
                    reviewFileRepository.save(reviewFile);

                    String objectKey = "prj3/review/" + review.getId() + "/" + uuidFileName;
                    uploadFile(file, objectKey);
                }
            }
        }
    }

    // `newFiles` 메소드는 `saveFiles`와 기능이 거의 동일하므로, `saveFiles`를 재사용하도록 수정합니다.
    private void newFiles(Review review, List<MultipartFile> newFiles) {
        saveFiles(review, newFiles);
    }

    private void deleteFiles(Review review, List<String> deleteFileNames) {
        for (String fileName : deleteFileNames) {
            ReviewFileId fileId = new ReviewFileId();
            fileId.setReviewId(review.getId());
            fileId.setName(fileName);

            Optional<ReviewFile> file = reviewFileRepository.findById(fileId);

            if (file.isPresent()) {
                ReviewFile deleteFile = file.get();
                String objectKey = "prj3/review/" + review.getId() + "/" + fileName;
                deleteFile(objectKey);
                reviewFileRepository.delete(deleteFile);
                review.getFiles().remove(deleteFile);
            }
        }
    }

    // 리뷰 저장
    public void save(ReviewFormDto dto) {
        Member member = memberRepository.findByEmail(dto.getMemberEmail())
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다: " + dto.getMemberEmail()));

        Review review = Review.builder()
                .facilityName(dto.getFacilityName())
                .memberEmail(member)
                .review(dto.getReview())
                .rating(dto.getRating())
                .insertedAt(Instant.now())
                .build();

        List<Integer> tagIds = dto.getTagIds();
        if (tagIds != null && !tagIds.isEmpty()) {
            Set<Tag> tags = tagRepository.findAllByIdIn(tagIds);
            review.setTags(tags);
        }

        reviewRepository.save(review);
        saveFiles(review, dto.getFiles());
    }

    // 리뷰 수정
    public void update(Integer id, ReviewFormDto dto) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("리뷰를 찾을 수 없습니다: " + id));

        if (!review.getMemberEmail().getEmail().equals(dto.getMemberEmail())) {
            throw new SecurityException("자신이 작성한 리뷰만 수정할 수 있습니다.");
        }

        // 1. 리뷰 기본 정보 업데이트
        review.setReview(dto.getReview());
        review.setRating(dto.getRating());

        // 2. 태그 정보 업데이트 (기존 관계 모두 지우고 새로 설정)
        review.getTags().clear();
        List<Integer> tagIds = dto.getTagIds();
        if (tagIds != null && !tagIds.isEmpty()) {
            Set<Tag> tags = tagRepository.findAllByIdIn(tagIds);
            review.setTags(tags);
        }

        // 3. 파일 정보 업데이트
        List<String> deleteFileNames = dto.getDeleteFileNames();
        List<MultipartFile> newFiles = dto.getFiles();

        if (deleteFileNames != null && !deleteFileNames.isEmpty()) {
            deleteFiles(review, deleteFileNames);
        }
        if (newFiles != null && !newFiles.isEmpty()) {
            newFiles(review, newFiles);
        }
    }

    public void delete(Integer id, String requesterEmail) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("리뷰를 찾을 수 없습니다: " + id));

        if (!review.getMemberEmail().getEmail().equals(requesterEmail)) {
            throw new SecurityException("자신이 작성한 리뷰만 삭제할 수 있습니다.");
        }

        // 첨부 파일들 S3에서 삭제(DB는 cascade 있어서 자동 처리)
        for (ReviewFile file : review.getFiles()) {
            String objectKey = "prj3/review/" + id + "/" + file.getId().getName();
            deleteFile(objectKey);
            reviewFileRepository.delete(file);
        }

        // 리뷰 삭제
        reviewRepository.deleteById(id);
    }

    // 특정 시설 리뷰 목록 조회
    public List<ReviewListDto> findAllByFacilityName(String facilityName) {
        return reviewRepository.findAllByFacilityNameOrderByInsertedAtDesc(facilityName)
                .stream()
                .map(this::convertToDto) // private 헬퍼 메소드 사용
                .collect(Collectors.toList());
    }

    // 최신 리뷰 5개 조회
    public List<ReviewListDto> getLatestReviews() {
        return reviewRepository.findTop5ByOrderByInsertedAtDesc()
                .stream()
                .map(this::convertToDto) // private 헬퍼 메소드 사용
                .collect(Collectors.toList());
    }

    // 최신 리뷰 3개 조회
    public List<ReviewListDto> getLatest3Reviews() {
        return reviewRepository.findTop3ByOrderByInsertedAtDesc()
                .stream()
                .map(this::convertToDto) // private 헬퍼 메소드 사용
                .collect(Collectors.toList());
    }

    // 내가 쓴 리뷰 조회
    public List<ReviewListDto> findReviewsByEmail(String email) {
        return reviewRepository.findAllByMemberEmail_Email(email)
                .stream()
                .map(this::convertToDto) // private 헬퍼 메소드 사용
                .collect(Collectors.toList());
    }

    // Private 헬퍼 메소드 추가
    private ReviewListDto convertToDto(Review review) {
        // 리뷰 첨부 이미지들 URL 생성
        List<String> fileUrls = review.getFiles().stream()
                .map(f -> imagePrefix + "prj3/review/" + review.getId() + "/" + f.getId().getName())
                .collect(Collectors.toList());

        // 작성자 프로필 이미지 URL 생성
        String profileImageUrl = null;
        if (review.getMemberEmail() != null && review.getMemberEmail().getFiles() != null && !review.getMemberEmail().getFiles().isEmpty()) {
            MemberFile profileFile = review.getMemberEmail().getFiles().get(0);
            // Member의 ID를 사용해야 합니다.
            profileImageUrl = imagePrefix + "prj3/member/" + review.getMemberEmail().getId() + "/" + profileFile.getId().getName();
        }

        // 태그 정보 DTO로 변환
        List<TagDto> tagDtos = review.getTags().stream()
                .map(tag -> TagDto.builder().id(tag.getId()).name(tag.getName()).build())
                .collect(Collectors.toList());

        return ReviewListDto.builder()
                .id(review.getId())
                .facilityName(review.getFacilityName())
                .memberEmail(review.getMemberEmail().getEmail())
                .memberEmailNickName(review.getMemberEmail().getNickName())
                .review(review.getReview())
                .rating(review.getRating())
                .insertedAt(review.getInsertedAt())
                .profileImageUrl(profileImageUrl)
                .files(fileUrls)
                .tags(tagDtos) // 변환된 태그 DTO 리스트 설정
                .build();
    }

}
