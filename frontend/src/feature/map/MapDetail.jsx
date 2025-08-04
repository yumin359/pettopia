import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import ReviewPreview from "../map/ReviewPreview.jsx";
import { ReviewLikeContainer } from "../like/ReviewLikeContainer.jsx";
import { FavoriteContainer } from "./FavoriteContainer.jsx";
import { del, get } from "./data/api.jsx";

export function MapDetail() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const navigate = useNavigate();
  const { user } = useContext(AuthenticationContext);

  const [facility, setFacility] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingFacility, setLoadingFacility] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [sortBy, setSortBy] = useState("latest");

  const fetchFacility = async () => {
    setLoadingFacility(true);
    try {
      // 💡 axios.get 대신 get 함수 사용
      const res = await get("/pet_facilities/detail", { name: decodedName });
      setFacility(res);
    } catch (err) {
      console.error("시설 정보 조회 실패:", err);
      setFacility(null);
    } finally {
      setLoadingFacility(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      // 💡 axios.get 대신 get 함수 사용
      const res = await get("/review/list", { facilityName: decodedName });
      setReviews(res || []);
    } catch (err) {
      console.error("리뷰 목록 조회 실패:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    console.log("homepage:", facility?.homepage);
  }, [facility]);

  useEffect(() => {
    fetchFacility();
    fetchReviews();
  }, [decodedName]);

  const handleGoToWrite = () => {
    navigate(`/facility/${encodeURIComponent(decodedName)}/review/add`);
  };

  const handleEdit = (review) => {
    navigate(`/review/edit/${review.id}`, {
      state: { review },
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      // 💡 axios.delete 대신 del 함수 사용
      await del(`/review/delete/${id}`, { email: user.email });
      alert("삭제 완료");
      fetchReviews();
    } catch (err) {
      alert("삭제 실패: " + (err.response?.data?.message || err.message));
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "likes") {
      return (b.likeCount || 0) - (a.likeCount || 0);
    } else {
      return new Date(b.insertedAt) - new Date(a.insertedAt);
    }
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>{facility ? facility.name : decodedName}</h2>
        <FavoriteContainer facilityName={decodedName} />
      </div>

      {loadingFacility ? (
        <p>시설 정보 불러오는 중...</p>
      ) : facility ? (
        <div
          style={{
            marginTop: "0.5rem",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            color: "#444",
          }}
        >
          <div>
            <strong>도로명 주소:</strong>
            {facility.roadAddress || "정보 없음"}
          </div>
          <div>
            <strong>전화번호:</strong>
            {facility.phoneNumber || "정보 없음"}
          </div>
          <div>
            <strong>홈페이지:</strong>{" "}
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
                  <a href={facility.homepage} target="_blank" rel="noreferrer">
                    {facility.homepage}
                  </a>
                );
              } else {
                return <span>정보 없음</span>;
              }
            })()}
          </div>
          <div>
            <strong>휴무일:</strong>
            {facility.holiday || "정보 없음"}
          </div>
          <div>
            <strong>운영시간:</strong>
            {facility.operatingHours || "정보 없음"}
          </div>
        </div>
      ) : (
        <p style={{ color: "red" }}>시설 정보를 찾을 수 없습니다.</p>
      )}

      {user ? (
        <button
          onClick={handleGoToWrite}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1.2rem",
            fontSize: "1rem",
            backgroundColor: "#ffc107",
            color: "#212529",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          리뷰 작성
        </button>
      ) : (
        <p style={{ marginTop: "1rem", color: "gray" }}>
          ✨ 로그인한 사용자만 리뷰를 작성할 수 있습니다.
        </p>
      )}

      {reviews.length > 0 && (
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <strong>평균 평점:</strong>
          <span
            style={{ fontSize: "1.1rem", color: "#f0ad4e", userSelect: "none" }}
            title={`평점: ${getAverageRating()} / 5`}
          >
            ★
          </span>
          <span
            style={{
              fontSize: "1.1rem",
              color: "#212529",
              marginLeft: "0.25rem",
            }}
          >
            {getAverageRating()} / 5
          </span>
          <span style={{ fontSize: "0.9rem", color: "gray" }}>
            ({reviews.length}명)
          </span>
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <h4 className="mb-3">
          📝 리뷰 목록{" "}
          <span style={{ color: "#aaa", fontWeight: "normal" }}>
            ({reviews.length}개)
          </span>
        </h4>

        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="sortSelect"
            style={{ marginRight: "0.5rem", fontWeight: "bold" }}
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
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="latest">최신순</option>
            <option value="likes">좋아요순</option>
          </select>
        </div>

        {loadingReviews ? (
          <p>불러오는 중...</p>
        ) : sortedReviews.length === 0 ? (
          <p>아직 리뷰가 없습니다.</p>
        ) : (
          <ul style={{ paddingLeft: 0, listStyle: "none" }}>
            {sortedReviews.map((r) => (
              <li
                key={r.id}
                style={{
                  position: "relative",
                  padding: "1rem",
                  marginBottom: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    color: "#f0ad4e",
                    padding: "2px 6px",
                    borderRadius: "12px",
                    userSelect: "none",
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    letterSpacing: "2px",
                  }}
                  title={`평점: ${r.rating} / 5`}
                >
                  {"★".repeat(r.rating)}
                  <span style={{ color: "#212529" }}>{r.rating}</span>
                </div>

                <ReviewPreview review={r} />

                <div style={{ marginTop: "0.5rem" }}>
                  <ReviewLikeContainer reviewId={r.id} />
                </div>

                {user?.email === r.memberEmail && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <button
                      onClick={() => handleEdit(r)}
                      style={{
                        marginRight: "0.5rem",
                        padding: "0.3rem 0.8rem",
                        fontSize: "0.9rem",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      style={{
                        padding: "0.3rem 0.8rem",
                        fontSize: "0.9rem",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MapDetail;
