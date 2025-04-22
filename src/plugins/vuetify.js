import { createVuetify } from 'vuetify';
import { th } from 'vuetify/locale'; 
import 'vuetify/styles';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default createVuetify({
  locale: {
    locale: 'th',  // กำหนดค่าเริ่มต้นเป็นภาษาไทย
    fallback: 'en', // กรณีที่ไม่มีข้อมูลภาษาไทย
    messages: { th }, // ใช้ค่า locale ภาษาไทยที่ Vuetify รองรับ
  },
  theme: {
    defaultTheme: 'myCustomTheme', // กำหนดชื่อธีมเป็น myCustomTheme
    themes: {
      myCustomTheme: {
        dark: false, // หรือ true หากต้องการธีมแบบ Dark Mode
        colors: {
          primary: '#007fc4', // กำหนดสี primary เป็นสีฟ้าตามที่ต้องการ
          secondary: '#efeff0', // สี secondary
          accent: '#FF4081', // สี accent
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          yellow: '#F8c849'
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  components,
  directives
});
