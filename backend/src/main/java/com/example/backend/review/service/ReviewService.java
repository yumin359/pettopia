package com.example.backend.review.service;

import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.MemberFile;
import com.example.backend.petFacility.dto.PetFacilitySimpleDto;
import com.example.backend.petFacility.entity.PetFacility;
import com.example.backend.petFacility.repository.PetFacilityRepository;
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
import com.example.backend.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final PetFacilityRepository petFacilityRepository;
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
                    .acl(ObjectCannedACL.PUBLIC_READ)
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (Exception e) {
            throw new RuntimeException("파일 업로드 실패: " + objectKey, e);
        }
    }

    // ✨ S3에서 파일 삭제 메서드 추가
    private void deleteFileFromS3(String objectKey) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            System.out.println("S3 파일 삭제 성공: " + objectKey);
        } catch (Exception e) {
            System.out.println("S3 파일 삭제 실패: " + objectKey + ", 오류: " + e.getMessage());
        }
    }

    // 리뷰 사진 저장 (DB 저장 + S3 업로드)
    private void saveFiles(Review review, List<MultipartFile> files) {
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file != null && file.getSize() > 0) {
                    String originalFileName = file.getOriginalFilename();

                    // ✨ 파일명을 안전하게 변환
                    String safeFileName = createSafeFileName(originalFileName);
                    String uuidFileName = UUID.randomUUID().toString() + "_" + safeFileName;

                    System.out.println("원본 파일명: " + originalFileName);
                    System.out.println("안전한 파일명: " + safeFileName);
                    System.out.println("최종 파일명: " + uuidFileName);

                    ReviewFile reviewFile = new ReviewFile();
                    ReviewFileId reviewFileId = new ReviewFileId();
                    reviewFileId.setReviewId(review.getId());
                    reviewFileId.setName(uuidFileName);
                    reviewFile.setReview(review);
                    reviewFile.setId(reviewFileId);
                    reviewFileRepository.save(reviewFile);

                    String objectKey = "prj3/review/" + review.getId() + "/" + uuidFileName;
                    uploadFile(file, objectKey);
                }
            }
        }
    }

    // ✨ 안전한 파일명 생성 메서드 추가
    private String createSafeFileName(String originalFileName) {
        if (originalFileName == null) {
            return "file";
        }

        // 파일 확장자 분리
        String extension = "";
        int lastDotIndex = originalFileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            extension = originalFileName.substring(lastDotIndex);
            originalFileName = originalFileName.substring(0, lastDotIndex);
        }

        // 한글, 공백, 특수문자를 영어/숫자로 변환
        String safeFileName = originalFileName
                .replaceAll("[가-힣]", "korean")  // 한글을 "korean"으로 변경
                .replaceAll("\\s+", "_")         // 공백을 언더스코어로
                .replaceAll("[^a-zA-Z0-9_-]", "") // 영어, 숫자, 언더스코어, 하이픈만 허용
                .replaceAll("_{2,}", "_");       // 연속된 언더스코어를 하나로

        // 빈 문자열이면 기본값 사용
        if (safeFileName.isEmpty()) {
            safeFileName = "file";
        }

        return safeFileName + extension;
    }

    private void newFiles(Review review, List<MultipartFile> newFiles) {
        saveFiles(review, newFiles);
    }

    // ✨ 수정된 deleteFiles 메서드 (디버깅 포함)
    private void deleteFiles(Review review, List<String> deleteFileNames) {
        System.out.println("=== 파일 삭제 시작 ===");
        System.out.println("Review ID: " + review.getId());
        System.out.println("Delete file names: " + deleteFileNames);

        // 현재 리뷰의 모든 파일 출력
        System.out.println("Current review files:");
        review.getFiles().forEach(f -> {
            System.out.println("  - " + f.getId().getName());
        });

        for (String fileName : deleteFileNames) {
            System.out.println("삭제 시도할 파일: " + fileName);

            // ✨ 직접 매칭 시도
            boolean found = false;
            for (ReviewFile reviewFile : review.getFiles()) {
                String dbFileName = reviewFile.getId().getName();

                // ✨ 여러 방법으로 매칭 시도
                if (dbFileName.equals(fileName) ||
                        dbFileName.equals(decodeFileName(fileName)) ||
                        encodeFileName(dbFileName).equals(fileName)) {

                    System.out.println("매칭 성공: DB=" + dbFileName + ", 요청=" + fileName);

                    String objectKey = "prj3/review/" + review.getId() + "/" + dbFileName;
                    System.out.println("S3에서 삭제할 objectKey: " + objectKey);

                    try {
                        deleteFileFromS3(objectKey);
                        reviewFileRepository.delete(reviewFile);
                        review.getFiles().remove(reviewFile);
                        System.out.println("파일 삭제 성공: " + dbFileName);
                        found = true;
                        break;
                    } catch (Exception e) {
                        System.out.println("파일 삭제 실패: " + dbFileName + ", 오류: " + e.getMessage());
                    }
                }
            }

            if (!found) {
                System.out.println("매칭되는 파일을 찾을 수 없음: " + fileName);
            }
        }
        System.out.println("=== 파일 삭제 완료 ===");
    }

    // ✨ 파일명 디코딩 헬퍼 메서드
    private String decodeFileName(String fileName) {
        try {
            return java.net.URLDecoder.decode(fileName, "UTF-8");
        } catch (Exception e) {
            return fileName;
        }
    }

    // ✨ 파일명 인코딩 헬퍼 메서드
    private String encodeFileName(String fileName) {
        try {
            return java.net.URLEncoder.encode(fileName, "UTF-8");
        } catch (Exception e) {
            return fileName;
        }
    }

    // 리뷰 저장
    public void save(ReviewFormDto dto) {
        Member member = memberRepository.findByEmail(dto.getMemberEmail())
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다: " + dto.getMemberEmail()));

        PetFacility petFacility = petFacilityRepository.findById(dto.getFacilityId())
                .orElseThrow(() -> new NoSuchElementException("시설을 찾을 수 없습니다: " + dto.getFacilityId()));

        Review review = Review.builder()
                .petFacility(petFacility)
                .memberEmail(member)
                .review(dto.getReview())
                .rating(dto.getRating())
                .insertedAt(Instant.now())
                .build();

        Set<Tag> tags = processTags(dto.getTagNames());
        review.setTags(tags);

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

        review.setReview(dto.getReview());
        review.setRating(dto.getRating());

        review.getTags().clear();
        Set<Tag> tags = processTags(dto.getTagNames());
        review.setTags(tags);

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

        for (ReviewFile file : review.getFiles()) {
            String objectKey = "prj3/review/" + id + "/" + file.getId().getName();
            deleteFileFromS3(objectKey);
            reviewFileRepository.delete(file);
        }

        reviewRepository.deleteById(id);
    }

    // 특정 시설 리뷰 목록 조회 (최신순)
    public List<ReviewListDto> findAllByFacilityId(Long facilityId) {
        return reviewRepository.findAllByPetFacility_IdOrderByInsertedAtDesc(facilityId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // 최신 리뷰 N개 조회
    public List<ReviewListDto> getLatestReviews(Integer limit) {
        if (limit == null || limit <= 0) {
            limit = 5;
        }
        if (limit > 100) {
            limit = 100;
        }

        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "insertedAt"));
        Page<Review> reviewPage = reviewRepository.findAll(pageable);

        return reviewPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // 최신 리뷰 3개 조회
    public List<ReviewListDto> getLatest3Reviews() {
        return reviewRepository.findTop3ByOrderByInsertedAtDesc()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // 내가 쓴 리뷰 조회
    public List<ReviewListDto> findReviewsByMemberId(Long memberId) {
        return reviewRepository.findAllByMemberEmail_IdOrderByInsertedAtDesc(memberId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ★ 좋아요 수 기준 특정 시설 리뷰 목록 조회 (페이징)
    public List<ReviewListDto> findByFacilityIdOrderByLikesDesc(Long facilityId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviewPage = reviewRepository.findByPetFacilityIdOrderByLikesDesc(facilityId, pageable);

        return reviewPage.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // DTO 변환 헬퍼
    private ReviewListDto convertToDto(Review review) {
        List<String> fileUrls = review.getFiles().stream()
                .map(f -> imagePrefix + "prj3/review/" + review.getId() + "/" + f.getId().getName())
                .collect(Collectors.toList());

        String profileImageUrl = null;
        if (review.getMemberEmail() != null && review.getMemberEmail().getFiles() != null && !review.getMemberEmail().getFiles().isEmpty()) {
            MemberFile profileFile = review.getMemberEmail().getFiles().get(0);
            profileImageUrl = imagePrefix + "prj3/member/" + review.getMemberEmail().getId() + "/" + profileFile.getId().getName();
        }

        List<TagDto> tagDtos = review.getTags().stream()
                .map(tag -> TagDto.builder().id(tag.getId()).name(tag.getName()).build())
                .collect(Collectors.toList());

        PetFacility facility = review.getPetFacility();
        PetFacilitySimpleDto facilityDto = PetFacilitySimpleDto.builder()
                .id(facility.getId())
                .name(facility.getName())
                .sidoName(facility.getSidoName())
                .sigunguName(facility.getSigunguName())
                .build();

        return ReviewListDto.builder()
                .id(review.getId())
                .petFacility(facilityDto)
                .memberEmail(review.getMemberEmail().getEmail())
                .memberEmailNickName(review.getMemberEmail().getNickName())
                .review(review.getReview())
                .rating(review.getRating())
                .insertedAt(review.getInsertedAt())
                .profileImageUrl(profileImageUrl)
                .files(fileUrls)
                .memberId(review.getMemberEmail().getId())
                .tags(tagDtos)
                .likesCount((long) (review.getLikes() != null ? review.getLikes().size() : 0))
                .build();
    }

    // 태그 저장 헬퍼
    private Set<Tag> processTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        if (tagNames != null && !tagNames.isEmpty()) {
            for (String tagName : tagNames) {
                if (tagName != null && !tagName.trim().isEmpty()) {
                    Tag tag = tagRepository.findByName(tagName.trim())
                            .orElseGet(() -> tagRepository.save(new Tag(tagName.trim())));
                    tags.add(tag);
                }
            }
        }
        return tags;
    }
}