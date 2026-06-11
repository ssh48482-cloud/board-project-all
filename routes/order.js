const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

router.post('/confirm', (req, res) => {
    const user = req.session.user;
    if (!user) return res.send('<script>alert("로그인이 필요합니다."); location.href="/login";</script>');

    // ✅ 방금 화면(cart.ejs) 폼에서 전송된 배송 정보 3가지 받기
    const { address, phone, receiver_name } = req.body;

    // 1. 장바구니 정보와 상품 정보를 JOIN해서 가져오기
    const cartQuery = `
        SELECT p.id, p.price, c.quantity
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?`;

    db.all(cartQuery, [user.id], (err, items) => {
        if (err || !items || items.length === 0) {
            return res.send('<script>alert("장바구니가 비어 있습니다."); history.back();</script>');
        }

        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // ✅ 2. orders 테이블에 주문 생성 (address, phone 컬럼 추가하여 저장)
        db.run('INSERT INTO orders (user_id, total_price, status, address, phone) VALUES (?, ?, ?, ?, ?)',
            [user.id, totalPrice, '주문완료', address, phone],
            function(err) {
                if (err) {
                    console.error('❌ 주문 생성 오류:', err.message); // 터미널에 구체적 에러 출력
                    return res.status(500).send('주문 생성 실패: ' + err.message);
                }

                const orderId = this.lastID;

                // 3. order_items 테이블에 상세 내역 저장
                const itemInsert = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
                items.forEach(item => {
                    itemInsert.run(orderId, item.id, item.quantity, item.price);
                });

                itemInsert.finalize((finalizeErr) => {
                    if (finalizeErr) return res.send('주문 상세 저장 실패');

                    // 4. 장바구니 비우기
                    db.run('DELETE FROM cart_items WHERE user_id = ?', [user.id], (delErr) => {
                        // ✅ 주문 완료 페이지로 결제 금액과 배송 정보 함께 넘겨주기
                        res.render('order_confirm', { user, totalPrice, address, receiver_name });
                    });
                });
            }
        );
    });
});

module.exports = router;