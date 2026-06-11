const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// 회원가입 페이지
router.get('/register', (req, res) => {
    res.render('register'); //register.ejs
});

// 회원가입 처리
router.post('/register', async (req, res) => {
    const { username, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
        [username, hashedPassword, name],
        (err) => {
            if (err) {
                console.error(err.message);
                return res.send('회원가입 실패');
            }
            res.redirect('/user/login');
        }
    );
});

// 로그인 페이지
router.get('/login', (req, res) => {
    res.render('login'); //login.ejs
});

// 로그인 처리
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) {
            return res.send('존재하지 않는 사용자입니다.');
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.status(401).render('login_failed');
        }
    });
});

// 로그아웃
// router.get('/logout', (req, res) => {
//     req.session.destroy();
//     res.redirect('/');
// });
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ 로그아웃 오류:', err);
        }
        res.redirect('/');
    });
});
// 회원 탈퇴 처리
router.get('/withdraw', (req, res) => {
    const user = req.session.user;
    if (!user) return res.send('<script>alert("로그인이 필요합니다."); location.href="/user/login";</script>');

    const userId = user.id;

    // 1. 유저 테이블에서 해당 아이디 삭제 (물리 삭제)
    // 이렇게 삭제해야 나중에 같은 아이디로 '재가입'이 바로 가능합니다.
    db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
        if (err) return res.send('탈퇴 처리 중 오류가 발생했습니다.');

        // 2. 세션 삭제 (로그아웃 처리)
        req.session.destroy(() => {
            res.send('<script>alert("회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다."); location.href="/";</script>');
        });
    });
});
module.exports = router;
