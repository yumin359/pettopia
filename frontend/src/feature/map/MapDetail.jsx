import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { ReviewLikeContainer } from "../like/ReviewLikeContainer.jsx";
import { FavoriteContainer } from "./FavoriteContainer.jsx";
import { get } from "./data/api.jsx";
import axios from "axios";
import ReviewCard from "../review/ReviewCard.jsx";
import ReviewAdd from "../review/ReviewAdd.jsx";

export function MapDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthenticationContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const [facility, setFacility] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingFacility, setLoadingFacility] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [isWriting, setIsWriting] = useState(false);

  const reviewRefs = useRef({});

  // 신고 관련 상태
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingReviewId, setReportingReviewId] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // 시설 정보 조회
  const fetchFacility = async () => {
    if (!id) return;
    setLoadingFacility(true);
    try {
      const facilityData = await get(`/pet_facilities/${id}`);
      setFacility(facilityData);
    } catch (err) {
      console.error(`시설 조회 실패 (id=${id}):`, err);
      setFacility(null);
    } finally {
      setLoadingFacility(false);
    }
  };

  // 리뷰 목록 조회 (정렬 옵션 쿼리 파라미터로 전달)
  const fetchReviews = async () => {
    if (!id) return;
    setLoadingReviews(true);
    try {
      const response = await axios.get(`/api/review/facility/${id}`, {
        params: { sort: sortBy },
      });
      setReviews(response.data || []);
    } catch (err) {
      console.error("리뷰 목록 조회 실패:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // 리뷰 삭제
  const handleDelete = async (reviewId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/review/delete/${reviewId}`, {
        data: { email: user.email },
      });
      alert("삭제 완료");
      // 리뷰 삭제 시 focusReviewId는 ""로
      setSearchParams({ focusReviewId: "" });
      fetchReviews();
    } catch (err) {
      console.error("리뷰 삭제 실패:", err);
      alert("삭제 실패: " + (err.response?.data?.message || err.message));
    }
  };

  // 리뷰 작성 모드 토글
  const handleGoToWrite = () => setIsWriting(true);

  // 리뷰 작성 저장 버튼
  const handleReviewSaved = (reviewId) => {
    // 리뷰 작성 모드 닫기
    setIsWriting(false);
    // 리뷰 목록 가져오기
    fetchReviews();
    // 리뷰 생성시 id가 focusid로
    setSearchParams({ focusReviewId: reviewId });
  };

  // 리뷰 작성 취소
  const handleReviewCancel = () => setIsWriting(false);

  // 신고 모달 열기/닫기
  const openReportModal = (reviewId) => {
    setReportingReviewId(reviewId);
    setReportReason("");
    setReportModalOpen(true);
  };
  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportingReviewId(null);
    setReportReason("");
  };

  // 신고 제출
  const submitReport = async () => {
    if (!reportReason.trim()) {
      alert("신고 사유를 입력해주세요.");
      return;
    }
    setReportLoading(true);
    try {
      await axios.post("/api/review/report", {
        reviewId: reportingReviewId,
        reason: reportReason.trim(),
      });
      alert("신고가 접수되었습니다.");
      closeReportModal();
    } catch (error) {
      console.error("신고 실패:", error);
      alert("신고 실패: " + (error.response?.data?.message || error.message));
    } finally {
      setReportLoading(false);
    }
  };

  // 평균 평점 계산
  const getAverageRating = () => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // 이미지 파일 판단
  const isImageFile = (fileUrl) => {
    const ext = fileUrl.split(".").pop().split("?")[0];
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext.toLowerCase());
  };

  // 모든 이미지 파일만 추출
  const allImagesFromReviews = reviews.flatMap((review) =>
    (review.files || []).filter(isImageFile),
  );

  // 정렬된 리뷰 배열 (최신순 또는 좋아요순)
  const sortedReviews = [...reviews];
  if (sortBy === "likes") {
    sortedReviews.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  } else {
    sortedReviews.sort((a, b) => {
      const dateA = new Date(a.insertedAt || a.createdAt || 0);
      const dateB = new Date(b.insertedAt || b.createdAt || 0);
      return dateB - dateA;
    });
  }

  // 정렬 혹은 id 변경 시 데이터 다시 불러오기
  useEffect(() => {
    fetchFacility();
    fetchReviews();
  }, [id, sortBy]);

  // 특정 리뷰 하이라이트 및 스크롤
  useEffect(() => {
    const focusReviewId = searchParams.get("focusReviewId");
    if (focusReviewId && reviews.length > 0) {
      const el = reviewRefs.current[focusReviewId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("review-highlight");
        const timer = setTimeout(
          () => el.classList.remove("review-highlight"),
          2500,
        );
        return () => clearTimeout(timer);
      }
    }
  }, [reviews, searchParams]);

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: "1400px" }}>
      {/* 헤더 */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fw-bold mb-0">
              {loadingFacility
                ? "불러오는 중..."
                : facility
                  ? facility.name
                  : "시설 정보 없음"}
            </h2>
            {facility && facility.id && (
              <FavoriteContainer
                facilityName={facility.name}
                facilityId={facility.id}
              />
            )}
          </div>
        </div>
      </div>

      {/* 시설 정보 및 지도 섹션 */}
      <div className="row mb-4">
        <div className="col-lg-7">
          {loadingFacility ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : facility ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="card-title mb-4 text-primary">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  시설 정보
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-geo-alt-fill text-danger me-3 mt-1"></i>
                      <div>
                        <small className="text-muted">도로명 주소</small>
                        <p className="mb-0 fw-semibold">
                          {facility.roadAddress || "정보 없음"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-telephone-fill text-success me-3 mt-1"></i>
                      <div>
                        <small className="text-muted">전화번호</small>
                        <p className="mb-0 fw-semibold">
                          {facility.phoneNumber || "정보 없음"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-globe text-info me-3 mt-1"></i>
                      <div>
                        <small className="text-muted">홈페이지</small>
                        <p className="mb-0 fw-semibold">
                          {(() => {
                            const homepageRaw = facility?.homepage ?? "";
                            const homepage = homepageRaw.trim().toLowerCase();
                            const isValid =
                              homepage &&
                              homepage !== "정보없음" &&
                              homepage !== "none" &&
                              homepage !== "null";
                            return isValid ? (
                              <a
                                href={facility.homepage}
                                target="_blank"
                                rel="noreferrer"
                                className="text-decoration-none"
                              >
                                {facility.homepage}
                              </a>
                            ) : (
                              "정보 없음"
                            );
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-calendar-x-fill text-warning me-3 mt-1"></i>
                      <div>
                        <small className="text-muted">휴무일</small>
                        <p className="mb-0 fw-semibold">
                          {facility.holiday || "정보 없음"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-clock-fill text-primary me-3 mt-1"></i>
                      <div>
                        <small className="text-muted">운영시간</small>
                        <p className="mb-0 fw-semibold">
                          {facility.operatingHours || "정보 없음"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              시설 정보를 찾을 수 없습니다.
            </div>
          )}
        </div>

        {/* 지도 미리보기 영역 */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-0">
              <div
                className="bg-light d-flex align-items-center justify-content-center rounded"
                style={{ height: "350px" }}
              >
                <div className="text-center text-muted">
                  <i className="bi bi-map display-1"></i>
                  <p className="mt-3">지도 미리보기</p>
                  <small>{facility?.roadAddress || "위치 정보 없음"}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 작성 버튼 */}
      {!isWriting && (
        <div className="row mb-4">
          <div className="col-12">
            {user ? (
              <button
                onClick={handleGoToWrite}
                className="btn btn-warning btn-lg px-4"
              >
                <i className="bi bi-pencil-square me-2"></i>
                리뷰 작성하기
              </button>
            ) : (
              <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle-fill me-2"></i>
                로그인한 사용자만 리뷰를 작성할 수 있습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 리뷰 작성 폼 */}
      {isWriting && facility && (
        <div className="row mb-4">
          <div className="col-12">
            <ReviewAdd
              facility={facility}
              onSave={handleReviewSaved}
              onCancel={handleReviewCancel}
            />
          </div>
        </div>
      )}

      {/* 평균 평점 */}
      {reviews.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-warning d-flex align-items-center">
              <div className="d-flex align-items-center">
                <strong className="me-3">평균 평점:</strong>
                <span className="text-warning fs-4 me-2">
                  {"★".repeat(Math.round(getAverageRating()))}
                </span>
                <span className="fw-bold fs-5 me-3">
                  {getAverageRating()} / 5
                </span>
                <span className="text-muted">({reviews.length}개의 리뷰)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 사진/영상 갤러리 */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">
                <i className="bi bi-camera-fill me-2"></i>
                사진•영상
              </h4>
              {loadingReviews ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : allImagesFromReviews.length === 0 ? (
                <p className="text-muted">아직 사진•영상이 없습니다.</p>
              ) : (
                <ReviewCard
                  review={{ files: allImagesFromReviews }}
                  showOnlyImages={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">
                  <i className="bi bi-chat-quote-fill me-2"></i>
                  리뷰 목록
                  <span className="text-muted fs-6 ms-2">
                    ({reviews.length}개)
                  </span>
                </h4>

                {reviews.length > 0 && (
                  <div className="d-flex align-items-center">
                    <label htmlFor="sortSelect" className="me-2 mb-0">
                      정렬:
                    </label>
                    <select
                      id="sortSelect"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="form-select form-select-sm"
                      style={{ width: "auto" }}
                    >
                      <option value="latest">최신순</option>
                      <option value="likes">좋아요순</option>
                    </select>
                  </div>
                )}
              </div>

              {loadingReviews ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">리뷰를 불러오는 중...</p>
                </div>
              ) : sortedReviews.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-chat-left-text display-1 text-muted"></i>
                  <p className="mt-3 fs-5 text-muted">
                    아직 작성된 리뷰가 없습니다.
                  </p>
                  {user && (
                    <p className="text-muted">첫 번째 리뷰를 작성해보세요!</p>
                  )}
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {sortedReviews.map((review) => (
                    <div
                      key={review.id}
                      ref={(el) => (reviewRefs.current[review.id] = el)}
                      className="list-group-item px-0 py-4 border-bottom"
                    >
                      {/* 평점 */}
                      <div className="d-flex align-items-center mb-3">
                        <span className="text-warning fs-5 me-2">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                        <span className="fw-semibold">
                          {review.rating}.0 / 5.0
                        </span>
                      </div>

                      {/* 리뷰 카드 */}
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onUpdate={fetchReviews}
                        onDelete={handleDelete}
                        showOnlyImages={false}
                      />

                      {/* 액션 버튼 */}
                      <div className="d-flex align-items-center gap-3 mt-3 pt-3 border-top">
                        <ReviewLikeContainer reviewId={review.id} />
                        <button
                          onClick={() => openReportModal(review.id)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          <i className="bi bi-flag-fill me-1"></i>
                          신고
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 신고 모달 */}
      {reportModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={closeReportModal}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1.5rem", color: "#212529" }}>
              🚨 리뷰 신고하기
            </h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="reportReason"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                }}
              >
                신고 사유
              </label>
              <textarea
                id="reportReason"
                rows={4}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontSize: "1rem",
                  borderRadius: "6px",
                  border: "1px solid #ced4da",
                  resize: "vertical",
                }}
                placeholder="신고 사유를 자세히 작성해주세요."
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button
                onClick={closeReportModal}
                disabled={reportLoading}
                style={{
                  padding: "0.5rem 1.25rem",
                  fontSize: "1rem",
                  borderRadius: "6px",
                  border: "1px solid #6c757d",
                  backgroundColor: "#e9ecef",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#dee2e6")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e9ecef")
                }
              >
                취소
              </button>
              <button
                onClick={submitReport}
                disabled={reportLoading}
                style={{
                  padding: "0.5rem 1.25rem",
                  fontSize: "1rem",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#dc3545",
                  color: "white",
                  cursor: reportLoading ? "not-allowed" : "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  !reportLoading &&
                  (e.currentTarget.style.backgroundColor = "#c82333")
                }
                onMouseOut={(e) =>
                  !reportLoading &&
                  (e.currentTarget.style.backgroundColor = "#dc3545")
                }
              >
                {reportLoading ? "신고 중..." : "신고하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
