import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { ReviewLikeContainer } from "../like/ReviewLikeContainer.jsx";
import { FavoriteContainer } from "../kakaoMap/FavoriteContainer.jsx";
import { get } from "../kakaoMap/data/api.jsx";
import axios from "axios";
import ReviewCard from "../review/ReviewCard.jsx";
import ReviewAdd from "../review/ReviewAdd.jsx";
import FacilityInfoCard from "./FacilityInfoCard.jsx";
import MapPreviewCard from "./MapPreviewCard.jsx";
import ReviewStatsCard from "./ReviewStatusCard.jsx";

export function MapDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthenticationContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // 상태 관리
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

  // 데이터 조회 함수들
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

  // 리뷰 관련 핸들러들
  const handleUpdate = (reviewId) => {
    fetchReviews();
    setSearchParams({ focusReviewId: reviewId });
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/review/delete/${reviewId}`, {
        data: { email: user.email },
      });
      alert("삭제 완료");
      setSearchParams({ focusReviewId: "" });
      fetchReviews();
    } catch (err) {
      console.error("리뷰 삭제 실패:", err);
      alert("삭제 실패: " + (err.response?.data?.message || err.message));
    }
  };

  const handleGoToWrite = () => setIsWriting(true);
  const handleReviewSaved = (reviewId) => {
    setIsWriting(false);
    fetchReviews();
    setSearchParams({ focusReviewId: reviewId });
  };
  const handleReviewCancel = () => setIsWriting(false);

  // 신고 관련 핸들러들
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

  // 유틸리티 함수들
  const getAverageRating = () => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const isImageFile = (fileUrl) => {
    const ext = fileUrl.split(".").pop().split("?")[0];
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext.toLowerCase());
  };

  const allImagesFromReviews = reviews.flatMap((review) =>
    (review.files || []).filter(isImageFile),
  );

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

  // useEffect 훅들
  useEffect(() => {
    fetchFacility();
    fetchReviews();
  }, [id, sortBy]);

  useEffect(() => {
    const focusReviewId = searchParams.get("focusReviewId");
    if (focusReviewId && reviews.length > 0) {
      const el = reviewRefs.current[focusReviewId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("bg-warning", "bg-opacity-25", "rounded", "p-2");
        const timer = setTimeout(() => {
          el.classList.remove("bg-warning", "bg-opacity-25", "rounded", "p-2");
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [reviews, searchParams]);

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: "1400px" }}>
      {/* 헤더 섹션 */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-lg bg-primary text-white">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="display-6 fw-bold mb-2">
                    {loadingFacility
                      ? "불러오는 중..."
                      : facility
                        ? facility.name
                        : "시설 정보 없음"}
                  </h1>
                  <p className="opacity-75 mb-0">
                    <i className="bi bi-geo-alt me-2"></i>
                    반려동물과 함께하는 특별한 공간
                  </p>
                </div>
                {facility && facility.id && (
                  <FavoriteContainer
                    facilityName={facility.name}
                    facilityId={facility.id}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 시설 정보 및 지도 섹션 */}
      <div className="row mb-5 g-4">
        <div className="col-lg-7">
          <FacilityInfoCard facility={facility} loading={loadingFacility} />
        </div>
        <div className="col-lg-5">
          <MapPreviewCard facility={facility} />
        </div>
      </div>

      {/* 리뷰 작성 버튼 */}
      {!isWriting && (
        <div className="row mb-4">
          <div className="col-12 text-center">
            {user ? (
              <button
                onClick={handleGoToWrite}
                className="btn btn-warning btn-lg px-5 py-3 fw-bold shadow"
              >
                <i className="bi bi-pencil-square me-3 fs-5"></i>
                리뷰 작성하기
              </button>
            ) : (
              <div className="alert alert-info border-0 shadow">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                  <div>
                    <h6 className="alert-heading mb-1">로그인이 필요합니다</h6>
                    <p className="mb-0">
                      로그인한 사용자만 리뷰를 작성할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 리뷰 작성 폼 */}
      {isWriting && facility && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow">
              <div className="card-body p-4">
                <ReviewAdd
                  facility={facility}
                  onSave={handleReviewSaved}
                  onCancel={handleReviewCancel}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 평균 평점 통계 */}
      {reviews.length > 0 && (
        <ReviewStatsCard reviews={reviews} averageRating={getAverageRating()} />
      )}

      {/* 사진/영상 갤러리 */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow">
            <div className="card-header bg-info text-white">
              <div className="d-flex align-items-center">
                <i className="bi bi-camera-fill me-3 fs-4"></i>
                <div>
                  <h4 className="card-title mb-0">사진 & 영상</h4>
                  <small className="opacity-75">
                    Photos & Videos from Reviews
                  </small>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              {loadingReviews ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">사진을 불러오는 중...</p>
                </div>
              ) : allImagesFromReviews.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-images text-muted display-4"></i>
                  <h5 className="mt-3 text-muted">
                    아직 업로드된 사진이 없습니다
                  </h5>
                  <small className="text-muted">
                    첫 번째 사진을 공유해보세요!
                  </small>
                </div>
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
          <div className="card border-0 shadow">
            <div className="card-header bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <i className="bi bi-chat-quote-fill me-3 fs-4"></i>
                  <div>
                    <h4 className="card-title mb-0">
                      리뷰 목록
                      <span className="badge bg-light text-dark ms-2">
                        {reviews.length}
                      </span>
                    </h4>
                    <small className="opacity-75">
                      User Reviews & Experiences
                    </small>
                  </div>
                </div>

                {reviews.length > 0 && (
                  <div className="d-flex align-items-center">
                    <label htmlFor="sortSelect" className="me-2 mb-0 fw-bold">
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
            </div>

            <div className="card-body p-4">
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
                  <h5 className="mt-3 fw-bold text-muted">
                    아직 작성된 리뷰가 없습니다
                  </h5>
                  {user && (
                    <p className="text-muted">첫 번째 리뷰를 작성해보세요!</p>
                  )}
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {sortedReviews.map((review, index) => (
                    <div
                      key={review.id}
                      ref={(el) => (reviewRefs.current[review.id] = el)}
                      className={`list-group-item px-0 py-4 ${index < sortedReviews.length - 1 ? "border-bottom" : ""}`}
                    >
                      {/* 평점 */}
                      <div className="d-flex align-items-center mb-3">
                        <span className="text-warning fs-4 me-3">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                        <span className="fw-bold fs-5 text-dark">
                          {review.rating}.0 / 5.0
                        </span>
                      </div>

                      {/* 리뷰 카드 */}
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        showOnlyImages={false}
                      />

                      {/* 액션 버튼 */}
                      <div className="d-flex align-items-center gap-3 mt-4 pt-3 border-top">
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
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">
                  <i className="bi bi-flag-fill text-danger me-2"></i>
                  리뷰 신고하기
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeReportModal}
                  disabled={reportLoading}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="reportReason" className="form-label fw-bold">
                    신고 사유
                  </label>
                  <textarea
                    id="reportReason"
                    className="form-control"
                    rows={4}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="신고 사유를 자세히 작성해주세요."
                  />
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeReportModal}
                  disabled={reportLoading}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={submitReport}
                  disabled={reportLoading}
                >
                  {reportLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      신고 중...
                    </>
                  ) : (
                    "신고하기"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
