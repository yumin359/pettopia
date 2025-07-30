import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Col, Image, Row, Spinner } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export function ReviewListMini() {
  const [reviews, setReviews] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/review/latest")
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, []);

  if (!reviews) {
    return (
      <Row className="justify-content-center mt-4">
        <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px" }}>
          <Spinner animation="border" />
        </Col>
      </Row>
    );
  }

  if (reviews.length === 0) {
    return (
      <Row className="justify-content-center mt-4">
        <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px" }}>
          <p className="text-muted text-center">아직 작성된 리뷰가 없습니다.</p>
        </Col>
      </Row>
    );
  }

  const isImageFile = (fileUrl) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl.split("?")[0]);
  };

  function handleFacilityButton(facilityName) {
    navigate(`/facility/${encodeURIComponent(facilityName)}`);
  }

  return (
    <Row className="justify-content-center mt-4">
      <Col xs={12} md={10} lg={8} style={{ maxWidth: "900px" }}>
        <h5 className="mb-3">📝 최신 리뷰 피드</h5>
        <div className="d-flex flex-column gap-3">
          {reviews.map((r) => (
            // 이거랑
            // <Card key={r.id} className="shadow border-0 rounded-4 p-4">
            //   <div className="d-flex justify-content-between mb-2">
            //     <div className="d-flex align-items-center gap-2 fw-bold">
            //       <div
            //         className="bg-secondary text-white rounded-circle d-flex justify-content-center align-items-center"
            //         style={{ width: "32px", height: "32px", fontSize: "14px" }}
            //       >
            //         <FaUser />
            //       </div>
            //       {r.memberEmailNickName ?? "익명 사용자"}
            //     </div>
            //     <small className="text-muted">
            //       {r.insertedAt?.split("T")[0]}
            //     </small>
            //   </div>
            //
            //   <div
            //     className="mb-2 text-primary fw-semibold"
            //     style={{ cursor: "pointer" }}
            //     title="이 시설 페이지로 이동합니다"
            //     onClick={() => handleFacilityButton(r.facilityName)}
            //   >
            //     📍 {r.facilityName}
            //   </div>
            //
            //   <div className="mb-2 text-warning">
            //     {"⭐️".repeat(r.rating)} ({r.rating}점)
            //   </div>
            //
            //   {Array.isArray(r.files) && r.files.length > 0 && (
            //     <div className="mb-3">
            //       <div className="d-flex flex-wrap gap-2">
            //         {r.files.filter(isImageFile).map((file, idx) => (
            //           <Image
            //             key={idx}
            //             src={file}
            //             alt={`첨부 이미지 ${idx + 1}`}
            //             className="shadow-sm rounded-3"
            //             style={{
            //               width: "100px",
            //               height: "100px",
            //               objectFit: "cover",
            //               cursor: "pointer",
            //             }}
            //             title="이미지를 클릭해 확대"
            //           />
            //         ))}
            //       </div>
            //     </div>
            //   )}
            //
            //   <div style={{ whiteSpace: "pre-wrap" }}>
            //     {r.review.length > 200
            //       ? r.review.slice(0, 200) + "..."
            //       : r.review}
            //   </div>
            // </Card>

            // TODO 날짜(몇시간전 그런식으로 바꾸기)

            // 이거 ..
            <Card key={r.id} className="shadow-sm border-0 p-3">
              <Row>
                {/* 작성자 + 날짜 */}
                <Col md={4} className="border-end pe-3 text-muted">
                  <div className="fw-bold mb-2">
                    <FiUser className="me-1" />
                    {r.memberEmailNickName ?? "익명 사용자"}
                  </div>
                  <div>{r.insertedAt?.split("T")[0]}</div>
                </Col>

                {/* 리뷰 내용 */}
                <Col md={8} className="ps-3">
                  {/* 시설 이름 */}
                  <div
                    className="mb-1 text-primary fw-semibold"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleFacilityButton(r.facilityName)}
                  >
                    📍 {r.facilityName}
                  </div>

                  {/* 평점 */}
                  <div className="mb-2 text-warning">
                    {"⭐️".repeat(r.rating)} ({r.rating}점)
                  </div>

                  {/* 이미지가 있으면 */}
                  {Array.isArray(r.files) &&
                    r.files.filter(isImageFile).length > 0 && (
                      <div className="d-flex flex-wrap gap-3 mb-3">
                        {r.files.filter(isImageFile).map((file, idx) => (
                          <Image
                            key={idx}
                            src={file}
                            alt={`첨부 이미지 ${idx + 1}`}
                            className="shadow rounded"
                            style={{ maxWidth: "100px", objectFit: "cover" }}
                          />
                        ))}
                      </div>
                    )}

                  {/* 리뷰 본문 */}
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {r.review.length > 200
                      ? r.review.slice(0, 200) + "..."
                      : r.review}
                  </div>
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      </Col>
    </Row>
  );
}
