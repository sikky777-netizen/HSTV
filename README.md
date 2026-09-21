# 우리집 TV 계산기 PWA

반응형 정적 PWA입니다. 별도 빌드 없이 Vercel, Netlify, GitHub Pages 등 정적 호스팅에 올릴 수 있습니다.

## 구성
- 시청거리 기반 기본 TV 크기
- 시력 보정값
- 콘텐츠/자막/게임 반영
- 예산 + 크기/화질 우선순위 반영
- 방 밝기/시청각도 기반 패널 추천
- 벽 폭/눈높이 기반 설치 체크
- PWA 설치 버튼 및 오프라인 캐시
- 입력/결과 2단계 화면 전환
- 모바일 한 화면용 핵심 입력 + 상세 조건 접기
- 입력 화면과 결과 화면 광고 슬롯
- 결과 이유와 설치 안내 전체 표시
- 상단 벽걸이 TV 설치·선 숨김 전화 배너
- 벽걸이 TV 전화상담 CTA

## 배포
1. 폴더 전체를 GitHub 저장소에 업로드
2. Vercel에서 저장소 Import
3. Framework Preset: Other
4. Build Command: 비워두기
5. Output Directory: `.`
6. Deploy

커스텀 도메인은 Vercel Settings > Domains에서 연결하면 됩니다.
