// src/components/calendar/GoogleCalendarReview.jsx
import React, { useState } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { useCalendarData } from "./hooks/useCalendarData";
import { useCalendar } from "./hooks/useCalendar";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { DateDetailModal } from "./DateDetailModal";
import { CalendarStats } from "./CalendarStats";

const GoogleCalendarReview = () => {
  const {
    currentDate,
    year,
    month,
    daysInMonth,
    firstDay,
    handlePrevMonth,
    handleNextMonth,
    formatDate,
    getDayOfWeek,
  } = useCalendar();
  const { reviews, holidays, loading, error } = useCalendarData(currentDate);

  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (day, data) => {
    setSelectedDate({ day, ...data });
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  return (
    <div className="calendar-container container-fluid p-3 p-md-4">
      <div className="mb-4">
        <h2 className="d-flex align-items-center gap-2 mb-2 fw-bold">
          <Calendar size={28} /> 내 리뷰 내역
        </h2>
      </div>

      {error && <div className="alert alert-warning">...</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <CalendarHeader
            year={year}
            month={month}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            loading={loading}
          />
          {/* 범례는 여기에 직접 작성하거나 컴포넌트로 분리 가능 */}
          <div className="d-flex flex-wrap gap-3 mb-3 small">...</div>

          <CalendarGrid
            daysInMonth={daysInMonth}
            firstDay={firstDay}
            reviews={reviews}
            holidays={holidays}
            onDateClick={handleDateClick}
            formatDate={formatDate}
            getDayOfWeek={getDayOfWeek}
          />
        </div>
      </div>

      <CalendarStats
        reviews={reviews}
        holidays={holidays}
        currentDate={currentDate}
      />

      <DateDetailModal
        show={!!selectedDate}
        onClose={handleCloseModal}
        date={currentDate}
        data={selectedDate}
      />
    </div>
  );
};

export default GoogleCalendarReview;
