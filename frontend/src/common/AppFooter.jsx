import React from "react";
import { Container } from "react-bootstrap";

export function AppFooter() {
  return (
    <footer className="py-4 mt-auto border-top">
      <Container className="text-center">
        <div className="mb-3">
          <h6 className="text-uppercase fw-bold mb-2">Portfolio Project</h6>
          <div className="d-flex justify-content-center align-items-center gap-2">
            <span className="fw-semibold">최지원</span>
            <span className="text-muted">•</span>
            <span className="fw-semibold">신유민</span>
            <span className="text-muted">•</span>
            <span className="fw-semibold">전석윤</span>
          </div>
        </div>
        <small className="text-muted">
          &copy; 2025 PRJ3. All rights reserved.
        </small>
      </Container>
    </footer>
  );
}
