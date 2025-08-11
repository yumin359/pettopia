import React from "react";
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export function PetopiaHomepage() {
  const navigate = useNavigate();

  const categories = [
    {
      name: "펫카페",
      icon: "bi-cup-hot",
      color: "primary",
      path: "/map?category=카페",
    },
    {
      name: "동물병원",
      icon: "bi-hospital",
      color: "success",
      path: "/map?category=병원",
    },
    {
      name: "펫펜션",
      icon: "bi-house-heart",
      color: "info",
      path: "/map?category=펜션",
    },
    {
      name: "놀이시설",
      icon: "bi-balloon-heart",
      color: "warning",
      path: "/map?category=놀이터",
    },
    {
      name: "미용실",
      icon: "bi-scissors",
      color: "secondary",
      path: "/map?category=미용",
    },
    {
      name: "펫샵",
      icon: "bi-bag-heart",
      color: "danger",
      path: "/map?category=펫샵",
    },
  ];

  const features = [
    {
      icon: "bi-geo-alt-fill",
      color: "primary",
      title: "정확한 위치 정보",
      description: "공공데이터 기반의 신뢰할 수 있는 시설 정보와 카카오맵 연동",
    },
    {
      icon: "bi-funnel-fill",
      color: "success",
      title: "스마트 필터링",
      description: "반려동물 크기, 지역, 주차 가능 여부 등 세세한 조건 검색",
    },
    {
      icon: "bi-chat-heart-fill",
      color: "info",
      title: "진솔한 리뷰",
      description: "실제 방문 경험을 바탕으로 한 솔직한 후기와 사진 공유",
    },
  ];

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      {/* 메인 히어로 섹션 */}
      <div className="text-center mb-5">
        <div className="mb-4">
          <div className="mb-5"></div>
          <h1 className="display-4 fw-bold mb-3">
            반려동물과 함께하는
            <br />
            <span className="text-primary">특별한 하루</span>
          </h1>
          <p className="lead text-muted mb-4">
            우리 아이와 함께 갈 수 있는 모든 곳을 한눈에!
            <br />
            공공데이터 기반의 신뢰할 수 있는 정보로 안전하고 즐거운 나들이를
            계획하세요.
          </p>
        </div>

        <div className="d-flex gap-3 justify-content-center flex-wrap mb-5">
          <Button
            variant="primary"
            size="lg"
            className="px-4 py-3 fw-bold shadow"
            onClick={() => navigate("/map")}
          >
            <i className="bi bi-map me-2"></i>
            지금 찾아보기
          </Button>
          <Button
            variant="outline-primary"
            size="lg"
            className="px-4 py-3"
            onClick={() => navigate("/about")}
          >
            <i className="bi bi-info-circle me-2"></i>더 알아보기
          </Button>
        </div>
      </div>

      {/* 빠른 카테고리 검색 */}
      <Card className="border-0 shadow-sm mb-5">
        <Card.Header className="bg-light border-0">
          <h4 className="mb-0 text-center">
            <i className="bi bi-search text-primary me-2"></i>
            빠른 카테고리 검색
          </h4>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-3">
            {categories.map((category, index) => (
              <Col xs={6} lg={4} key={index}>
                <Button
                  variant={`outline-${category.color}`}
                  className="w-100 py-3 border-2 h-100"
                  onClick={() => navigate(category.path)}
                >
                  <i className={`bi ${category.icon} d-block mb-2 fs-4`}></i>
                  <span className="fw-bold">{category.name}</span>
                </Button>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* 주요 기능 소개 */}
      <div className="mb-5">
        <div className="text-center mb-4">
          <h3 className="fw-bold mb-3">
            <span className="text-primary">PETOPIA</span>가 특별한 이유
          </h3>
          <p className="text-muted">
            공공데이터와 실제 경험이 만나 더욱 신뢰할 수 있는 정보를 제공합니다
          </p>
        </div>

        <Row className="g-4">
          {features.map((feature, index) => (
            <Col lg={4} key={index}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Body className="p-4">
                  <div
                    className={`bg-${feature.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i
                      className={`bi ${feature.icon} text-${feature.color} fs-4`}
                    ></i>
                  </div>
                  <h5 className="fw-bold mb-3">{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 공공데이터 신뢰성 강조 */}
      <Card className="border-0 shadow-sm mb-5">
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <Badge bg="success" className="px-3 py-2 mb-3">
                <i className="bi bi-shield-check me-2"></i>
                공공데이터 기반
              </Badge>
              <h4 className="fw-bold mb-3">
                믿을 수 있는 정보,{" "}
                <span className="text-success">검증된 데이터</span>
              </h4>
              <p className="text-muted mb-4">
                농림축산식품부에서 제공하는 공식 데이터를 기반으로 하여 정확하고
                신뢰할 수 있는 반려동물 동반 시설 정보를 제공합니다.
              </p>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <span className="small">정부 인증 반려동물 동반 시설</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <span className="small">실시간 운영시간 및 휴무일 정보</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <span className="small">정확한 위치 및 연락처 정보</span>
                </div>
              </div>
            </Col>

            <Col lg={6}>
              <Card className="border-0 bg-light">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 rounded p-2 me-3">
                      <i className="bi bi-database text-primary"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">데이터 출처</h6>
                      <small className="text-muted">공공데이터포털</small>
                    </div>
                  </div>
                  <h6 className="fw-bold mb-2">반려동물 동반가능 관광정보</h6>
                  <p className="text-muted small mb-3">
                    농림축산식품부에서 제공하는 전국 반려동물 동반 가능 시설들의
                    상세 정보를 실시간으로 제공합니다.
                  </p>
                  <div className="d-flex gap-1 flex-wrap">
                    <Badge bg="secondary" className="small">
                      카페
                    </Badge>
                    <Badge bg="secondary" className="small">
                      펜션
                    </Badge>
                    <Badge bg="secondary" className="small">
                      병원
                    </Badge>
                    <Badge bg="secondary" className="small">
                      놀이시설
                    </Badge>
                    <Badge bg="secondary" className="small">
                      미용실
                    </Badge>
                    <Badge bg="secondary" className="small">
                      +더보기
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 간단한 사용법 */}
      <div className="mb-5">
        <div className="text-center mb-4">
          <h4 className="fw-bold mb-3">
            간단한 <span className="text-primary">3단계</span>로 시작하기
          </h4>
          <p className="text-muted">
            복잡한 과정 없이 바로 우리 아이와 함께 갈 곳을 찾아보세요
          </p>
        </div>

        <Row className="g-4">
          <Col md={4} className="text-center">
            <div className="mb-3">
              <div
                className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: "50px", height: "50px" }}
              >
                1
              </div>
            </div>
            <h6 className="fw-bold mb-2">
              <i className="bi bi-search text-primary me-2"></i>
              검색하기
            </h6>
            <p className="text-muted small">
              지역, 카테고리, 반려동물 크기 등 원하는 조건으로 검색
            </p>
          </Col>

          <Col md={4} className="text-center">
            <div className="mb-3">
              <div
                className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: "50px", height: "50px" }}
              >
                2
              </div>
            </div>
            <h6 className="fw-bold mb-2">
              <i className="bi bi-map text-success me-2"></i>
              위치 확인
            </h6>
            <p className="text-muted small">
              지도에서 정확한 위치를 확인하고 길찾기로 바로 출발
            </p>
          </Col>

          <Col md={4} className="text-center">
            <div className="mb-3">
              <div
                className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: "50px", height: "50px" }}
              >
                3
              </div>
            </div>
            <h6 className="fw-bold mb-2">
              <i className="bi bi-heart text-warning me-2"></i>
              즐기기
            </h6>
            <p className="text-muted small">
              우리 아이와 함께 즐거운 시간을 보내고 후기를 남겨주세요
            </p>
          </Col>
        </Row>
      </div>

      {/* CTA 섹션 */}
      <Card className="border-0 bg-primary text-white shadow-sm">
        <Card.Body className="p-5 text-center">
          <h4 className="fw-bold mb-3">
            <i className="bi bi-rocket-takeoff me-2"></i>
            지금 바로 시작해보세요!
          </h4>
          <p className="mb-4 opacity-90">
            우리 아이와 함께 할 수 있는 특별한 장소들이 여러분을 기다리고
            있습니다.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button
              variant="warning"
              size="lg"
              className="px-4 py-3 fw-bold"
              onClick={() => navigate("/map")}
            >
              <i className="bi bi-geo-alt-fill me-2"></i>내 주변 찾기
            </Button>
            <Button
              variant="outline-light"
              size="lg"
              className="px-4 py-3"
              onClick={() => navigate("/register")}
            >
              <i className="bi bi-person-plus me-2"></i>
              회원가입하기
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
