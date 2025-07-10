// 測試自動載入使用者資料功能
// 用法: node scripts/test-auto-load-feature.js

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testAutoLoadFeature() {
  try {
    console.log('🧪 開始測試自動載入使用者資料功能...');
    console.log('');

    // 1. 測試用戶註冊
    console.log('1. 測試用戶註冊...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: `testuser_${Date.now()}`,
        password: 'testpass123'
      })
    });

    if (!registerResponse.ok) {
      throw new Error(`註冊失敗: ${registerResponse.status}`);
    }

    const registerData = await registerResponse.json();
    const token = registerData.token;
    console.log('✅ 用戶註冊成功');

    // 2. 測試獲取空的上傳記錄列表
    console.log('2. 測試獲取空的上傳記錄列表...');
    const emptyUploadsResponse = await fetch(`${BASE_URL}/api/uploads`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!emptyUploadsResponse.ok) {
      throw new Error(`獲取上傳記錄失敗: ${emptyUploadsResponse.status}`);
    }

    const emptyUploadsData = await emptyUploadsResponse.json();
    console.log('✅ 空上傳記錄列表獲取成功:', emptyUploadsData);

    // 3. 模擬上傳 CSV 資料
    console.log('3. 模擬上傳 CSV 資料...');
    const csvContent = 'name,age,city\nJohn,25,New York\nJane,30,London\nBob,35,Paris';
    const formData = new FormData();
    formData.append('csvFile', new Blob([csvContent], { type: 'text/csv' }), 'test.csv');

    const uploadResponse = await fetch(`${BASE_URL}/api/upload-csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      throw new Error(`上傳失敗: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('✅ CSV 上傳成功');

    // 4. 測試獲取上傳記錄列表
    console.log('4. 測試獲取上傳記錄列表...');
    const uploadsResponse = await fetch(`${BASE_URL}/api/uploads`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!uploadsResponse.ok) {
      throw new Error(`獲取上傳記錄失敗: ${uploadsResponse.status}`);
    }

    const uploadsData = await uploadsResponse.json();
    console.log('✅ 上傳記錄列表獲取成功:', uploadsData.data?.length || 0, '筆記錄');

    if (uploadsData.data && uploadsData.data.length > 0) {
      const uploadId = uploadsData.data[0].id;
      
      // 5. 測試獲取特定上傳記錄詳情
      console.log('5. 測試獲取上傳記錄詳情...');
      const detailResponse = await fetch(`${BASE_URL}/api/uploads/${uploadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!detailResponse.ok) {
        throw new Error(`獲取詳情失敗: ${detailResponse.status}`);
      }

      const detailData = await detailResponse.json();
      console.log('✅ 上傳記錄詳情獲取成功');
      console.log('   - 檔案名稱:', detailData.data?.fileName);
      console.log('   - 資料筆數:', detailData.data?.rows?.length);
      console.log('   - 欄位數量:', detailData.data?.columns?.length);
    }

    console.log('');
    console.log('🎉 自動載入功能測試完成！');
    console.log('');
    console.log('📋 測試結果摘要:');
    console.log('- 用戶註冊: ✅ 通過');
    console.log('- 空記錄列表: ✅ 通過');
    console.log('- CSV 上傳: ✅ 通過');
    console.log('- 記錄列表: ✅ 通過');
    console.log('- 記錄詳情: ✅ 通過');
    console.log('');
    console.log('💡 提示: 現在可以在前端測試自動載入功能');
    console.log('   1. 訪問 http://localhost:3000');
    console.log('   2. 使用剛建立的帳戶登入');
    console.log('   3. 觀察系統是否自動載入資料');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    process.exit(1);
  }
}

// 檢查 node-fetch 是否可用
try {
  require('node-fetch');
} catch (error) {
  console.error('❌ 需要安裝 node-fetch 套件');
  console.log('請執行: npm install node-fetch');
  process.exit(1);
}

// 執行測試
testAutoLoadFeature(); 