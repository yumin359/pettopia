// import { Accordion, Carousel, Col, Row, Tab, Tabs } from "react-bootstrap";
// import { useState } from "react";
// import { BoardListMini } from "./BoardListMini.jsx";
// import img1 from "../../assets/01.png";
// import img2 from "../../assets/02.jpg";
// import img3 from "../../assets/03.jpg";
// import {ReviewListMini} from "./ReviewListMini.jsx";
//
// export function BoardLayout() {
//   const [activeTab, setActiveTab] = useState("2"); // 탭 상태
//
//   return (
//     <div>
//       {/* Carousel: 이미지 lazy 로딩 및 사이즈 축소 */}
//       <Carousel
//         className="mb-4"
//         style={{ maxHeight: "200px", overflow: "hidden" }}
//       >
//         <Carousel.Item>
//           <img
//             className="d-block w-100"
//             src={img1}
//             alt="1번째 슬라이드"
//             loading="lazy"
//             style={{
//               height: "200px",
//               objectFit: "cover",
//             }}
//           />
//           <Carousel.Caption>
//             <h6>1번째 슬라이드</h6>
//             <p className="d-none d-md-block">똥마려워</p>
//           </Carousel.Caption>
//         </Carousel.Item>
//
//         <Carousel.Item>
//           <img
//             className="d-block w-100"
//             src={img2}
//             alt="2번째 슬라이드"
//             loading="lazy"
//             style={{
//               height: "200px",
//               objectFit: "cover",
//             }}
//           />
//           <Carousel.Caption>
//             <h6>2번째 슬라이드</h6>
//             <p className="d-none d-md-block">피곤하다</p>
//           </Carousel.Caption>
//         </Carousel.Item>
//
//         <Carousel.Item>
//           <img
//             className="d-block w-100"
//             src={img3}
//             alt="3번째 슬라이드"
//             loading="lazy"
//             style={{
//               height: "200px",
//               objectFit: "cover",
//             }}
//           />
//           <Carousel.Caption>
//             <h6>3번째 슬라이드</h6>
//             <p className="d-none d-md-block">집에갈래</p>
//           </Carousel.Caption>
//         </Carousel.Item>
//       </Carousel>
//
//       {/* Row로 탭과 아코디언을 좌우 배치 */}
//       <Row className="my-4">
//         {/* 탭 영역 - 왼쪽 */}
//         <Col xs={12} md={7}>
//           <Tabs
//             activeKey={activeTab}
//             onSelect={(k) => setActiveTab(k)}
//             className="mb-3"
//           >
//             <Tab eventKey="1" title="공지사항">
//               <div className="p-3">공지사항이 없습니다.</div>
//             </Tab>
//             <Tab eventKey="2" title="최신글">
//               <div className="p-3">
//                 {activeTab === "2" && <BoardListMini />}
//               </div>
//             </Tab>
//             <Tab eventKey="3" title="최신리뷰">
//               <div className="p-3">
//                 {activeTab === "3" && <ReviewListMini />}
//               </div>
//             </Tab>
//           </Tabs>
//         </Col>
//
//         {/* 아코디언 영역 - 오른쪽 */}
//         <Col xs={12} md={5}>
//           <Accordion defaultActiveKey="0">
//             <Accordion.Item eventKey="1">
//               <Accordion.Header>여기에는</Accordion.Header>
//               <Accordion.Body>네.</Accordion.Body>
//             </Accordion.Item>
//             <Accordion.Item eventKey="2">
//               <Accordion.Header>무엇을</Accordion.Header>
//               <Accordion.Body>네.</Accordion.Body>
//             </Accordion.Item>
//             <Accordion.Item eventKey="3">
//               <Accordion.Header>만들어야</Accordion.Header>
//               <Accordion.Body>나는 비오는 날이 싫다고</Accordion.Body>
//             </Accordion.Item>
//             <Accordion.Item eventKey="4">
//               <Accordion.Header>할까요</Accordion.Header>
//               <Accordion.Body>...</Accordion.Body>
//             </Accordion.Item>
//           </Accordion>
//         </Col>
//       </Row>
//     </div>
//   );
// }
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export function BoardLayout() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#FAF0E6", // 아이보리 배경
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      {/* 왼쪽 영역 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
          오늘은 어디갈까? 츄르맛집.
        </h1>
        <div style={{ fontSize: "4rem" }}>🐶</div>
        {/* 강아지 아이콘 */}
      </div>

      {/* 오른쪽 영역 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <Button
          variant="outline-dark"
          size="lg"
          onClick={() => navigate("/KakaoMap")}
          style={{ width: "80%", height: "150px" }}
        >
          지도 보러 가기
        </Button>
        <Button
          variant="outline-dark"
          size="lg"
          onClick={() => navigate("/board/list")}
          style={{ width: "80%", height: "150px" }}
        >
          커뮤니티
        </Button>
        <Button
          variant="outline-dark"
          size="lg"
          onClick={() => navigate("/chatbot")}
          style={{ width: "80%", height: "150px" }}
        >
          챗봇
        </Button>
      </div>
    </div>
  );
}
