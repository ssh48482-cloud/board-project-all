const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// 찜하기 추가
router.get('/add/:id', (req, res) => {
    const user = req.session.user;
    if (!user) return res.send('<script>alert("로그인이 필요합니다."); location.href="/user/login";</script>');

    const productId = req.params.id;

    // 이미 찜했는지 확인 후 추가
    db.get('SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?', [user.id, productId], (err, row) => {
        if (row) {
            return res.send('<script>alert("이미 위시리스트에 있는 상품입니다."); history.back();</script>');
        }
        db.run('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [user.id, productId], (err) => {
            res.send('<script>alert("위시리스트에 추가되었습니다."); history.back();</script>');
        });
    });
});

// 찜하기 삭제
router.get('/remove/:id', (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(403).send('로그인 필요');

    db.run('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [user.id, req.params.id], (err) => {
        res.redirect('/mypage');
    });
});

module.exports = router;