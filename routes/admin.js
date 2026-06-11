const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// 관리자 권한 체크 미들웨어
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.is_admin === 1) {
        next();
    } else {
        res.send('<script>alert("관리자만 접근 가능합니다."); location.href="/";</script>');
    }
};

// 관리자 메인 (대시보드 - 회원, 상품, 주문 목록 통합 조회)
router.get('/', isAdmin, (req, res) => {
    db.all('SELECT id, username, name, is_admin FROM users', (err, users) => {
        db.all('SELECT * FROM products', (err2, products) => {
            db.all('SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC', (err3, orders) => {
                res.render('admin', { users, products, orders });
            });
        });
    });
});

// 회원 강제 탈퇴 처리
router.get('/user/delete/:id', isAdmin, (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
        res.send('<script>alert("회원이 탈퇴 처리되었습니다."); location.href="/admin";</script>');
    });
});

// 주문 상태 변경 (배송중, 배송완료 등)
router.post('/order/status', isAdmin, (req, res) => {
    const { orderId, status } = req.body;
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], (err) => {
        res.send('<script>alert("주문 상태가 변경되었습니다."); location.href="/admin";</script>');
    });
});

module.exports = router;