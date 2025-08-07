import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import { ReviewLikeContainer } from "../like/ReviewLikeContainer.jsx";
import { FavoriteContainer } from "./FavoriteContainer.jsx";
import { get } from "./data/api.jsx";
import axios from "axios";
import ReviewCard from "../review/ReviewCard.jsx";
import ReviewAdd from "../review/ReviewAdd.jsx";
import ReviewPreview from "./ReviewPreview.jsx";

export function MapDetail() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const { user } = useContext(AuthenticationContext);

  const [isWriting, setIsWriting] = useState(false);
  const [facility, setFacility] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingFacility, setLoadingFacility] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [sortBy, setSortBy] = useState("latest");

  const [searchParams] = useSearchParams();
  const reviewRefs = useRef({});

  // 신고 관련 상태들
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingReviewId, setReportingReviewId] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // 시설 정보 조회
  const fetchFacility = async () => {
    setLoadingFacility(true);
    try {
      // 1차 시도: 원본 이름으로
      const res = await get("/pet_facilities/detail", { name: decodedName });
      setFacility(res);
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          // 2차 시도: 검색 API로 정확한 이름 찾기
          const searchRes = await get("/pet_facilities/search", {
            keyword: decodedName,
            limit: 10,
          });

          // content 배열에서 데이터 추출
          const results = searchRes.content || [];

          // 검색 결과에서 정확히 일치하는 것 찾기
          const exactMatch = results.find(
            (item) =>
              item.name === decodedName ||
              item.name.trim() === decodedName.trim(),
          );

          if (exactMatch) {
            setFacility(exactMatch);
          } else if (results.length > 0) {
            // 정확한 일치가 없으면 첫 번째 결과 사용
            setFacility(results[0]);
          } else {
            setFacility(null);
          }
        } catch (searchErr) {
          console.error("검색도 실패:", searchErr);
          setFacility(null);
        }
      } else {
        setFacility(null);
      }
    } finally {
      setLoadingFacility(false);
    }
  };

  // 리뷰 목록 조회
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await axios.get(
        `/api/review/facility/${encodeURIComponent(decodedName)}`,
      );
      setReviews(response.data || []);
    } catch (err) {
      console.error("리뷰 목록 조회 실패:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // 리뷰 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/review/delete/${id}`, {
        data: { email: user.email },
      });
      alert("삭제 완료");
      fetchReviews(); // 리뷰 목록 새로고침
    } catch (err) {
      console.error("리뷰 삭제 실패:", err);
      alert("삭제 실패: " + (err.response?.data?.message || err.message));
    }
  };

  // 리뷰 작성 버튼 핸들러
  const handleGoToWrite = () => {
    setIsWriting(true);
  };

  // 리뷰 저장 완료 핸들러
  const handleReviewSaved = () => {
    setIsWriting(false);
    fetchReviews(); // 리뷰 목록 새로고침
  };

  // 리뷰 작성 취소 핸들러
  const handleReviewCancel = () => {
    setIsWriting(false);
  };

  useEffect(() => {
    fetchFacility();
    fetchReviews();
  }, [decodedName]);

  // 자동 스크롤 및 하이라이트 로직
  useEffect(() => {
    const focusReviewId = searchParams.get("focusReviewId");
    if (focusReviewId && reviews.length > 0) {
      const targetElement = reviewRefs.current[focusReviewId];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        targetElement.classList.add("review-highlight");
        const timer = setTimeout(() => {
          targetElement.classList.remove("review-highlight");
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [reviews, searchParams]);

  // 신고 모달 열기
  const openReportModal = (reviewId) => {
    setReportingReviewId(reviewId);
    setReportReason("");
    setReportModalOpen(true);
  };

  // 신고 모달 닫기
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

  // 리뷰 정렬 (최신순 or 좋아요순)
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "likes") {
      return (b.likeCount || 0) - (a.likeCount || 0);
    } else {
      return new Date(b.insertedAt) - new Date(a.insertedAt);
    }
  });

  // 모든 리뷰에서 이미지 파일 URL을 한 번에 추출합니다.
  // 이 로직은 `MapDetail` 컴포넌트의 렌더링 최상단에 위치하여
  // 모든 이미지 파일을 통합된 배열로 만듭니다.
  const isImageFile = (fileUrl) => {
    const extension = fileUrl.split(".").pop().split("?")[0];
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(
      extension.toLowerCase(),
    );
  };

  const allImagesFromReviews = sortedReviews.flatMap((review) =>
    (review.files || []).filter(isImageFile),
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* 헤더 영역 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ margin: 0 }}>{facility ? facility.name : decodedName}</h2>
        <FavoriteContainer facilityName={decodedName} />
      </div>

      {/* 시설 정보 섹션 */}
      {loadingFacility ? (
        <p>시설 정보 불러오는 중...</p>
      ) : facility ? (
        <div
          style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
          }}
        >
          <div style={{ marginBottom: "0.8rem" }}>
            <strong>📍 도로명 주소:</strong>{" "}
            <span>{facility.roadAddress || "정보 없음"}</span>
          </div>
          <div style={{ marginBottom: "0.8rem" }}>
            <strong>📞 전화번호:</strong>{" "}
            <span>{facility.phoneNumber || "정보 없음"}</span>
          </div>
          <div style={{ marginBottom: "0.8rem" }}>
            <strong>🌐 홈페이지:</strong>{" "}
            {(() => {
              const homepageRaw = facility?.homepage ?? "";
              const homepage = homepageRaw.trim().toLowerCase();
              const isValidHomepage =
                homepage !== "" &&
                homepage !== "정보없음" &&
                homepage !== "정보 없음" &&
                homepage !== "none" &&
                homepage !== "null";

              if (isValidHomepage) {
                return (
                  <a
                    href={facility.homepage}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    {facility.homepage}
                  </a>
                );
              } else {
                return <span>정보 없음</span>;
              }
            })()}
          </div>
          <div style={{ marginBottom: "0.8rem" }}>
            <strong>🏖️ 휴무일:</strong>{" "}
            <span>{facility.holiday || "정보 없음"}</span>
          </div>
          <div>
            <strong>⏰ 운영시간:</strong>{" "}
            <span>{facility.operatingHours || "정보 없음"}</span>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}
        >
          시설 정보를 찾을 수 없습니다.
        </div>
      )}

      {/* 리뷰 작성 섹션 */}
      {!isWriting && (
        <div style={{ marginBottom: "2rem" }}>
          {user ? (
            <button
              onClick={handleGoToWrite}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                backgroundColor: "#ffc107",
                color: "#212529",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#ffb300")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#ffc107")}
            >
              ✍️ 리뷰 작성하기
            </button>
          ) : (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#e7f3ff",
                borderRadius: "6px",
                color: "#004085",
              }}
            >
              💡 로그인한 사용자만 리뷰를 작성할 수 있습니다.
            </div>
          )}
        </div>
      )}

      {/* 리뷰 작성 폼 */}
      {isWriting && (
        <div style={{ marginBottom: "2rem" }}>
          <ReviewAdd
            facilityName={decodedName}
            onSave={handleReviewSaved}
            onCancel={handleReviewCancel}
          />
        </div>
      )}

      {/* 평균 평점 표시 */}
      {reviews.length > 0 && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            backgroundColor: "#fff3cd",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <strong>평균 평점:</strong>
          <span style={{ fontSize: "1.2rem", color: "#f0ad4e" }}>
            {"★".repeat(Math.round(getAverageRating()))}
          </span>
          <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>
            {getAverageRating()} / 5
          </span>
          <span style={{ fontSize: "0.9rem", color: "#666" }}>
            ({reviews.length}개의 리뷰)
          </span>
        </div>
      )}

      {/* 사진, 동영상 목록 - 모든 이미지를 통합하여 한 번에 렌더링 */}
      <div style={{ marginTop: "1.5rem" }}>
        <h3 className="mb-3">🎞 사진•영상 📸</h3>
        {loadingReviews ? (
          <p>불러오는 중...</p>
        ) : allImagesFromReviews.length === 0 ? (
          <p>아직 사진•영상이 없습니다.</p>
        ) : (
          // ReviewCard 컴포넌트를 단일 이미지 갤러리 모드로 한 번만 사용합니다.
          // 이 때 review 객체 대신 모든 이미지 URL이 담긴 배열을 전달해야 합니다.
          // 하지만 ReviewCard는 review 객체를 기대하므로, 임시 review 객체를 만들고 files에 모든 이미지를 넣습니다.
          <ReviewCard
            review={{ files: allImagesFromReviews }}
            showOnlyImages={true}
          />
        )}
      </div>

      {/* 리뷰 목록 섹션 */}
      <div style={{ marginTop: "1.5rem" }}>
        <div
          style={{
            // display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h3 style={{ margin: 0 }}>
            📝 리뷰 목록{" "}
            <span
              style={{
                color: "#6c757d",
                fontWeight: "normal",
                fontSize: "1rem",
              }}
            >
              ({reviews.length}개)
            </span>
          </h3>

          {reviews.length > 0 && (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <label
                htmlFor="sortSelect"
                style={{ fontWeight: "500", margin: 0 }}
              >
                정렬:
              </label>
              <select
                id="sortSelect"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "6px",
                  border: "1px solid #ced4da",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  minWidth: "120px",
                }}
              >
                <option value="latest">최신순</option>
                <option value="likes">좋아요순</option>
              </select>
            </div>
          )}
        </div>

        {/* 리뷰 리스트 */}
        {loadingReviews ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>리뷰를 불러오는 중...</p>
          </div>
        ) : sortedReviews.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              color: "#6c757d",
            }}
          >
            <p style={{ fontSize: "1.1rem", margin: 0 }}>
              아직 작성된 리뷰가 없습니다.
            </p>
            {user && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.95rem" }}>
                첫 번째 리뷰를 작성해보세요!
              </p>
            )}
          </div>
        ) : (
          <ul style={{ paddingLeft: 0, listStyle: "none" }}>
            {sortedReviews.map((review) => (
              <li
                key={review.id}
                ref={(el) => (reviewRefs.current[review.id] = el)}
                style={{
                  padding: "1.5rem",
                  marginBottom: "1rem",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  transition: "all 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {/* 평점 표시 - 상단에 별도 영역으로 배치 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  <span
                    style={{
                      color: "#f0ad4e",
                      fontSize: "1.2rem",
                    }}
                  >
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                  <span
                    style={{
                      fontWeight: "600",
                      color: "#495057",
                      fontSize: "1rem",
                    }}
                  >
                    {review.rating}.0 / 5.0
                  </span>
                </div>

                {/* 리뷰 카드 컴포넌트 - 이 부분은 showOnlyImages={false}로 작동 */}
                <ReviewCard
                  key={review.id}
                  review={review}
                  onUpdate={fetchReviews}
                  onDelete={handleDelete}
                  showOnlyImages={false}
                />

                {/* 액션 버튼들 */}
                <div
                  style={{
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e9ecef",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <ReviewLikeContainer reviewId={review.id} />

                  <button
                    onClick={() => openReportModal(review.id)}
                    title="리뷰 신고하기"
                    style={{
                      background: "none",
                      border: "1px solid #dc3545",
                      borderRadius: "4px",
                      padding: "0.25rem 0.5rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      color: "#dc3545",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#dc3545";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#dc3545";
                    }}
                  >
                    🚨 신고
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
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
                  fontWeight: "500",
                }}
              >
                신고 사유
              </label>
              <textarea
                id="reportReason"
                rows={5}
                placeholder="신고 사유를 구체적으로 작성해주세요."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  resize: "vertical",
                  minHeight: "120px",
                }}
              />
              <small
                style={{
                  color: "#6c757d",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                허위 신고는 제재 대상이 될 수 있습니다.
              </small>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={closeReportModal}
                disabled={reportLoading}
                style={{
                  padding: "0.6rem 1.5rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: reportLoading ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  opacity: reportLoading ? 0.6 : 1,
                }}
              >
                취소
              </button>
              <button
                onClick={submitReport}
                disabled={reportLoading || !reportReason.trim()}
                style={{
                  padding: "0.6rem 1.5rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    reportLoading || !reportReason.trim()
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  opacity: reportLoading || !reportReason.trim() ? 0.6 : 1,
                }}
              >
                {reportLoading ? "신고 중..." : "신고하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 스타일 정의 */}
      <style>{`
        .review-highlight {
          background-color: #fffbe5 !important;
          border-color: #ffc107 !important;
          box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25) !important;
          animation: highlight-fade 2.5s ease-out;
        }
        
        @keyframes highlight-fade {
          0% {
            background-color: #fff3cd;
            transform: scale(1.02);
          }
          50% {
            background-color: #fffbe5;
            transform: scale(1);
          }
          100% {
            background-color: #fffbe5;
          }
        }
      `}</style>
    </div>
  );
}

export default MapDetail;