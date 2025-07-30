import { useNavigate } from "react-router-dom";
import { Carousel, Col, Row, Button } from "react-bootstrap";
import { BoardListMini } from "./BoardListMini.jsx";

import img1 from "../../assets/event1.jpg";
import img2 from "../../assets/event2.jpg";
import img3 from "../../assets/event3.jpg";

export function BoardLayout() {
  const navigate = useNavigate();

  const slides = [
    { id: 17, img: img1, title: "유기견 입양 안내", desc: "데려가 주세요" },
    { id: 18, img: img2, title: "길고양이", desc: "길 고양이 밥주지마세요" },
    { id: 19, img: img3, title: "특이한 반려동물", desc: "비쌀듯" },
  ];

  return (
    <div className="container mt-5">
      <Row className="align-items-center">
        <Col xs={12} md={7}>
          <Carousel style={{ maxHeight: "300px", overflow: "hidden" }}>
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
                style={{ cursor: "pointer" }}
              >
                <img
                  className="d-block w-100"
                  src={img}
                  alt={`${idx + 1}번째 슬라이드`}
                  loading="lazy"
                  style={{ height: "300px", objectFit: "cover" }}
                />
                <Carousel.Caption>
                  <h6 style={{ fontSize: "1.25rem" }}>{title}</h6>
                  <p style={{ fontSize: "1rem" }}>{desc}</p>
                </Carousel.Caption>
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
    </div>
  );
}
