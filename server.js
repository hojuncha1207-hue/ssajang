const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// public 폴더의 정적 파일(index.html, css, js)을 제공합니다.
app.use(express.static(path.join(__dirname, 'public')));

// Render의 환경 변수(DATABASE_URL)를 사용합니다.
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
});

// ✨ 특정 가게 ID에 해당하는 주문 내역을 불러오는 API ✨
app.get('/orders/:storeId', async (req, res) => {
    const { storeId } = req.params;

    try {
        const query = `
            SELECT
                o.order_id,
                o.user_id,
                o.total_price,
                o.order_date,
                json_agg(
                    json_build_object(
                        'name', oi.product_name,
                        'quantity', oi.quantity,
                        'price', oi.price
                    )
                ) AS items
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.store_id = $1
            GROUP BY o.order_id
            ORDER BY o.order_date DESC;
        `;
        const { rows } = await pool.query(query, [storeId]);
        res.json(rows);
    } catch (error)
    {
        console.error('DB 조회 오류:', error);
        res.status(500).json({ error: '서버에서 주문 내역을 조회하는 데 실패했습니다.' });
    }
});

// Render의 PORT 환경 변수를 사용합니다.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT} 에서 실행 중입니다.`);
});
