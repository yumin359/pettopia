// GoogleCalendarReview.jsx
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Calendar,
  Loader,
  AlertCircle,
} from "lucide-react";
import { Modal, Button, Card, Alert, Badge } from "react-bootstrap";

// Google Calendar API 설정 - 환경변수에서 가져오기
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const KOREA_HOLIDAY_CALENDAR_ID =
  "ko.south_korea#holiday@group.v.calendar.google.com";

const GoogleCalendarReview = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reviews, setReviews] = useState([]);
  const [holidays, setHolidays] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Google Calendar API로 한국 공휴일 가져오기
  const fetchKoreanHolidays = async (year) => {
    try {
      setLoading(true);
      setError(null);

      // API 키 확인
      if (!GOOGLE_API_KEY) {
        throw new Error(
          "Google API 키가 설정되지 않았습니다. .env 파일을 확인하세요.",
        );
      }

      const timeMin = `${year}-01-01T00:00:00Z`;
      const timeMax = `${year}-12-31T23:59:59Z`;

      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(KOREA_HOLIDAY_CALENDAR_ID)}/events`;

      const params = new URLSearchParams({
        key: GOOGLE_API_KEY,
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "50",
      });

      const response = await fetch(`${url}?${params}`);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("API 키가 유효하지 않거나 권한이 없습니다.");
        }
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const data = await response.json();

      // 공휴일 데이터 변환
      const holidayMap = {};
      if (data.items) {
        data.items.forEach((item) => {
          const date = item.start.date; // "2025-01-01" 형식
          holidayMap[date] = {
            name: item.summary,
            description: item.description || "",
            isHoliday: true,
          };
        });
      }

      setHolidays(holidayMap);
      console.log(
        `${year}년 공휴일 ${Object.keys(holidayMap).length}개 로드 완료`,
      );
    } catch (err) {
      console.error("공휴일 정보 로드 실패:", err);
      setError(err.message);

      // 폴백: 기본 공휴일 데이터
      const fallbackHolidays = {
        [`${year}-01-01`]: { name: "신정", isHoliday: true },
        [`${year}-03-01`]: { name: "삼일절", isHoliday: true },
        [`${year}-05-05`]: { name: "어린이날", isHoliday: true },
        [`${year}-06-06`]: { name: "현충일", isHoliday: true },
        [`${year}-08-15`]: { name: "광복절", isHoliday: true },
        [`${year}-10-03`]: { name: "개천절", isHoliday: true },
        [`${year}-10-09`]: { name: "한글날", isHoliday: true },
        [`${year}-12-25`]: { name: "크리스마스", isHoliday: true },
      };
      setHolidays(fallbackHolidays);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 리뷰 데이터 가져오기
  const fetchUserReviews = async () => {
    try {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch('/api/user/reviews');
      // const data = await response.json();
      // setReviews(data);

      // 샘플 데이터
      const sampleReviews = [
        {
          id: 1,
          date: "2025-01-01",
          placeName: "스타벅스 강남점",
          rating: 4,
          content: "신정에 방문! 펫프렌들리 카페입니다.",
          address: "서울시 강남구",
          images: ["url1", "url2"],
        },
        {
          id: 2,
          date: "2025-01-15",
          placeName: "애견카페 멍멍",
          rating: 5,
          content: "넓고 쾌적해요. 대형견도 편하게 놀 수 있어요.",
          address: "서울시 서초구",
        },
        {
          id: 3,
          date: "2025-03-01",
          placeName: "한강공원",
          rating: 5,
          content: "삼일절 나들이! 산책하기 최고예요.",
          address: "서울시 영등포구",
        },
      ];

      setReviews(sampleReviews);
    } catch (err) {
      console.error("리뷰 데이터 로드 실패:", err);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchKoreanHolidays(currentDate.getFullYear()),
        fetchUserReviews(),
      ]);
    };

    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 월 변경시 해당 년도 공휴일 다시 로드
  useEffect(() => {
    const year = currentDate.getFullYear();
    const hasHolidaysForYear = Object.keys(holidays).some((date) =>
      date.startsWith(String(year)),
    );

    if (!hasHolidaysForYear && !loading) {
      fetchKoreanHolidays(year);
    }
  }, [currentDate, holidays, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // 캘린더 관련 함수들
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getDataForDate = (day) => {
    const dateStr = formatDate(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const dayReviews = reviews.filter((review) => review.date === dateStr);
    const holiday = holidays[dateStr];

    return { reviews: dayReviews, holiday, dateStr };
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const handleDateClick = (day) => {
    const data = getDataForDate(day);
    setSelectedDate({ day, ...data });
    setShowDetail(true);
  };

  const getDayOfWeek = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    return date.getDay();
  };

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* 헤더 */}
      <div className="mb-4">
        <h2 className="d-flex align-items-center gap-2 mb-2 fw-bold">
          <Calendar size={28} /> 내 리뷰 캘린더
        </h2>
        <p className="text-muted">
          Google Calendar API로 한국 공휴일과 내 리뷰를 함께 확인하세요.
        </p>
      </div>

      {/* API 상태 표시 */}
      {error && (
        <div
          className="alert alert-warning d-flex align-items-center gap-2"
          role="alert"
        >
          <AlertCircle size={20} />
          <div>
            <div className="fw-bold">
              공휴일 정보 로드 실패 (기본 데이터 사용중)
            </div>
            <small>{error}</small>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          {/* 캘린더 네비게이션 */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button
              onClick={handlePrevMonth}
              className="btn btn-outline-secondary"
              aria-label="이전 달"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="d-flex align-items-center gap-2">
              <h3 className="mb-0 fs-5 fw-semibold">
                {currentDate.getFullYear()}년{" "}
                {monthNames[currentDate.getMonth()]}
              </h3>
              {loading && (
                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </div>
            <button
              onClick={handleNextMonth}
              className="btn btn-outline-secondary"
              aria-label="다음 달"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* 범례 */}
          <div className="d-flex flex-wrap gap-3 mb-3 small">
            <div className="d-flex align-items-center gap-2">
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "var(--bs-danger-bg-subtle)",
                  borderRadius: "3px",
                  border: "1px solid var(--bs-danger-border-subtle)",
                }}
              ></span>
              공휴일
            </div>
            <div className="d-flex align-items-center gap-2">
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "var(--bs-primary-bg-subtle)",
                  borderRadius: "3px",
                  border: "1px solid var(--bs-primary-border-subtle)",
                }}
              ></span>
              리뷰
            </div>
            <div className="d-flex align-items-center gap-2">
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "var(--bs-info-bg-subtle)",
                  borderRadius: "3px",
                  border: "1px solid var(--bs-info-border-subtle)",
                }}
              ></span>
              공휴일+리뷰
            </div>
          </div>

          {/* 캘린더 그리드 */}
          <div>
            {/* 요일 헤더 */}
            <div className="row g-1">
              {dayNames.map((day, index) => (
                <div key={day} className="col text-center fw-bold p-2 small">
                  <span
                    className={
                      index === 0
                        ? "text-danger"
                        : index === 6
                          ? "text-primary"
                          : "text-dark"
                    }
                  >
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="row g-1">
              {/* 앞쪽 빈 칸 */}
              {Array(firstDay)
                .fill(null)
                .map((_, index) => (
                  <div key={`empty-${index}`} className="col"></div>
                ))}

              {/* 날짜 칸 */}
              {Array(daysInMonth)
                .fill(null)
                .map((_, index) => {
                  const day = index + 1;
                  const { reviews: dayReviews, holiday } = getDataForDate(day);
                  const hasReviews = dayReviews.length > 0;
                  // [수정] getDayOfWeek 함수를 올바르게 사용합니다.
                  const dayOfWeek = getDayOfWeek(day);

                  let bgClass = "bg-light bg-opacity-50";
                  if (holiday && hasReviews) bgClass = "bg-info-subtle";
                  else if (holiday) bgClass = "bg-danger-subtle";
                  else if (hasReviews) bgClass = "bg-primary-subtle";

                  return (
                    <div
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className="col p-2 border rounded"
                      style={{
                        minHeight: "120px",
                        cursor: "pointer",
                        transition:
                          "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                        backgroundColor: `var(--bs-${bgClass.split("-")[1]}-bg-subtle)`,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow =
                          "var(--bs-box-shadow-lg)";
                        e.currentTarget.style.zIndex = "10";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.zIndex = "1";
                      }}
                    >
                      <div
                        className={`fw-bold small mb-1 ${dayOfWeek === 0 || holiday ? "text-danger" : dayOfWeek === 6 ? "text-primary" : "text-dark"}`}
                      >
                        {day}
                      </div>
                      {holiday && (
                        <div className="badge text-bg-danger text-wrap w-100 mb-1">
                          {holiday.name}
                        </div>
                      )}
                      {hasReviews &&
                        dayReviews
                          .slice(0, holiday ? 1 : 2)
                          .map((review, idx) => (
                            <div
                              key={idx}
                              className="badge text-bg-primary text-wrap w-100 mb-1"
                            >
                              {review.placeName}
                            </div>
                          ))}
                      {dayReviews.length > (holiday ? 1 : 2) && (
                        <div className="small text-primary text-center mt-1">
                          +{dayReviews.length - (holiday ? 1 : 2)} more
                        </div>
                      )}
                    </div>
                  );
                })}
              {/* 그리드 채우기 위한 빈 div 추가 */}
              {Array((7 - ((firstDay + daysInMonth) % 7)) % 7)
                .fill(null)
                .map((_, index) => (
                  <div key={`empty-end-${index}`} className="col"></div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 통계 섹션 (생략되었던 원본 코드 포함) */}
      <div className="row g-3 mt-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title fs-6 fw-semibold text-muted">
                📊 이달의 활동
              </h5>
              <p className="card-text">
                작성한 리뷰:{" "}
                <span className="fw-bold">
                  {
                    reviews.filter((r) =>
                      r.date.startsWith(
                        `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`,
                      ),
                    ).length
                  }
                  개
                </span>
              </p>
              <p className="card-text">
                평균 평점: <span className="fw-bold">4.7점</span>
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
              {Object.entries(holidays).filter(([date]) =>
                date.startsWith(
                  `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`,
                ),
              ).length > 0 ? (
                Object.entries(holidays)
                  .filter(([date]) =>
                    date.startsWith(
                      `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`,
                    ),
                  )
                  .map(([date, holiday]) => (
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

      {/* 상세 모달 (생략되었던 원본 코드 포함) */}
      {showDetail && selectedDate && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월{" "}
                    {selectedDate.day}일
                  </h5>
                  {selectedDate.holiday && (
                    <div className="mt-1">
                      <span className="badge bg-danger">
                        🎌 {selectedDate.holiday.name}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetail(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {selectedDate.holiday?.description && (
                  <p className="alert alert-danger-subtle small">
                    {selectedDate.holiday.description}
                  </p>
                )}
                {selectedDate.reviews.length > 0 ? (
                  <>
                    <h6 className="mb-3 fw-semibold">📝 작성한 리뷰</h6>
                    {selectedDate.reviews.map((review) => (
                      <div key={review.id} className="card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title fw-bold mb-0">
                              {review.placeName}
                            </h6>
                            <div className="d-flex gap-1">
                              {Array(5)
                                .fill(null)
                                .map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    fill={
                                      i < review.rating ? "#ffc107" : "#e9ecef"
                                    }
                                    className={
                                      i < review.rating
                                        ? "text-warning"
                                        : "text-light"
                                    }
                                  />
                                ))}
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-1 small text-muted mb-2">
                            <MapPin size={14} /> {review.address}
                          </div>
                          <p className="card-text small">{review.content}</p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center p-5 text-muted">
                    <p>이 날짜에 작성한 리뷰가 없습니다.</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetail(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarReview;
