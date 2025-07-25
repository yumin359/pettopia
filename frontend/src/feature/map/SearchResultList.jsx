// src/feature/map/SearchResultList.js
import React from "react";
import { useNavigate } from "react-router-dom";

const SearchResultList = ({
                            facilities,
                            totalElements,
                            isDataLoading,
                            currentPage,
                            totalPages,
                            handlePageChange,
                            handleListItemClick,
                            categoryColors,
                            ITEMS_PER_PAGE,
                          }) => {
  const navigate = useNavigate();

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <nav className="mt-2">
        <ul className="pagination pagination-sm justify-content-center mb-0">
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              이전
            </button>
          </li>
          <li className="page-item active">
            <span className="page-link">{currentPage + 1}</span>
          </li>
          <li
            className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              다음
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div
      className="col-3 bg-white border rounded p-2 d-flex flex-column"
      style={{ height: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2 flex-shrink-0">
        <h6 className="mb-0 small">검색 결과</h6>
        <span className="badge bg-primary small">{totalElements}개</span>
      </div>

      {isDataLoading ? (
        <div className="text-center py-3 flex-grow-1 d-flex align-items-center justify-content-center">
          <div>
            <div
              className="spinner-border spinner-border-sm text-primary mb-1"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="small mb-0">로딩 중...</p>
          </div>
        </div>
      ) : facilities.length === 0 ? (
        <div className="text-center text-muted py-3 flex-grow-1 d-flex align-items-center justify-content-center">
          <p className="small mb-0">조건에 맞는 시설이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="card mb-1 border-0 shadow-sm"
                onClick={() => navigate(`/facility/${encodeURIComponent(facility.name)}`)}
                style={{ cursor: "pointer", fontSize: "11px" }}
              >
                <div className="card-body p-2">
                  <div className="d-flex align-items-start">
                    <div
                      className="rounded-circle me-2 mt-1"
                      style={{
                        width: "6px",
                        height: "6px",
                        backgroundColor:
                          categoryColors[facility.category1] || "#6c757d",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-1 small">{facility.name}</h6>
                      <p className="card-text text-muted mb-1 small">
                        {facility.category1} &gt; {facility.category2 || "N/A"}
                      </p>
                      <p className="card-text text-secondary mb-1 small">
                        {(facility.roadAddress || facility.jibunAddress || "")
                          .length > 25
                          ? (
                          facility.roadAddress ||
                          facility.jibunAddress ||
                          ""
                        ).substring(0, 25) + "..."
                          : facility.roadAddress || facility.jibunAddress || ""}
                      </p>
                      <div className="d-flex align-items-center">
                        <span className="text-warning small me-1">
                          ⭐⭐⭐⭐☆
                        </span>
                        <span className="text-muted small">(4.2) 23개</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-shrink-0">{renderPagination()}</div>
        </>
      )}
    </div>
  );
};

export default SearchResultList;
