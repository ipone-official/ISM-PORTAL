// src/services/apiService.js
import axios from 'axios';

// สร้าง instance ของ axios เพื่อกำหนดค่า base URL และ config เบื้องต้น
const api = axios.create({
  baseURL: 'https://portal.ip-one.com/adsControlV2/', // เปลี่ยน URL เป็น API ที่คุณต้องการ
  timeout: 0, // ตั้งค่า timeout สำหรับการเชื่อมต่อ (หน่วยเป็นมิลลิวินาที)
  headers: {
    'Content-Type': 'application/json',
  },
});

export function isTokenNearExpiration() {
  const token = localStorage.getItem('accessTokenISMPortal');
  if (!token) return true; // ไม่มี Token ถือว่าใกล้หมดอายุ
  const { exp } = JSON.parse(atob(token.split('.')[1])); // Decode JWT Payload
  const now = Math.floor(Date.now() / 1000); // เวลาปัจจุบันในหน่วยวินาที
  return exp - now < 300; // หากเหลือเวลาน้อยกว่า 5 นาที
}

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('Ads/v1/Authentication', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const RenewToken = async (refreshToken) => {
  try {
    const response = await api.post('Ads/v1/RenewToken', 
      refreshToken,
    );
    localStorage.setItem("accessTokenISMPortal", response.data.accessToken);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getUser = async (username) => {
  try {
    const response = await api.post('Ads/v1/GetUser', {
      username,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};


export const changePassword = async (username, password) => {
  try {
    const response = await api.post('Ads/v1/ChangePassword', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error changePassword in:', error);
    throw error;
  }
};

export const UpdateMobile = async (username, mobile) => {
  try {
    const response = await api.post('Ads/v1/UpdateMobile', {
      username,
      mobile,
    });
    return response.data;
  } catch (error) {
    console.error('Error UpdateMobile in:', error);
    throw error;
  }
};

export const uploadImage = async (file, empId) => {
  try {
    const accessToken = localStorage.getItem("accessTokenISMPortal");
    if (!accessToken) {
      throw new Error("Access token not found in localStorage");
    }

    // สร้าง FormData สำหรับอัปโหลดไฟล์
    const formData = new FormData();
    formData.append("file", file); // แนบไฟล์
    formData.append("empId", empId); // แนบ empId

    // ส่งคำขอ POST พร้อม FormData และ Bearer Token
    const response = await api.post(`IP1Potal/v1/uploadImage?empId=${empId}`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // เพิ่ม Bearer Token ใน headers
        "Content-Type": "multipart/form-data" // ระบุ Content-Type เป็น multipart/form-data
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error in uploadImage:", error);
    throw error;
  }
};

export const sendOtp = async (mobile) => {
  try {
    const response = await api.post(`IP1Potal/v1/SendOtpRequest?msisdn=${mobile}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sendOtp:', error);
    throw error;
  }
};

export const VerifyOtp = async (token, pin) => {
  try {
    const response = await api.post(`IP1Potal/v1/SendVerifyOtp`, {
      token,
      pin
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching VerifyOtp:', error);
    throw error;
  }
};

export const ValidateJwtToken = async () => {
  try {
    const accessToken = localStorage.getItem("accessTokenISMPortal");
    if (!accessToken) {
      throw new Error("Access token not found in localStorage");
    }
    const response = await api.get(`Jwt/v1/ValidateJwtToken?token=${accessToken}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};
