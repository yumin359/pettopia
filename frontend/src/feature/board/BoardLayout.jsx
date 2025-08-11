import { useNavigate } from "react-router-dom";
import { Button, Card, Carousel, Col, Row } from "react-bootstrap";

import img1 from "../../assets/event1.jpg";
import img2 from "../../assets/event2.jpg";
import img3 from "../../assets/event3.jpg";
import { BoardListMini } from "../main/BoardListMini.jsx";
import { ReviewCarousel } from "../main/ReviewCarousel.jsx";

export function BoardLayout() {
  const navigate = useNavigate();
  // const { isAdmin } = useContext(AuthenticationContext); // 안쓰는?

  const slides = [
    { id: 17, img: img1, title: "유기견 입양 안내" },
    { id: 18, img: img2, title: "길고양이" },
    { id: 19, img: img3, title: "특이한 반려동물" },
  ];

  return (
    <div className="container mt-5">
      <Row className="align-items-center">
        <Col xs={12} md={12}>
          {/* 캐루셀 */}
          <Carousel style={{ maxWidth: "1280px", margin: "0 auto" }}>
            {slides.map(({ id, img, title }, idx) => (
              <Carousel.Item
                key={id}
                onClick={() => {
                  if (id === 19) {
                    window.open(
                      "https://www.youtube.com/watch?v=0dQBxYc_8ZM",
                      "_blank",
                    );
                  } else {
                    navigate(`/board/${id}`);
                  }
                }}
                style={{ cursor: "pointer", position: "relative" }}
              >
                <img
                  className="d-block w-100"
                  src={img}
                  alt={`${idx + 1}번째 슬라이드`}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "420px",
                    objectFit: "cover",
                    objectPosition: "center center",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "80px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    color: "white",
                    padding: "10px 15px",
                    boxSizing: "border-box",
                    textAlign: "center",
                    borderRadius: "0 0 8px 8px",
                    lineHeight: 1.2,
                  }}
                >
                  <h6
                    style={{
                      margin: 0,
                      fontWeight: "bold",
                      fontSize: "1.25rem",
                      paddingTop: "4px",
                    }}
                  >
                    {title}
                  </h6>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
      </Row>

      {/* 공지사항과 리뷰 리스트를 반씩 나눠서 배치 */}
      <Row className="mt-4" style={{ maxHeight: "400px" }}>
        <Col md={6} style={{ overflowY: "auto" }}>
          <h5 style={{ fontSize: "1.5rem", fontWeight: "600" }}>공지사항</h5>
          <BoardListMini fontSize="1.25rem" iconSize={18} />
        </Col>

        <Col md={6}>
          <h5 style={{ fontSize: "1.5rem", fontWeight: "600" }}>최신 리뷰</h5>
          <ReviewCarousel />
        </Col>
      </Row>

      {/* 추가 섹션을 위한 여백 */}
      <div className="py-4">
        {/* CTA 섹션 */}
        <Card className="border-0 bg-dark text-white shadow-sm">
          <Card.Body className="p-5 text-center">
            <h4 className="fw-bold mb-3">
              <i className="bi bi-rocket-takeoff me-2"></i>
              이제 디자인을 할 시간입니다 여러분
            </h4>
            <p className="mb-4 opacity-90">
              귀여운 레퍼런스를 많이 찾아주세용 화요일에 모두 회의하여 정하기로
              합시다.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Button
                variant="warning"
                size="lg"
                className="px-4 py-3 fw-bold"
                onClick={() => navigate("/map")}
              >
                <i className="bi bi-geo-alt-fill me-2"></i>내 주변 찾기 할까?
              </Button>
              <Button
                variant="outline-light"
                size="lg"
                className="px-4 py-3"
                onClick={() => navigate("/register")}
              >
                <i className="bi bi-person-plus me-2"></i>
                그냥 버튼
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
