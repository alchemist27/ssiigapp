# 인테리어 매칭 플랫폼 MVP (카페24 연동)

## 개요
카페24 쇼핑몰과 연동되는 인테리어 매칭 플랫폼 MVP입니다. 고객과 인테리어 업체를 매칭하고, 견적부터 계약까지 관리할 수 있습니다.

## 프로젝트 구조
```
cafe24-interior-mvp/
├── index.html                 # 메인 애플리케이션
├── cafe24-skin-template.html  # 카페24 스킨 템플릿
├── cafe24-loader.js          # 카페24 임베드 로더
├── public/
│   ├── css/
│   │   └── style.css         # 스타일시트
│   └── js/
│       ├── app.js            # 메인 앱 로직
│       └── dummy-data.js     # 더미 데이터
└── README.md
```

## 주요 기능

### 고객 기능
- 프로젝트 등록 (도면 업로드, 예산, 지역, 스타일 설정)
- 타 고객 프로젝트 둘러보기 (상세내용은 비공개)
- 받은 견적 비교 및 선택
- 계약 체결 프로세스

### 벤더 기능
- 지역/전문분야별 프로젝트 열람
- 견적서 제출
- 대시보드 (통계, 진행 프로젝트)

### 관리자 기능
- 벤더 입점 심사
- 프로젝트/분쟁 관리

## 테스트 방법

### 1. 로컬 테스트
```bash
# 프로젝트 폴더로 이동
cd cafe24-interior-mvp

# 로컬 서버 실행 (Python 3)
python3 -m http.server 8000

# 또는 Node.js 사용시
npx http-server -p 8000

# 브라우저에서 접속
http://localhost:8000
```

### 2. 테스트 계정
- **고객**: 김철수 (로그인시 1번 선택)
- **벤더**: 모던인테리어 (로그인시 2번 선택)  
- **관리자**: 관리자 (로그인시 3번 선택)

### 3. 주요 테스트 시나리오

#### 고객 플로우
1. 로그인 버튼 클릭 → 1번(고객) 선택
2. "프로젝트 등록" 클릭
3. 프로젝트 정보 입력 후 등록
4. 프로젝트 목록에서 등록된 프로젝트 확인
5. 견적이 있는 프로젝트 클릭하여 견적 비교

#### 벤더 플로우
1. 로그인 버튼 클릭 → 2번(벤더) 선택
2. "벤더 대시보드" 클릭
3. 견적 가능한 프로젝트 확인
4. 프로젝트 상세보기 후 "견적 제출하기" 클릭
5. 견적 정보 입력 후 제출

#### 관리자 플로우
1. 로그인 버튼 클릭 → 3번(관리자) 선택
2. "관리자" 메뉴 클릭
3. 대기중인 벤더 승인 처리

## 카페24 연동 가이드

### 1. 카페24 스킨 설치
1. 카페24 관리자 → 쇼핑몰 꾸미기 → 스킨 편집
2. `cafe24-skin-template.html` 내용을 원하는 페이지에 추가
3. `cafe24-loader.js`를 스킨 파일에 업로드

### 2. 카페24 설정
```javascript
// cafe24-loader.js의 APP_URL을 실제 배포 URL로 변경
const APP_URL = 'https://your-app.vercel.app';
```

### 3. 카페24 API 설정
- Admin API 권한 필요 항목:
  - 상품 생성/조회 (비공개 SKU 생성용)
  - 주문 생성/조회
  - 회원 조회

### 4. Webhook 설정
- 주문완료: `/api/webhooks/cafe24/order-complete`
- 주문취소: `/api/webhooks/cafe24/order-cancel`
- 환불완료: `/api/webhooks/cafe24/refund-complete`

## 실제 구현시 필요한 작업

### Backend 구현
- [ ] Firebase 프로젝트 설정
- [ ] Next.js API Routes 구현
- [ ] 카페24 OAuth 2.0 인증
- [ ] 카페24 Admin API 연동
- [ ] Webhook 처리 로직
- [ ] JWT 기반 SSO 구현

### Frontend 개선
- [ ] Next.js로 마이그레이션
- [ ] 상태관리 (Redux/Zustand)
- [ ] 실제 파일 업로드 구현
- [ ] 반응형 디자인 개선

### 보안
- [ ] 입력값 검증
- [ ] CORS 설정
- [ ] Rate Limiting
- [ ] 파일 업로드 보안

### 결제
- [ ] PG사 연동 (이니시스, KG이니시스 등)
- [ ] 에스크로 설정
- [ ] 부분취소/환불 로직

## 기술 스택
- **Frontend**: HTML/CSS/JavaScript (MVP) → Next.js (Production)
- **Backend**: Next.js API Routes + Firebase Functions
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Auth**: Firebase Auth + 카페24 SSO
- **Deployment**: Vercel

## 라이선스
Private