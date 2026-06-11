const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'db/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. orders 테이블에 주소(address)와 연락처(phone) 컬럼 추가
    db.run("ALTER TABLE orders ADD COLUMN address TEXT", (err) => {
        if (err) console.log("주소 컬럼이 이미 있거나 추가할 수 없습니다.");
        else console.log("✅ 주소 컬럼 추가 완료");
    });

    db.run("ALTER TABLE orders ADD COLUMN phone TEXT", (err) => {
        if (err) console.log("연락처 컬럼이 이미 있거나 추가할 수 없습니다.");
        else console.log("✅ 연락처 컬럼 추가 완료");
    });

    // 2. 관리자 권한 확인 (혹시 모르니 다시 실행)
    db.run("UPDATE users SET is_admin = 1 WHERE username = 'admin'", () => {
        console.log("✅ 관리자 권한 확인 완료");
        db.close();
    });
});