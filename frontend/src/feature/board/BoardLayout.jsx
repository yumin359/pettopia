import { Accordion, Carousel, Col, Row, Tab, Tabs, Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BoardListMini } from "./BoardListMini.jsx";
import { ReviewListMini } from "./ReviewListMini.jsx";
import img1 from "../../assets/01.png";
import img2 from "../../assets/02.jpg";
import img3 from "../../assets/03.jpg";

export function BoardLayout() {
  const [activeTab, setActiveTab] = useState("2");
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <Row className="align-items-center">
        {/* 왼쪽: 슬라이드 */}
        <Col xs={12} md={7}>
          <Carousel style={{ maxHeight: "300px", overflow: "hidden" }}>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src={img1}
                alt="1"
                loading="lazy"
                style={{ height: "300px", objectFit: "cover" }}
              />
              <Carousel.Caption>
                <h6>1번째 슬라이드</h6>
                <p>똥마려워</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src={img2}
                alt="2"
                loading="lazy"
                style={{ height: "300px", objectFit: "cover" }}
              />
              <Carousel.Caption>
                <h6>2번째 슬라이드</h6>
                <p>피곤하다</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src={img3}
                alt="3"
                loading="lazy"
                style={{ height: "300px", objectFit: "cover" }}
              />
              <Carousel.Caption>
                <h6>3번째 슬라이드</h6>
                <p>집에갈래</p>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </Col>

        {/* 오른쪽: 버튼 세 개 */}
        <Col xs={12} md={5} className="mt-4 mt-md-0">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <Button
              variant="outline-dark"
              size="lg"
              onClick={() => navigate("/KakaoMap")}
              style={{ width: "80%", height: "100px" }}
            >
              지도 보러 가기
            </Button>
            <Button
              variant="outline-dark"
              size="lg"
              onClick={() => navigate("/board/list")}
              style={{ width: "80%", height: "100px" }}
            >
              이벤트
            </Button>
            <Button
              variant="outline-dark"
              size="lg"
              onClick={() => navigate("/chatbot")}
              style={{ width: "80%", height: "100px" }}
            >
              최신 리뷰
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
