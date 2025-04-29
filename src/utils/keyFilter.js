export default {
      allowNumericWithSymbols(event) {
        const charCode = event.which || event.keyCode;
        const inputValue = event.target.value;
    
        // อนุญาตให้ใช้ปุ่มควบคุม เช่น Backspace, Tab, Enter, Delete, ลูกศรซ้ายขวา
        if ([8, 9, 13, 37, 39, 46].includes(charCode)) {
          return;
        }
    
        // อนุญาตให้ใช้ตัวเลข 0-9 (48-57), ทศนิยม "." (46), ลบ "-" (45)
        if ((charCode < 48 || charCode > 57) && charCode !== 46 && charCode !== 45) {
          event.preventDefault();
        }
    
        // ป้องกันการพิมพ์ Space (32) ตอนกรอกข้อมูล
        if (charCode === 32) {
          event.preventDefault();
        }
    
        // ป้องกันการพิมพ์จุดทศนิยม "." มากกว่าหนึ่งจุดในแต่ละค่าตัวเลข
        let parts = inputValue.split("-");
        let lastPart = parts[parts.length - 1].trim();
        if (charCode === 46 && lastPart.includes(".")) {
          event.preventDefault();
        }
    
        // ป้องกัน "-" มากกว่าหนึ่งอันในแต่ละชุดตัวเลข และต้องอยู่ตัวแรก
        if (charCode === 45) {
          if (lastPart.includes("-") || lastPart.length > 0) {
            event.preventDefault();
          }
        }
    
        // ป้องกันการพิมพ์ "0" ตัวแรกถ้าไม่มี "." เช่น 0123 (ผิด) แต่ 0.12 (ถูก)
        if (charCode === 48 && lastPart.length === 1 && lastPart[0] === "0" && !lastPart.includes(".")) {
          event.preventDefault();
        }
      },

      numbersOnly(event) {
        const charCode = event.which || event.keyCode;
      
        // อนุญาตให้ใช้ Backspace (8), Tab (9), Enter (13), Delete (46), ลูกศรซ้ายขวา (37, 39)
        if ([8, 9, 13, 37, 39, 46].includes(charCode)) {
          return;
        }
      
        // อนุญาตให้ใช้ตัวเลขจากแป้นพิมพ์หลัก (48-57) และแป้นตัวเลข Numpad (96-105) รวมถึงทศนิยม "."
        if (
          (charCode < 48 || charCode > 57) && // ตัวเลขหลัก
          (charCode < 96 || charCode > 105) && // ตัวเลขจาก Numpad
          charCode == 46 // จุดทศนิยม
        ) {
          event.preventDefault();
        }
      
        // ตรวจสอบว่า มีจุดทศนิยมเกิน 1 จุดหรือไม่
        if (charCode === 46 && event.target.value.includes(".")) {
          event.preventDefault();
        }
      }
      ,
      allowThaiNumberOnly(event) {
        const key = event.key;
      
        // อนุญาตให้ใช้ , (,) . (.) space ( ) Backspace (8), Delete (46), ลูกศรซ้ายขวา (Arrow keys)
        const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", ",", ".", " "];
      
        // เช็คว่าเป็นตัวอักษรภาษาไทยหรือตัวเลข (0-9, ๐-๙)
        const thaiPattern = /^[ก-๙๐-๙0-9]$/;
      
        if (!thaiPattern.test(key) && !allowedKeys.includes(key)) {
          event.preventDefault();
        }
      }
      
      ,
    numbersOnlyInteger(event) {
      const charCode = event.which || event.keyCode;
  
      // อนุญาตเฉพาะตัวเลข 0-9 (48-57) เท่านั้น
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    },
    allowThaiOnly(event) {
      const charCode = event.which || event.keyCode;
      const allowedKeys = [44, 46, 32]; // 44 = ',' | 46 = '.' | 32 = 'space'
      
      // ช่วง Unicode ภาษาไทย (U+0E00 ถึง U+0E7F)
      if (
        (charCode < 3584 || charCode > 3675) && // ไม่ใช่ภาษาไทย
        !allowedKeys.includes(charCode) // ไม่ใช่ , . หรือ space
      ) {
        event.preventDefault();
      }
    },
    allowEnglishOnly(event) {
      const charCode = event.which || event.keyCode;
      const allowedKeys = [44, 46, 32]; // 44 = ',' | 46 = '.' | 32 = 'space'
      
      // ช่วง Unicode ภาษาไทย (U+0E00 ถึง U+0E7F)
      if (
        (charCode < 65 || charCode > 90) && // Not uppercase A-Z
        (charCode < 97 || charCode > 122)&&  // Not lowercase a-z
        !allowedKeys.includes(charCode) // ไม่ใช่ , . หรือ space
      ) {
        event.preventDefault();
      }
    },
    allowEnglishNumberOnly(event) {
      const charCode = event.which || event.keyCode;
      const allowedKeys = [32, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57]; // เพิ่ม 32 สำหรับช่องว่าง
    
      // ช่วง Unicode ภาษาไทย (U+0E00 ถึง U+0E7F)
      if (
        (charCode < 65 || charCode > 90) && // Not uppercase A-Z
        (charCode < 97 || charCode > 122) && // Not lowercase a-z
        !allowedKeys.includes(charCode) // ไม่ใช่ตัวเลขหรือ space
      ) {
        event.preventDefault();
      }
    },
    
    /**
     * Allow only alphabetic input
     * @param {KeyboardEvent} event
     */
    lettersOnly(event) {
      const charCode = event.which || event.keyCode;
      if (
        (charCode < 65 || charCode > 90) && // Not uppercase A-Z
        (charCode < 97 || charCode > 122) // Not lowercase a-z
      ) {
        event.preventDefault();
      }
    },
  
    /**
     * Allow alphanumeric input
     * @param {KeyboardEvent} event
     */
    alphaNumeric(event) {
      const charCode = event.which || event.keyCode;
      if (
        (charCode < 48 || charCode > 57) && // Not a number
        (charCode < 65 || charCode > 90) && // Not uppercase A-Z
        (charCode < 97 || charCode > 122) // Not lowercase a-z
      ) {
        event.preventDefault();
      }
    },
  
    /**
     * Allow custom regex filtering
     * @param {KeyboardEvent} event
     * @param {RegExp} regex
     * ex. @keypress="(e) => keyFilter.customFilter(e, /^[aeiouAEIOU]$/)"
     */
    customFilter(event, regex) {
      const char = String.fromCharCode(event.which || event.keyCode);
      if (!regex.test(char)) {
        event.preventDefault();
      }
    },
  }
  