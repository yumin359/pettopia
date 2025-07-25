import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import axios from "axios";

export function MapDetail() {
  const { name } = useParams(); // URL에서 시설명 받기
  const decodedName = decodeURIComponent(name);
  const navigate = useNavigate();
  const { user } = useContext(AuthenticationContext);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("/api/review/list", {
          params: { facilityName: decodedName },
        });
        setReviews(res.data || []);
      } catch (err) {
        console.error("리뷰 목록 조회 실패:", err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [decodedName]);

  const handleGoToWrite = () => {
    navigate(`/facility/${encodeURIComponent(decodedName)}/review/add`);
  };

  // ⭐ 별점 시각화 함수
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < rating ? "#ffc107" : "#e4e5e9" }}>★</span>
    ));
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2>📍 시설명: {decodedName}</h2>

      {user ? (
        <button
          onClick={handleGoToWrite}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1.2rem",
            fontSize: "1rem",
            backgroundColor: "#007bff",
            color: "white",
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

      <div style={{ marginTop: "2rem" }}>
        <h4>📝 리뷰 목록</h4>
        {loading ? (
          <p>불러오는 중...</p>
        ) : reviews.length === 0 ? (
          <p>아직 리뷰가 없습니다.</p>
        ) : (
          <ul style={{ paddingLeft: 0, listStyle: "none" }}>
            {reviews.map((r, index) => (
              <li
                key={index}
                style={{
                  padding: "1rem",
                  marginBottom: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div style={{ marginBottom: "0.5rem" }}>{renderStars(r.rating)}</div>
                <p style={{ whiteSpace: "pre-wrap", margin: "0.5rem 0" }}>{r.review}</p>
                <small>
                  작성자: {r.memberEmailNickName || "알 수 없음"} |{" "}
                  {r.insertedAt?.split("T")[0] || "날짜 없음"}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MapDetail;
