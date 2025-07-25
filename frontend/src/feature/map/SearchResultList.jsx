import React from "react";
import { useNavigate } from "react-router-dom";
import { createInfoWindowContent } from "./mapUtils";

const SearchResultList = ({
  facilities,
  totalElements,
  isDataLoading,
  currentPage,
  totalPages,
  handlePageChange,
  categoryColors,
  ITEMS_PER_PAGE,
  hasSearched,
}) => {
  const navigate = useNavigate();

  const handleListItemClick = (facility) => {
    navigate(`/facility/${encodeURIComponent(facility.name)}`);
    if (window.handleMapFacilityClick) {
      window.handleMapFacilityClick(facility);
    }
  };

  // 페이지네이션 렌더링 로직 (기존과 동일)
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(0, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="mt-2">
        <ul className="pagination pagination-sm justify-content-center mb-0">
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              style={{ fontSize: "0.65rem", padding: "0.2rem 0.4rem" }}
            >
              ◀
            </button>
          </li>
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              style={{ fontSize: "0.65rem", padding: "0.2rem 0.4rem" }}
            >
              ◁
            </button>
          </li>
          {startPage > 0 && (
            <li className="page-item disabled">
              <span
                className="page-link"
                style={{ fontSize: "0.65rem", padding: "0.2rem 0.4rem" }}
              >
                ...
              </span>
            </li>
          )}
          {pageNumbers.map((page) => (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(page)}
                style={{ fontSize: "0.65rem", padding: "0.2rem 0.4rem" }}
              >
                {page + 1}
              </button>
            </li>
          ))}
          {endPage < totalPages - 1 && (
            <li className="page-item disabled">
              <span
                className="page-link"
                style={{ fontSize: "0.65rem", padding: "0.2rem 0.4rem" }}
              >
                ...
              </span>
            </li>
          )}
          <li
            className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              style={{ fontSize: "0.65rem", padding: "0.2rem 0.4rem" }}
            >
              ▶
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // 검색결과 카드
  const renderFacilityCard = (facility) => {
    // createInfoWindowContent 함수로 전체 HTML 문자열을 가져옴
    const fullInfoWindowHtml = createInfoWindowContent(
      facility,
      categoryColors,
    );

    return (
      <div
        key={facility.id}
        className="card mb-1 border-0 shadow-sm"
        onClick={() => handleListItemClick(facility)}
        style={{ cursor: "pointer", fontSize: "11px" }}
      >
        <div className="card-body">
          <div className="flex-grow-1">
            <div dangerouslySetInnerHTML={{ __html: fullInfoWindowHtml }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="col-3 bg-white border rounded p-2 d-flex flex-column"
      style={{ height: "100%" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2 flex-shrink-0">
        <h6 className="mb-0 small">검색 결과</h6>
        {hasSearched && (
          <span className="badge bg-primary small">{totalElements}개</span>
        )}
      </div>

      {!hasSearched ? (
        <div className="text-center text-muted py-3 flex-grow-1 d-flex align-items-center justify-content-center">
          <div>
            <div className="mb-2">🔍</div>
            <p className="small mb-0">
              필터를 설정하고
              <br />
              검색해보세요!
            </p>
          </div>
        </div>
      ) : isDataLoading ? (
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
          <div>
            <div className="mb-2">😔</div>
            <p className="small mb-0">조건에 맞는 시설이 없습니다.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
            {facilities.map(renderFacilityCard)}
          </div>
          <div className="flex-shrink-0">{renderPagination()}</div>
        </>
      )}
    </div>
  );
};

export default SearchResultList;
