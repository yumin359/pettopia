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
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6" />내 리뷰 캘린더
        </h2>
        <p className="text-sm text-gray-600">
          Google Calendar API로 한국 공휴일과 내 리뷰를 함께 확인하세요
        </p>
      </div>

      {/* API 상태 표시 */}
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-sm text-yellow-800">
              공휴일 정보 로드 실패 (기본 데이터 사용중)
            </p>
            <p className="text-xs text-yellow-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* 캘린더 네비게이션 */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="이전 달"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">
            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
          </h3>
          {loading && <Loader className="w-4 h-4 animate-spin text-blue-500" />}
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="다음 달"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 범례 */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span>공휴일</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span>리뷰 작성일</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
          <span>공휴일 + 리뷰</span>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              index === 0
                ? "text-red-500"
                : index === 6
                  ? "text-blue-500"
                  : "text-gray-700"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 빈 칸 */}
        {Array(firstDay)
          .fill(null)
          .map((_, index) => (
            <div key={`empty-${index}`} className="h-28"></div>
          ))}

        {/* 날짜 칸 */}
        {Array(daysInMonth)
          .fill(null)
          .map((_, index) => {
            const day = index + 1;
            const { reviews: dayReviews, holiday } = getDataForDate(day);
            const hasReviews = dayReviews.length > 0;
            const dayOfWeek = getDayOfWeek(day);

            let bgColor = "";
            let borderColor = "border-gray-200";

            if (holiday && hasReviews) {
              bgColor = "bg-purple-50 hover:bg-purple-100";
              borderColor = "border-purple-300";
            } else if (holiday) {
              bgColor = "bg-red-50 hover:bg-red-100";
              borderColor = "border-red-200";
            } else if (hasReviews) {
              bgColor = "bg-blue-50 hover:bg-blue-100";
              borderColor = "border-blue-200";
            } else {
              bgColor = "hover:bg-gray-50";
            }

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                h-28 p-2 border rounded-lg cursor-pointer transition-all
                ${bgColor} ${borderColor}
              `}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    dayOfWeek === 0 || holiday
                      ? "text-red-500"
                      : dayOfWeek === 6
                        ? "text-blue-500"
                        : "text-gray-700"
                  }`}
                >
                  {day}
                </div>

                {/* 공휴일 표시 */}
                {holiday && (
                  <div className="text-xs font-medium text-red-600 mb-1 truncate">
                    {holiday.name}
                  </div>
                )}

                {/* 리뷰 표시 */}
                {hasReviews && (
                  <div className="space-y-1">
                    {dayReviews.slice(0, holiday ? 1 : 2).map((review, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-blue-200 rounded px-1 py-0.5 truncate"
                      >
                        {review.placeName}
                      </div>
                    ))}
                    {dayReviews.length > (holiday ? 1 : 2) && (
                      <div className="text-xs text-blue-600">
                        +{dayReviews.length - (holiday ? 1 : 2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* 상세 모달 */}
      {showDetail && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월{" "}
                    {selectedDate.day}일
                  </h3>
                  {selectedDate.holiday && (
                    <div className="mt-1">
                      <span className="text-sm text-red-600 font-medium">
                        🎌 {selectedDate.holiday.name}
                      </span>
                      {selectedDate.holiday.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {selectedDate.holiday.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>

              {selectedDate.reviews.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">📝 작성한 리뷰</h4>
                  {selectedDate.reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold">{review.placeName}</h5>
                        <div className="flex gap-0.5">
                          {Array(5)
                            .fill(null)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        {review.address}
                      </div>
                      <p className="text-gray-700 text-sm">{review.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>이 날짜에 작성한 리뷰가 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 통계 섹션 */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-700">📊 이달의 활동</h3>
          <div className="space-y-1 text-sm">
            <p>
              작성한 리뷰:{" "}
              <span className="font-bold">
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
            <p>
              평균 평점: <span className="font-bold">4.7점</span>
            </p>
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-700">📅 이달의 공휴일</h3>
          <div className="space-y-1 text-sm">
            {Object.entries(holidays)
              .filter(([date]) => {
                const [year, month] = date.split("-");
                return (
                  parseInt(year) === currentDate.getFullYear() &&
                  parseInt(month) === currentDate.getMonth() + 1
                );
              })
              .slice(0, 3)
              .map(([date, holiday]) => (
                <p key={date}>
                  {date.split("-")[2]}일:{" "}
                  <span className="font-medium">{holiday.name}</span>
                </p>
              ))}
            {Object.entries(holidays).filter(([date]) => {
              const [year, month] = date.split("-");
              return (
                parseInt(year) === currentDate.getFullYear() &&
                parseInt(month) === currentDate.getMonth() + 1
              );
            }).length === 0 && (
              <p className="text-sm text-gray-500">
                이달에는 공휴일이 없습니다
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarReview;
