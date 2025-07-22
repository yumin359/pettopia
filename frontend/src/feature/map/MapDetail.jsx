import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export function MapDetail() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");

  // 페이지 진입 시 리뷰 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(`review-${decodedName}`);
    if (saved) {
      setReviews(JSON.parse(saved));
    }
  }, [decodedName]);

  // 리뷰 저장
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    const updated = [...reviews, newReview.trim()];
    setReviews(updated);
    localStorage.setItem(`review-${decodedName}`, JSON.stringify(updated));
    setNewReview("");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>📍 시설명: {decodedName}</h2>

      {/* 리뷰 작성 */}
      <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
        <textarea
          placeholder="이 시설에 대한 리뷰를 남겨보세요!"
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: "0.75rem",
            fontSize: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            resize: "none",
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: "0.5rem",
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
      </form>

      {/* 리뷰 목록 */}
      <div style={{ marginTop: "2rem" }}>
        <h4>📝 리뷰 목록</h4>
        {reviews.length === 0 ? (
          <p>아직 리뷰가 없습니다.</p>
        ) : (
          <ul style={{ paddingLeft: "1rem" }}>
            {reviews.map((review, index) => (
              <li key={index} style={{ marginBottom: "0.75rem" }}>
                {review}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MapDetail;
