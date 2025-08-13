import React from "react";

export const CalendarStats = ({ reviews, holidays, currentDate }) => {
  const currentMonthReviews = reviews.filter((r) =>
    r.date.startsWith(
      `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`,
    ),
  );

  const currentMonthHolidays = Object.entries(holidays).filter(([date]) =>
    date.startsWith(
      `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`,
    ),
  );

  return (
    <div className="row g-3 mt-4">
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title fs-6 fw-semibold text-muted">
              📊 이달의 활동
            </h5>
            <p className="card-text">
              작성한 리뷰:{" "}
              <span className="fw-bold">{currentMonthReviews.length}개</span>
            </p>
            <p className="card-text">
              평균 평점: <span className="fw-bold">4.7점</span>{" "}
              {/* 이 부분은 추후 계산 로직 추가 */}
            </p>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title fs-6 fw-semibold text-muted">
              📅 이달의 공휴일
            </h5>
            {currentMonthHolidays.length > 0 ? (
              currentMonthHolidays.map(([date, holiday]) => (
                <p key={date} className="card-text mb-1 small">
                  {date.split("-")[2]}일:{" "}
                  <span className="fw-semibold">{holiday.name}</span>
                </p>
              ))
            ) : (
              <p className="text-muted small mt-2">
                이달에는 공휴일이 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
