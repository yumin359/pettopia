import { useEffect, useState } from "react";
import axios from "axios";

export function MyReview() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios.get("/api/review/myreview")
      .then((res) => setReviews(res.data))
      .catch((err) => console.error("리뷰 불러오기 실패", err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">내가 쓴 리뷰</h2>
      {reviews.length === 0 ? (
        <p>작성한 리뷰가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="p-4 border rounded-lg">
              <div className="font-semibold">{review.facilityName}</div>
              <div>{review.review}</div>
              <div>⭐ {review.rating}</div>
              <div className="text-gray-500 text-sm">
                {new Date(review.insertedAt).toLocaleString()}
              </div>
              {review.files && (
                <div className="mt-2 flex gap-2">
                  {review.files.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`첨부 이미지 ${i + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
