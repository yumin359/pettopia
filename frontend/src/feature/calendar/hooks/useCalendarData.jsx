// src/components/calendar/hooks/useCalendarData.js
import { useState, useEffect } from "react";
import { calendarService } from "../calendarService.jsx";

// const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
// const KOREA_HOLIDAY_CALENDAR_ID =
//   "ko.south_korea#holiday@group.v.calendar.google.com";

export const useCalendarData = (currentDate) => {
  const [reviews, setReviews] = useState([]);
  const [holidays, setHolidays] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const fetchAllDataFromBackend = async () => {
      setLoading(true); // 데이터 로딩 시작
      setError(null);
      try {
        // --- 여기가 핵심입니다 ---
        // 기존의 샘플 데이터와 Google API 직접 호출 로직을 모두 버리고,
        // 우리가 만든 calendarService를 통해 백엔드에 데이터를 요청합니다.
        console.log(`백엔드에 ${year}년 ${month}월 데이터 요청을 보냅니다...`);
        const data = await calendarService.getCalendarData(year, month);
        console.log("백엔드로부터 데이터를 성공적으로 받았습니다!", data);

        // 백엔드가 보내준 데이터로 프론트엔드의 상태를 업데이트합니다.
        setHolidays(data.holidays || {});
        setReviews(data.reviews || []);
      } catch (err) {
        // 에러가 발생하면 콘솔에 에러를 출력하고 에러 상태를 업데이트합니다.
        console.error("캘린더 데이터 로딩 중 에러 발생:", err);
        setError(err.message);
        setHolidays({});
        setReviews([]);
      } finally {
        // 성공하든 실패하든 로딩 상태를 종료합니다.
        setLoading(false);
      }
    };

    fetchAllDataFromBackend(); // 위에서 정의한 함수를 실행합니다.

    // 이 useEffect는 'currentDate'가 바뀔 때마다 다시 실행됩니다.
    // 즉, 사용자가 달력의 월을 변경할 때마다 새로운 데이터를 백엔드에 요청하게 됩니다.
  }, [currentDate]);

  // 컴포넌트들이 사용할 상태들을 반환합니다.
  return { reviews, holidays, loading, error };
};
