import React from "react";
import { Container } from "react-bootstrap";

export function AppFooter() {
  return (
    <footer className="border-top bg-light py-3 mt-auto">
      <Container>
        <div className="row align-items-center">
          {/* 왼쪽: 프로젝트 정보 */}
          <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <i className="bi bi-heart-fill text-warning me-2 fs-5"></i>
              <span className="fw-bold text-dark fs-6">PETOPIA</span>
              <span className="text-muted ms-2 small">Portfolio Project</span>
            </div>
          </div>

          {/* 오른쪽: 팀원 & 저작권 */}
          <div className="col-md-6 text-center text-md-end">
            <div className="mb-1">
              <span className="text-dark fw-semibold small me-2">최지원</span>
              <span className="text-muted small me-2">•</span>
              <span className="text-dark fw-semibold small me-2">신유민</span>
              <span className="text-muted small me-2">•</span>
              <span className="text-dark fw-semibold small">전석윤</span>
            </div>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
              &copy; 2025 PRJ3. All rights reserved.
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
