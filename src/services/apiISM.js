import axios from 'axios';

// สร้าง instance ของ axios เพื่อกำหนดค่า base URL และ config เบื้องต้น
const api = axios.create({
  // baseURL: 'https://localhost:44333/TruckQueue/v1/', // เปลี่ยน URL เป็น API ที่คุณต้องการ
  baseURL: 'https://portal.ip-one.com/ApiISMPortal/SpecialAreas/v1/', // เปลี่ยน URL เป็น API ที่คุณต้องการ
  timeout: 0, // ตั้งค่า timeout สำหรับการเชื่อมต่อ (หน่วยเป็นมิลลิวินาที)
  headers: {
    'Content-Type': 'application/json',
  },
});

  export const gMasterSperialAreas = async () => {
    try {

      const response = await api.get(`gMasterSperialAreas`
      );
  
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in gMasterSperialAreas:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };

  export const gMasterMaterial = async () => {
    try {

      const response = await api.get(`gMasterMaterial`
      );
  
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in gMasterMaterial:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };


  export const gMasterCustomers = async (data) => {
    try {

      const response = await api.get(`gMasterCustomers?ismArea=${data}`
      );
  
      return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
    } catch (error) {
      console.error("Error in gMasterCustomers:", error);
      throw error; // ส่งข้อผิดพลาดกลับไปยังผู้เรียก
    }
  };

  
export const pInsertSpecialAreas = async (item) => {
  try {
    const response = await api.post('pInsertSpecialAreas', item, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error pInsertSpecialAreas:', error);
    throw error;
  }
};

export const gTransactionSpecialAreas = async (item) => {
  try {
    const response = await api.post('gTransactionSpecialAreas', item);
    return response.data;
  } catch (error) {
    console.error('❌ Error pInsertSpecialAreas:', error);
    throw error;
  }
};

export const pDeleteSaIdFileName = async (item) => {
  try {
    const response = await api.delete(`pDeleteSaIdFileName`, {
      data: item, // ส่งข้อมูลใน Body
      headers: {
        "Content-Type": "application/json", // กำหนด Content-Type
      },
    });

    return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
  } catch (error) {
    console.error('❌ Error pDeleteSaIdFileName:', error);
    throw error;
  }
};


export const pUpdateStatusSpecialAreas = async (item) => {
  try {
    const response = await api.post('pUpdateStatusSpecialAreas', item);
    return response.data;
  } catch (error) {
    console.error('❌ Error pUpdateStatusSpecialAreas:', error);
    throw error;
  }
};


export const pPriceReviewHead = async (item) => {
  try {
    const response = await api.post('pPriceReviewHead', item);
    return response.data;
  } catch (error) {
    console.error('❌ Error pPriceReviewHead:', error);
    throw error;
  }
};

export const gTransactionPricePreview = async (item) => {
  try {
    const response = await api.post('gTransactionPricePreview', item);
    return response.data;
  } catch (error) {
    console.error('❌ Error gTransactionPricePreview:', error);
    throw error;
  }
};

export const gPriceReviewDetail = async (item) => {
  try {
    const response = await api.get(`gPriceReviewDetail?reviewID=${item}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error gPriceReviewDetail:', error);
    throw error;
  }
};

export const pPriceReviewDetail = async (item) => {
  try {
    const response = await api.post('pPriceReviewDetail', item);
    return response.data;
  } catch (error) {
    console.error('❌ Error pPriceReviewDetail:', error);
    throw error;
  }
};

export const pDeletedPriceReview = async (item) => {
  try {
    const response = await api.delete(`pDeletedPriceReview`, {
      data: item, // ส่งข้อมูลใน Body
      headers: {
        "Content-Type": "application/json", // กำหนด Content-Type
      },
    });

    return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
  } catch (error) {
    console.error('❌ Error pDeletedPriceReview:', error);
    throw error;
  }
};


export const gWorkSessionsBy = async (item) => {
  try {
    const response = await api.get(`gWorkSessionsBy?userID=${item}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error gWorkSessionsBy:', error);
    throw error;
  }
};

export const pInsertWorkSessions = async (item) => {
  try {
    const response = await api.post('pInsertWorkSessions', item);
    return response.data;
  } catch (error) {
    console.error('❌ Error pInsertWorkSessions:', error);
    throw error;
  }
};

export const gMHolidayTypes = async () => {
  try {
    const response = await api.get(`gMHolidayTypes`);
    return response.data;
  } catch (error) {
    console.error('❌ Error gMHolidayTypes:', error);
    throw error;
  }
};

export const pDeletedWorkSessions = async (item) => {
  try {
    const response = await api.delete(`pDeletedWorkSessions`, {
      data: item, // ส่งข้อมูลใน Body
      headers: {
        "Content-Type": "application/json", // กำหนด Content-Type
      },
    });

    return response.data; // ส่งคืนข้อมูลเมื่อสำเร็จ
  } catch (error) {
    console.error('❌ Error pDeletedWorkSessions:', error);
    throw error;
  }
};

export const gViewPriceCheck = async (item) => {
  try {
    const response = await api.post('gViewPriceCheck', item);
    return response.data;
  } catch (error) {
    console.error('❌ Error gViewPriceCheck:', error);
    throw error;
  }
};

export const pWorkDaySummaryBy = async (item) => {
  try {
    const response = await api.post('pWorkDaySummaryBy', item);
    return response.data;
  } catch (error) {
    console.error('❌ Error pWorkDaySummaryBy:', error);
    throw error;
  }
};
export const pWorkDaySummaryByUser = async (item) => {
  try {
    const response = await api.post('pWorkDaySummaryByUser', item);
    return response.data;
  } catch (error) {
    console.error('❌ Error pWorkDaySummaryByUser:', error);
    throw error;
  }
};

export const pWorkDaySummaryByUserReport = async (item) => {
  try {
    const response = await api.post('pWorkDaySummaryByUserReport', item);
    return response.data;
  } catch (error) {
    console.error('❌ Error pWorkDaySummaryByUserReport:', error);
    throw error;
  }
};

export const pWorkSessionByUserDate = async (item) => {
  try {
    const response = await api.post('pWorkSessionByUserDate', item);
    return response.data;
  } catch (error) {
    console.error('❌ Error pWorkSessionByUserDate:', error);
    throw error;
  }
};








