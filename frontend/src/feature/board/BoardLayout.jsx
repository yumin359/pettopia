import { useNavigate } from "react-router-dom";
import { Carousel, Col, Row, Button } from "react-bootstrap";
import { BoardListMini } from "./BoardListMini.jsx";
import { useContext } from "react";
import { AuthenticationContext } from "../../common/AuthenticationContextProvider.jsx";

import img1 from "../../assets/event1.jpg";
import img2 from "../../assets/event2.jpg";
import img3 from "../../assets/event3.jpg";

export function BoardLayout() {
  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthenticationContext);

  const slides = [
    { id: 17, img: img1, title: "유기견 입양 안내" },
    { id: 18, img: img2, title: "길고양이" },
    { id: 19, img: img3, title: "특이한 반려동물" },
  ];

  return (
    <div className="container mt-5">
      <Row className="align-items-center">
        <Col xs={12} md={7}>
          <Carousel
            style={{ maxHeight: "360px", overflow: "hidden", position: "relative" }}
          >
            {slides.map(({ id, img, title, desc }, idx) => (
              <Carousel.Item
                key={id}
                onClick={() => {
                  if (id === 19) {
                    window.open("https://www.youtube.com/watch?v=0dQBxYc_8ZM", "_blank");
                  } else {
                    navigate(`/board/${id}`);
                  }
                }}
                style={{ cursor: "pointer", position: "relative", height: "360px" }}
              >
                <img
                  className="d-block w-100"
                  src={img}
                  alt={`${idx + 1}번째 슬라이드`}
                  loading="lazy"
                  style={{ height: "360px", objectFit: "cover" }}
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
                  <p style={{ margin: 0, fontSize: "1rem" }}>{desc}</p>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>

        <Col xs={12} md={5} className="mt-4 mt-md-0">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {[
              { text: "지도", path: "/KakaoMap" },
              { text: "최신 리뷰", path: "/review/latest" },
              { text: "문의하기", path: "/service" },
              ...(isAdmin()
                ? [{ text: "문의내역보기", path: "/service/list" }]
                : []),
            ].map(({ text, path }) => (
              <Button
                key={text}
                variant="outline-dark"
                size="lg"
                onClick={() => navigate(path)}
                style={{ width: "80%", height: "100px", fontSize: "1.5rem" }}
              >
                {text}
              </Button>
            ))}
          </div>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <h5 style={{ fontSize: "1.5rem", fontWeight: "600" }}>공지사항</h5>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <BoardListMini fontSize="1.25rem" iconSize={18} />
          </div>
        </Col>
      </Row>

      {/* 관리자 전용 하단 버튼 영역 */}
      {isAdmin() && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center gap-3">
            <Button
              variant="outline-warning"
              size="sm"
              onClick={() => navigate("/member/list")}
              style={{ minWidth: "120px" }}
            >
              회원목록 (관리자)
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => navigate("/service/list")}
              style={{ minWidth: "120px" }}
            >
              문의내역보기 (관리자)
            </Button>
          </Col>
        </Row>
      )}
    </div>
  );
}
