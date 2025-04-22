import axios from 'axios';

// สร้าง instance ของ axios เพื่อกำหนดค่า base URL และ config เบื้องต้น
const api = axios.create({
  // baseURL: 'https://localhost:44333/TruckQueue/v1/', // เปลี่ยน URL เป็น API ที่คุณต้องการ
  baseURL: 'https://portal.ip-one.com/ApiTruckQueue/TruckQueue/v1/', // เปลี่ยน URL เป็น API ที่คุณต้องการ
  timeout: 0, // ตั้งค่า timeout สำหรับการเชื่อมต่อ (หน่วยเป็นมิลลิวินาที)
  headers: {
    'Content-Type': 'application/json',
  },
});

  export const gPurchaseOrderByVendor = async (data) => {
    try {
      // ตรวจสอบว่า data มีค่าที่จำเป็นหรือไม่
      if (!data) {
        throw new Error("Data required.");
      }
  
      const response = await api.post(`gPurchaseOrderByVendor`, 
        data, // ส่งข้อมูลใน Body
      );
  
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in gPurchaseOrderByVendor:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };

  export const gMLocations = async () => {
    try {
      const response = await api.get(`gMLocations`);
      
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in gMLocations:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };

  export const gTQueueListDistinct = async () => {
    try {
      const response = await api.get(`gTQueueListDistinct`);
      
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in gTQueueListDistinct:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };
  

  export const gPlanQueue = async (data) => {
    try {
      const response = await api.post(`gPlanQueue`, data);
      
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in gPlanQueue:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };
  

  export const InsertQueueList = async (data) => {
    try {
      const response = await api.post(`InsertQueueList`, data);
      
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in InsertQueueList:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };


  // ---------------------------------

  export const RegisterPlanQueue = async (data) => {
    try {
      const response = await api.post(`RegisterPlanQueue`, data);
      
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in RegisterPlanQueue:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };

  export const ProcessQueueAsync = async (data) => {
    try {
      const response = await api.post(`ProcessQueueAsync`, data);
      
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in ProcessQueueAsync:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };

  export const gVendorBy = async (data) => {
    try {
      const response = await api.get(`gVendorBy?vendor=${data}`);
      
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in gVendorBy:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };

  export const gQueueByDaily = async () => {
    try {
      const response = await api.get(`gQueueByDaily`);
      
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in gQueueByDaily:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };
  
  export const pUpdateStatusQueue = async (data) => {
    try {
      const response = await api.post(`pUpdateStatusQueue`, data);
      
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in pUpdateStatusQueue:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };

  export const gQueueShowAsync = async () => {
    try {
      const response = await api.get(`gQueueShowAsync`);
      
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in gQueueShowAsync:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };