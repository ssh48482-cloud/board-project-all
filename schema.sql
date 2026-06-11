-- 1. 사용자 테이블 (is_admin 컬럼 추가로 관리자 권한 대응)
CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     username TEXT UNIQUE NOT NULL,
                                     password TEXT NOT NULL,
                                     name TEXT NOT NULL,
                                     is_admin INTEGER DEFAULT 0 -- 0: 일반사용자, 1: 관리자
);

-- 2. 게시글 테이블 (공지사항 및 1:1 문의 통합)
CREATE TABLE IF NOT EXISTS posts (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     title TEXT NOT NULL,
                                     content TEXT NOT NULL,
                                     parent_id INTEGER, -- 답글일 경우 원글의 ID 저장
                                     author TEXT NOT NULL,
                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 게시판 첨부 파일 테이블 (교수님 PPT 요구사항)
CREATE TABLE IF NOT EXISTS files (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     post_id INTEGER NOT NULL,
                                     filename TEXT NOT NULL,
                                     filepath TEXT NOT NULL,
                                     FOREIGN KEY(post_id) REFERENCES posts(id)
    );

-- 4. 상품 테이블
CREATE TABLE IF NOT EXISTS products (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        name TEXT NOT NULL,
                                        description TEXT,
                                        price INTEGER NOT NULL,
                                        emoji TEXT,
                                        image TEXT,
                                        likes INTEGER DEFAULT 0,
                                        is_featured INTEGER DEFAULT 0 -- 1이면 메인 추천 상품
);

-- 5. 장바구니 테이블
CREATE TABLE IF NOT EXISTS cart_items (
                                          user_id INTEGER NOT NULL,
                                          product_id INTEGER NOT NULL,
                                          quantity INTEGER DEFAULT 1,
                                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                          PRIMARY KEY(user_id, product_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
    );

-- 6. 위시리스트 테이블 (추가 기능 2번 대응)
CREATE TABLE IF NOT EXISTS wishlist (
                                        user_id INTEGER NOT NULL,
                                        product_id INTEGER NOT NULL,
                                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                        PRIMARY KEY(user_id, product_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
    );

-- 7. 주문 내역 테이블 (추가 기능 2번 대응 - 주문 요약)
CREATE TABLE IF NOT EXISTS orders (
                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      user_id INTEGER NOT NULL,
                                      total_price INTEGER NOT NULL,
                                      status TEXT DEFAULT '주문완료', -- 주문완료, 배송중, 배송완료 등
                                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                      FOREIGN KEY(user_id) REFERENCES users(id)
    );

-- 8. 주문 상세 테이블 (주문 시점의 상품명, 가격, 수량 기록)
CREATE TABLE IF NOT EXISTS order_items (
                                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                                           order_id INTEGER NOT NULL,
                                           product_id INTEGER NOT NULL,
                                           quantity INTEGER NOT NULL,
                                           price INTEGER NOT NULL, -- 주문 당시의 가격 (나중에 상품 가격이 변할 수 있으므로 기록)
                                           FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
    );