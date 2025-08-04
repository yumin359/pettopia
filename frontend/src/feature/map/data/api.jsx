import axios from "axios";
import { API_BASE_URL } from "./config.jsx";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * API GET 요청을 처리하는 범용 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {object} [params] - 쿼리 파라미터
 * @returns {Promise<any>} - API 응답 데이터
 */
const get = async (endpoint, params) => {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`API Error GET ${endpoint}:`, error);
    throw error;
  }
};

// 지역 목록 조회
export const fetchRegions = () => get("/pet_facilities/regions");

// 카테고리2 목록 조회
export const fetchCategories2 = () =>
  get("/pet_facilities/categories/category2");

// 시군구 목록 조회
export const fetchSigungus = (region) =>
  get("/pet_facilities/sigungu", { region });

// 시설 검색
export const searchFacilities = (params) =>
  get("/pet_facilities/search", params);

// 찜 목록 조회
export const fetchMyFavorites = () => get("/favorite/mine");
