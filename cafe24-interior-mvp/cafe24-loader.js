/**
 * 카페24 스킨 임베드용 로더 스크립트
 * 카페24 스킨 HTML에 삽입하여 인테리어 매칭 플랫폼 앱을 로드합니다
 * 
 * 사용법:
 * 1. 이 스크립트를 카페24 스킨 편집기에서 HTML 헤더에 추가
 * 2. 앱을 표시할 위치에 <div id="interior-matching-app"></div> 추가
 */

(function() {
    // MVP 앱 URL (실제 배포시 Vercel URL로 변경)
    const APP_URL = 'https://your-app.vercel.app';
    const IFRAME_ID = 'interior-matching-iframe';
    
    // 카페24 회원 정보 가져오기 (카페24 템플릿 변수)
    function getCafe24MemberInfo() {
        // 카페24 스킨에서는 다음과 같은 템플릿 변수를 사용 가능
        // {$member_id} - 회원 아이디
        // {$name} - 회원 이름
        // {$email} - 이메일
        // {$phone} - 전화번호
        
        return {
            memberId: typeof CAFE24 !== 'undefined' && CAFE24.MEMBER ? CAFE24.MEMBER.member_id : null,
            name: typeof CAFE24 !== 'undefined' && CAFE24.MEMBER ? CAFE24.MEMBER.name : null,
            email: typeof CAFE24 !== 'undefined' && CAFE24.MEMBER ? CAFE24.MEMBER.email : null,
            isLoggedIn: typeof CAFE24 !== 'undefined' && CAFE24.MEMBER ? CAFE24.MEMBER.is_login : false
        };
    }
    
    // SSO 토큰 생성 (실제 구현시 서버 API 호출)
    function generateSSOToken(memberInfo) {
        // MVP에서는 간단한 Base64 인코딩 사용
        // 실제 구현시 서버에서 JWT 토큰 발급
        const tokenData = {
            memberId: memberInfo.memberId,
            name: memberInfo.name,
            email: memberInfo.email,
            timestamp: Date.now(),
            nonce: Math.random().toString(36).substring(7)
        };
        
        return btoa(JSON.stringify(tokenData));
    }
    
    // 앱 로더 초기화
    function initializeApp() {
        const container = document.getElementById('interior-matching-app');
        if (!container) {
            console.warn('Interior Matching App container not found');
            return;
        }
        
        const memberInfo = getCafe24MemberInfo();
        const ssoToken = memberInfo.isLoggedIn ? generateSSOToken(memberInfo) : null;
        
        // iframe으로 앱 로드
        const iframe = document.createElement('iframe');
        iframe.id = IFRAME_ID;
        iframe.src = `${APP_URL}?sso=${ssoToken}&cafe24=true`;
        iframe.style.width = '100%';
        iframe.style.minHeight = '800px';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        
        // 반응형 높이 조정
        iframe.onload = function() {
            // postMessage를 통한 높이 자동 조정
            window.addEventListener('message', function(e) {
                if (e.data.type === 'resize' && e.data.height) {
                    iframe.style.height = e.data.height + 'px';
                }
            });
        };
        
        container.appendChild(iframe);
    }
    
    // 카페24 API 연동 헬퍼 함수들
    window.Cafe24InteriorApp = {
        // 상품 생성 (비공개 SKU)
        createPrivateSKU: function(productData) {
            // 카페24 Admin API 호출 시뮬레이션
            console.log('Creating private SKU:', productData);
            
            // 실제 구현시:
            // POST /api/v2/admin/products
            // Authorization: Bearer {access_token}
            
            return Promise.resolve({
                product_no: 'TEMP-' + Date.now(),
                product_code: 'SKU-' + Date.now(),
                price: productData.price,
                display: 'F' // 비공개
            });
        },
        
        // 주문 생성
        createOrder: function(orderData) {
            console.log('Creating order:', orderData);
            
            // 실제 구현시:
            // 카페24 주문 API 호출
            
            return Promise.resolve({
                order_id: 'ORDER-' + Date.now(),
                payment_url: '/order/payment.html'
            });
        },
        
        // 회원 정보 동기화
        syncMemberData: function() {
            const memberInfo = getCafe24MemberInfo();
            
            // 앱으로 회원 정보 전송
            const iframe = document.getElementById(IFRAME_ID);
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'member_sync',
                    data: memberInfo
                }, '*');
            }
            
            return memberInfo;
        },
        
        // 로그인 체크
        checkLogin: function() {
            const memberInfo = getCafe24MemberInfo();
            if (!memberInfo.isLoggedIn) {
                // 카페24 로그인 페이지로 리다이렉트
                window.location.href = '/member/login.html?return_url=' + encodeURIComponent(window.location.href);
                return false;
            }
            return true;
        }
    };
    
    // DOM 로드 완료시 앱 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
    
    // 카페24 전역 이벤트 리스너
    if (typeof CAFE24 !== 'undefined' && CAFE24.MEMBER) {
        // 로그인 상태 변경 감지
        setInterval(function() {
            window.Cafe24InteriorApp.syncMemberData();
        }, 5000);
    }
})();

// 카페24 Webhook 수신 엔드포인트 예시
/*
 * Webhook 설정 (카페24 관리자 페이지에서 설정)
 * 
 * 주문 완료: https://your-app.vercel.app/api/webhooks/cafe24/order-complete
 * 주문 취소: https://your-app.vercel.app/api/webhooks/cafe24/order-cancel
 * 환불 완료: https://your-app.vercel.app/api/webhooks/cafe24/refund-complete
 * 
 * Webhook 페이로드 예시:
 * {
 *   "event_no": "2024120501",
 *   "event_shop_no": "1",
 *   "event_type": "order_complete",
 *   "resource": {
 *     "order_id": "20241205-0000001",
 *     "member_id": "cafe24_kim",
 *     "order_item_list": [...],
 *     "payment_amount": 8400000
 *   }
 * }
 */