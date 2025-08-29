// server.js (수정 후 최종본)
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path'); // path 모듈 추가

const app = express();
app.use(cors());

// 중요: public 폴더의 정적 파일을 제공하도록 설정
app.use(express.static(path.join(__dirname, 'public')));

// Render에서 자동으로 제공하는 환경 변수(DATABASE_URL)를 사용합니다.
// 로컬 테스트를 위해 || 연산자로 기존 연결 문자열을 남겨둘 수 있습니다.
const connectionString = process.env.DATABASE_URL || '여기에_NEON_연결_문자열을_붙여넣으세요';

const pool = new Pool({
    connectionString: connectionString,
    // Render에서 배포 시 SSL 연결이 필수입니다.
    ssl: {
      rejectUnauthorized: false
    }
});

// API 로직은 이전과 동일합니다.
app.get('/orders/:storeId', async (req, res) => {
    const { storeId } = req.params;
    // ... (이전과 동일한 DB 조회 로직) ...
    try {
        const query = `
            SELECT
                o.order_id, o.user_id, o.total_price, o.order_date,
                json_agg(json_build_object('name', oi.product_name, 'quantity', oi.quantity, 'price', oi.price)) AS items
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.store_id = $1
            GROUP BY o.order_id
            ORDER BY o.order_date DESC;
        `;
        const { rows } = await pool.query(query, [storeId]);
        res.json(rows);
    } catch (error) {
        console.error('DB 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// Render에서 자동으로 제공하는 PORT 환경 변수를 사용합니다.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT} 에서 실행 중입니다.`);
});