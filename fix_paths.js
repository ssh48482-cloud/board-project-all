const fs = require('fs');
const path = require('path');

// views 폴더 경로 설정
const viewsDir = path.join(__dirname, 'views');

fs.readdir(viewsDir, (err, files) => {
  if (err) {
    return console.log('❌ views 폴더를 찾을 수 없습니다.', err);
  }

  files.forEach(file => {
    // .ejs 파일만 찾아서 작업
    if (path.extname(file) === '.ejs') {
      const filePath = path.join(viewsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');

      // href="/, src="/, action="/ 부분을 모두 상대 경로(./)로 싹 다 교체!
      const originalContent = content;
      content = content.replace(/href="\//g, 'href="./');
      content = content.replace(/src="\//g, 'src="./');
      content = content.replace(/action="\//g, 'action="./');

      // 바뀐 내용이 있으면 저장
      if (originalContent !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${file} 경로 자동 수정 완료!`);
      } else {
        console.log(`➖ ${file} (수정할 경로 없음)`);
      }
    }
  });
  console.log('\n🎉 모든 ejs 파일의 상대 경로 변환이 완벽하게 끝났습니다!');
});