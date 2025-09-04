// 더미 데이터 생성
const dummyData = {
    // 사용자 데이터
    users: [
        { 
            uid: 'u001', 
            name: '김철수', 
            email: 'kim@example.com', 
            role: 'customer',
            memberId: 'cafe24_kim',
            phone: '010-1234-5678',
            createdAt: '2024-01-15'
        },
        { 
            uid: 'u002', 
            name: '이영희', 
            email: 'lee@example.com', 
            role: 'customer',
            memberId: 'cafe24_lee',
            phone: '010-2345-6789',
            createdAt: '2024-01-20'
        },
        { 
            uid: 'u003', 
            name: '모던인테리어', 
            email: 'park@example.com', 
            role: 'vendor',
            vendorId: 'v001',
            memberId: 'cafe24_park',
            phone: '010-3456-7890',
            createdAt: '2024-01-10'
        },
        { 
            uid: 'u004', 
            name: '최민수', 
            email: 'choi@example.com', 
            role: 'vendor',
            vendorId: 'v002',
            memberId: 'cafe24_choi',
            phone: '010-4567-8901',
            createdAt: '2024-01-12'
        },
        { 
            uid: 'u005', 
            name: '관리자', 
            email: 'admin@example.com', 
            role: 'admin',
            memberId: 'cafe24_admin',
            createdAt: '2024-01-01'
        }
    ],

    // 벤더 데이터
    vendors: [
        {
            vendorId: 'v001',
            companyName: '모던인테리어',
            type: '인테리어공사',
            areas: ['서울', '경기'],
            specialties: ['아파트', '주거공간', '모던스타일'],
            rating: 4.5,
            completedProjects: 32,
            status: 'active',
            documents: ['사업자등록증', '시공면허'],
            description: '10년 경력의 전문 인테리어 업체입니다.',
            portfolio: [
                { title: '강남 아파트 리모델링', image: 'portfolio1.jpg', year: 2023 },
                { title: '판교 오피스텔 인테리어', image: 'portfolio2.jpg', year: 2023 }
            ]
        },
        {
            vendorId: 'v002',
            companyName: '드림디자인',
            type: '인테리어공사',
            areas: ['서울', '인천'],
            specialties: ['상업공간', '카페', '북유럽스타일'],
            rating: 4.8,
            completedProjects: 45,
            status: 'active',
            documents: ['사업자등록증', '시공면허', '디자인특허'],
            description: '감각적인 디자인과 꼼꼼한 시공으로 유명합니다.',
            portfolio: [
                { title: '홍대 카페 인테리어', image: 'portfolio3.jpg', year: 2023 },
                { title: '성수 팝업스토어', image: 'portfolio4.jpg', year: 2024 }
            ]
        },
        {
            vendorId: 'v003',
            companyName: '우드하우스',
            type: '가구판매',
            areas: ['전국'],
            specialties: ['원목가구', '주문제작'],
            rating: 4.6,
            completedProjects: 120,
            status: 'pending',
            documents: ['사업자등록증'],
            description: '친환경 원목 가구 전문 제작 업체입니다.'
        }
    ],

    // 프로젝트 데이터
    projects: [
        {
            projectId: 'p001',
            managementNumber: 'SS250902-' + Math.floor(Math.random() * 900 + 100),
            ownerUid: 'u001',
            ownerName: '김철수',
            title: '강남 아파트 32평 리모델링',
            budget: 50000000,
            region: '서울 강남구',
            area: '32평',
            style: ['모던', '미니멀'],
            description: '오래된 아파트를 모던하고 깔끔한 스타일로 전체 리모델링하고 싶습니다.',
            files: [
                { name: 'floor_plan.pdf', type: 'pdf', url: 'https://via.placeholder.com/800x600/e3f2fd/1976d2?text=Floor+Plan+PDF' },
                { name: 'reference1.jpg', type: 'image', url: 'https://via.placeholder.com/600x400/f3e5f5/8e24aa?text=Modern+Living+Room' },
                { name: 'reference2.jpg', type: 'image', url: 'https://via.placeholder.com/600x400/e8f5e9/43a047?text=Kitchen+Design' }
            ],
            status: 'PENDING_QUOTES',
            createdAt: '2024-12-01',
            deadline: '2025-03-01',
            requirements: '주방 확장, 거실 바닥재 교체, 전체 도배 및 장판',
            quoteCount: 2
        },
        {
            projectId: 'p002',
            managementNumber: 'SS250902-' + Math.floor(Math.random() * 900 + 100),
            ownerUid: 'u002',
            ownerName: '이영희',
            title: '판교 오피스텔 20평 인테리어',
            budget: 30000000,
            region: '경기 성남시',
            area: '20평',
            style: ['북유럽', '화이트톤'],
            description: '신축 오피스텔 첫 입주 인테리어입니다. 밝고 따뜻한 느낌으로 꾸미고 싶어요.',
            files: [
                { name: 'floor_plan2.pdf', type: 'pdf', url: 'https://via.placeholder.com/800x600/fff3e0/e65100?text=Officetel+Floor+Plan' },
                { name: 'nordic_style.jpg', type: 'image', url: 'https://via.placeholder.com/600x400/fafafa/9e9e9e?text=Nordic+Style+Reference' }
            ],
            status: 'CONTRACT_IN_PROGRESS',
            createdAt: '2024-11-25',
            deadline: '2025-02-15',
            requirements: '붙박이장 설치, 주방 아일랜드 추가',
            quoteCount: 3,
            selectedVendor: 'v001'
        },
        {
            projectId: 'p003',
            managementNumber: 'SS250902-' + Math.floor(Math.random() * 900 + 100),
            ownerUid: 'u001',
            ownerName: '김철수',
            title: '홍대 카페 50평 인테리어',
            budget: 80000000,
            region: '서울 마포구',
            area: '50평',
            style: ['인더스트리얼', '빈티지'],
            description: '홍대에 오픈 예정인 카페입니다. 트렌디하고 개성있는 공간으로 만들고 싶습니다.',
            files: [
                { name: 'cafe_layout.pdf', type: 'pdf', url: 'https://via.placeholder.com/800x600/efebe9/5d4037?text=Cafe+Layout' },
                { name: 'mood_board.jpg', type: 'image', url: 'https://via.placeholder.com/600x400/424242/ffffff?text=Industrial+Mood+Board' },
                { name: 'lighting_ref.jpg', type: 'image', url: 'https://via.placeholder.com/600x400/ffc107/000000?text=Lighting+Reference' }
            ],
            status: 'PENDING_QUOTES',
            createdAt: '2024-12-05',
            deadline: '2025-04-01',
            requirements: '바 테이블 제작, 조명 설계, 음향 시설',
            quoteCount: 1
        },
        {
            projectId: 'p004',
            managementNumber: 'SS250902-' + Math.floor(Math.random() * 900 + 100),
            title: '성수동 팝업스토어 30평',
            budget: 40000000,
            region: '서울 성동구',
            area: '30평',
            style: ['모던', '미니멀'],
            status: 'COMPLETED',
            createdAt: '2024-10-01',
            completedAt: '2024-11-20',
            publicMeta: {
                region: '서울 성동구',
                budget: '4천만원대',
                style: '모던'
            }
        }
    ],

    // 견적 데이터
    quotes: [
        {
            quoteId: 'q001',
            projectId: 'p001',
            vendorId: 'v001',
            vendorName: '모던인테리어',
            amount: 48000000,
            duration: '60일',
            validUntil: '2025-01-15',
            status: 'submitted',
            createdAt: '2024-12-02',
            details: {
                demolition: 3000000,
                construction: 15000000,
                flooring: 8000000,
                painting: 5000000,
                kitchen: 10000000,
                bathroom: 7000000
            },
            terms: '계약금 30%, 중도금 40%, 잔금 30%',
            warranty: '2년 A/S 보장',
            exceptions: '가전제품 및 이사 비용 별도'
        },
        {
            quoteId: 'q002',
            projectId: 'p001',
            vendorId: 'v002',
            vendorName: '드림디자인',
            amount: 52000000,
            duration: '45일',
            validUntil: '2025-01-20',
            status: 'submitted',
            createdAt: '2024-12-03',
            details: {
                demolition: 3500000,
                construction: 16000000,
                flooring: 9000000,
                painting: 5500000,
                kitchen: 11000000,
                bathroom: 7000000
            },
            terms: '계약금 20%, 중도금 50%, 잔금 30%',
            warranty: '3년 A/S 보장',
            exceptions: '가구 별도'
        },
        {
            quoteId: 'q003',
            projectId: 'p003',
            vendorId: 'v002',
            vendorName: '드림디자인',
            amount: 75000000,
            duration: '75일',
            validUntil: '2025-01-30',
            status: 'submitted',
            createdAt: '2024-12-06',
            details: {
                demolition: 5000000,
                construction: 25000000,
                flooring: 12000000,
                painting: 8000000,
                lighting: 10000000,
                furniture: 15000000
            },
            terms: '계약금 30%, 중도금 40%, 잔금 30%',
            warranty: '2년 A/S 보장',
            exceptions: '주방기기 별도'
        }
    ],

    // 계약 데이터
    contracts: [
        {
            contractId: 'c001',
            projectId: 'p002',
            vendorId: 'v001',
            quoteId: 'q_p002_v001',
            amount: 28000000,
            signedAt: '2024-11-28',
            startDate: '2024-12-01',
            endDate: '2025-02-15',
            status: 'active',
            milestones: [
                { id: 'm001', name: '계약금', amount: 8400000, percentage: 30, status: 'paid', paidAt: '2024-11-28' },
                { id: 'm002', name: '중도금', amount: 11200000, percentage: 40, status: 'pending', dueDate: '2025-01-15' },
                { id: 'm003', name: '잔금', amount: 8400000, percentage: 30, status: 'pending', dueDate: '2025-02-15' }
            ]
        }
    ],

    // 주문 데이터 (카페24 연동 시뮬레이션)
    orders: [
        {
            orderId: 'o001',
            orderNo: 'CAFE24-2024112801',
            projectId: 'p002',
            contractId: 'c001',
            milestoneId: 'm001',
            amount: 8400000,
            status: 'paid',
            paymentMethod: '신용카드',
            paidAt: '2024-11-28',
            cafe24Data: {
                memberId: 'cafe24_lee',
                productNo: 'SKU-TEMP-001',
                paymentGateway: 'inicis'
            }
        }
    ],

    // 리뷰 데이터
    reviews: [
        {
            reviewId: 'r001',
            projectId: 'p004',
            vendorId: 'v001',
            customerUid: 'u003',
            rating: 5,
            content: '정말 만족스러운 시공이었습니다. 디자인 감각도 좋고 꼼꼼하게 작업해주셨어요.',
            images: ['review1.jpg', 'review2.jpg'],
            createdAt: '2024-11-25'
        }
    ]
};

// 현재 로그인한 사용자 (시뮬레이션)
let currentUser = null;

// 로컬 스토리지에 더미 데이터 저장
function initDummyData() {
    if (!localStorage.getItem('dummyData')) {
        localStorage.setItem('dummyData', JSON.stringify(dummyData));
    }
}

// 데이터 가져오기
function getData() {
    return JSON.parse(localStorage.getItem('dummyData') || JSON.stringify(dummyData));
}

// 데이터 업데이트
function updateData(data) {
    localStorage.setItem('dummyData', JSON.stringify(data));
}

// 초기화
initDummyData();