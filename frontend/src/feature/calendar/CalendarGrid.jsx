// src/components/calendar/CalendarGrid.jsx
import React from "react";
import { DateCell } from "./DateCell";

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

export const CalendarGrid = ({
  daysInMonth,
  firstDay,
  reviews,
  holidays,
  onDateClick,
  formatDate,
  getDayOfWeek,
}) => {
  const getDataForDate = (day) => {
    const dateStr = formatDate(day);
    return {
      reviews: reviews.filter((review) => review.date === dateStr),
      holiday: holidays[dateStr],
    };
  };

  return (
    <div>
      {/* 요일 헤더 */}
      <div className="row g-1">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`col text-center fw-bold p-2 small ${index === 0 ? "text-danger" : index === 6 ? "text-primary" : "text-dark"}`}
          >
            {day}
          </div>
        ))}
      </div>
      {/* 날짜 그리드 */}
      <div className="row g-1">
        {Array(firstDay)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} className="col"></div>
          ))}
        {Array(daysInMonth)
          .fill(null)
          .map((_, i) => {
            const day = i + 1;
            return (
              <DateCell
                key={day}
                day={day}
                data={getDataForDate(day)}
                onDateClick={onDateClick}
                dayOfWeek={getDayOfWeek(day)}
              />
            );
          })}
        {Array((7 - ((firstDay + daysInMonth) % 7)) % 7)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-end-${i}`} className="col"></div>
          ))}
      </div>
    </div>
  );
};
