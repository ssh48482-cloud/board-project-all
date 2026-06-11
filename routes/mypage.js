const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// 마이페이지 메인 화면 조회
router.get('/', (req, res) => {
    if (!req.session.user) return res.redirect('/user/login');
    const username = req.session.user.username;
    const userId = req.session.user.id;

    // 1. 내 문의글 조회
    db.all('SELECT * FROM posts WHERE author = ? ORDER BY id DESC', [username], (err, myPosts) => {
        // 2. 내 주문 내역 조회
        db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId], (err2, myOrders) => {
            // 3. 내 위시리스트(상품 정보 포함) 조회
            const wishQuery = `
                SELECT p.* FROM wishlist w
                JOIN products p ON w.product_id = p.id
                WHERE w.user_id = ?`;
            db.all(wishQuery, [userId], (err3, myWishlist) => {
                res.render('mypage', {
                    user: req.session.user,
                    posts: myPosts || [],
                    orders: myOrders || [],
                    wishlist: myWishlist || [] // 찜한 상품 목록 전달
                });
            });
        });
    });
});

// 회원 정보(이름/닉네임) 수정 처리
router.post('/update', (req, res) => {
    if (!req.session.user) return res.status(403).send('권한이 없습니다.');

    const { name } = req.body;
    const username = req.session.user.username;

    db.run('UPDATE users SET name = ? WHERE username = ?', [name, username], (err) => {
        if (err) return res.send('수정 실패');

        // 데이터베이스 수정 후 현재 세션에 저장된 이름도 동기화 갱신
        req.session.user.name = name;
        res.send('<script>alert("회원 정보가 성공적으로 수정되었습니다."); location.href="/mypage";</script>');
    });
});

module.exports = router;