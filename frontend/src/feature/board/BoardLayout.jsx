import { Accordion, Carousel, Col, Row, Tab, Tabs, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BoardListMini } from "./BoardListMini.jsx";

import img1 from "../../assets/01.png";
import img2 from "../../assets/02.jpg";
import img3 from "../../assets/03.jpg";

export function BoardLayout() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      {/* 상단: 슬라이드와 버튼 3개 */}
      <Row className="align-items-center">
        {/* 왼쪽: 슬라이드 */}
        <Col xs={12} md={7}>
          <Carousel style={{ maxHeight: "300px", overflow: "hidden" }}>
            {[img1, img2, img3].map((img, idx) => (
              <Carousel.Item key={idx}>
                <img
                  className="d-block w-100"
                  src={img}
                  alt={`${idx + 1}번째 슬라이드`}
                  loading="lazy"
                  style={{ height: "300px", objectFit: "cover" }}
                />
                <Carousel.Caption>
                  <h6 style={{ fontSize: "1.25rem" }}>{`${idx + 1}번째 슬라이드`}</h6>
                  <p style={{ fontSize: "1rem" }}>
                    {idx === 0 ? "똥마려워" : idx === 1 ? "피곤하다" : "집에갈래"}
                  </p>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>

        {/* 오른쪽: 버튼 3개 */}
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
              { text: "이벤트", path: "/board/list" },
              { text: "문의하기", path: "/service" },
            ].map(({ text, path }) => (
              <Button
                key={text}
                variant="outline-dark"
                size="lg"
                onClick={() => navigate(path)}
                style={{ width: "80%", height: "100px", fontSize: "1.5rem" }} // 여기 fontSize 1.5rem로 변경
              >
                {text}
              </Button>
            ))}
          </div>
        </Col>
      </Row>

      {/* 하단: 공지사항 미리보기 */}
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
