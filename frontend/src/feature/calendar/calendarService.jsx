// frontend/src/services/calendarService.js

const API_BASE_URL = "http://localhost:8080/api"; // Spring Boot 서버 주소

export const calendarService = {
  async getCalendarData(year, month = null) {
    // 로그인한 사용자 이메일 가져오기
    const userEmail =
      localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");

    const params = new URLSearchParams({
      year,
      email: userEmail,
    });
    if (month) params.append("month", month);

    try {
      const response = await fetch(`${API_BASE_URL}/calendar/data?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // JWT 토큰이 있다면
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) throw new Error("Failed to fetch calendar data");
      return await response.json();
    } catch (error) {
      console.error("Calendar API Error:", error);
      throw error;
    }
  },
};
