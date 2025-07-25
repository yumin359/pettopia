// src/map/mapUtils.jsx
export const createInfoWindowContent = (facility, categoryColors) => {
  const categoryColor =
    categoryColors[facility.category1] ||
    categoryColors[facility.category2] ||
    "#6c757d"; // 기본 색상

  return `
    <div style="width: auto; font-size: 11px; border: none;">
      <div class="card-body p-1">
        <h6 class="card-title mb-1" style="font-size: 12px; font-weight: bold;">
          ${facility.name || "이름 없음"}
          <span class="badge ms-1" style="background-color:${categoryColor}; font-size: 8px;">
            ${facility.category2 || facility.category1 || ""}
          </span>
        </h6>
        <p class="mb-1 small text-secondary">📍 ${facility.roadAddress || facility.jibunAddress || "주소 정보 없음"}</p>
        ${facility.phoneNumber ? `<p class="text-primary mb-1 small">📞 ${facility.phoneNumber}</p>` : ""}
        ${facility.allowedPetSize ? `<p class="text-success mb-1 small">🐕 ${facility.allowedPetSize}</p>` : ""}
        ${facility.parkingAvailable === "Y" ? `<p class="text-info mb-1 small">🅿️ 주차가능</p>` : ""}
        ${facility.holiday ? `<p class="text-muted mb-1 small">🗓️ 휴무: ${facility.holiday}</p>` : ""}
        ${facility.operatingHours ? `<p class="text-muted mb-1 small">⏰ ${facility.operatingHours}</p>` : ""}
        ${facility.petRestrictions ? `<p class="text-warning mb-1 small">🚫 ${facility.petRestrictions}</p>` : ""}
      </div>
    </div>
  `;
};
