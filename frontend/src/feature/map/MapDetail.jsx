import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";
import axios from "axios";

export function MapDetail() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const navigate = useNavigate();
  const { user } = useContext(AuthenticationContext);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ 리뷰 목록 가져오기
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

  useEffect(() => {
    fetchReviews();
  }, [decodedName]);

  const handleGoToWrite = () => {
    navigate(`/facility/${encodeURIComponent(decodedName)}/review/add`);
  };

  // ⭐ 수정 버튼
  const handleEdit = (review) => {
    navigate(`/review/edit/${review.id}`, {
      state: { review },
    });
  };

  // ⭐ 삭제 버튼
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`/api/review/delete/${id}`, {
        params: { email: user.email }, // 본인 확인용
      });
      alert("삭제 완료");
      fetchReviews(); // 다시 목록 불러오기
    } catch (err) {
      alert("삭제 실패: " + err.response?.data?.message || err.message);
    }
  };

  // ⭐ 별점 렌더링
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

                {/* ⭐ 본인 리뷰일 경우에만 수정/삭제 버튼 표시 */}
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
