// 메인 애플리케이션 로직
let currentView = 'customer/projects';

// 모의 로그인 기능
function mockLogin() {
    const loginBtn = document.getElementById('loginBtn');
    if (currentUser) {
        currentUser = null;
        loginBtn.textContent = '로그인';
        alert('로그아웃되었습니다.');
    } else {
        // 간단한 로그인 선택 모달
        const role = prompt('로그인 유형을 선택하세요:\n1. 고객 (김철수)\n2. 벤더 (모던인테리어)\n3. 관리자', '1');
        const data = getData();
        
        switch(role) {
            case '1':
                currentUser = data.users.find(u => u.uid === 'u001');
                break;
            case '2':
                currentUser = data.users.find(u => u.uid === 'u003');
                break;
            case '3':
                currentUser = data.users.find(u => u.uid === 'u005');
                break;
            default:
                currentUser = data.users.find(u => u.uid === 'u001');
        }
        
        loginBtn.textContent = currentUser.name + ' (로그아웃)';
        alert(`${currentUser.name}님으로 로그인했습니다.`);
        loadView(currentView);
    }
}

// 뷰 로드 함수
function loadView(view) {
    currentView = view;
    const content = document.getElementById('content');
    
    switch(view) {
        case 'customer/projects':
            loadProjectsGrid();
            break;
        case 'customer/create-project':
            loadCreateProject();
            break;
        case 'customer/quotes':
            loadQuotesView();
            break;
        case 'vendor/dashboard':
            loadVendorDashboard();
            break;
        case 'vendor/submit-quote':
            loadSubmitQuote();
            break;
        case 'admin/dashboard':
            loadAdminDashboard();
            break;
        case 'admin/vendors':
            loadAdminVendors();
            break;
        default:
            loadProjectsGrid();
    }
}

// 프로젝트 그리드 목록
function loadProjectsGrid() {
    const data = getData();
    const content = document.getElementById('content');
    
    let html = `
        <div class="container">
            <h1 style="margin: 2rem 0;">인테리어 프로젝트 둘러보기</h1>
            <div class="tabs">
                <button class="tab-item active" onclick="filterProjects('all')">전체</button>
                <button class="tab-item" onclick="filterProjects('active')">진행중</button>
                <button class="tab-item" onclick="filterProjects('completed')">완료</button>
            </div>
            <div class="projects-grid" id="projectsGrid">
    `;
    
    data.projects.forEach(project => {
        const isOwner = currentUser && project.ownerUid === currentUser.uid;
        const statusText = {
            'PENDING_QUOTES': '견적 대기중',
            'CONTRACT_IN_PROGRESS': '공사 진행중',
            'COMPLETED': '완료'
        }[project.status];
        
        const statusClass = {
            'PENDING_QUOTES': 'pending',
            'CONTRACT_IN_PROGRESS': 'active',
            'COMPLETED': 'completed'
        }[project.status];
        
        html += `
            <div class="project-card" data-status="${project.status}">
                <div class="project-card-header">
                    <h3>${project.title || '프로젝트'}</h3>
                    <span class="project-status status-${statusClass}">${statusText}</span>
                </div>
                <div class="project-card-body">
                    <p><strong>관리번호:</strong> ${project.managementNumber || 'SS250902-' + Math.floor(Math.random() * 900 + 100)}</p>
                    <p><strong>지역:</strong> ${project.region}</p>
                    <p><strong>예산:</strong> ${project.budget ? (project.budget/10000000).toFixed(0) + '천만원' : '비공개'}</p>
                    <p><strong>면적:</strong> ${project.area || '-'}</p>
                    <p><strong>스타일:</strong> ${project.style ? project.style.join(', ') : '-'}</p>
                    ${project.quoteCount ? `<p><strong>받은 견적:</strong> ${project.quoteCount}개</p>` : ''}
                    ${isOwner || (currentUser && currentUser.role === 'vendor') ? 
                        `<button class="btn btn-primary" style="margin-top: 1rem;" onclick="viewProjectDetail('${project.projectId}')">
                            ${isOwner ? '상세보기' : '프로젝트 보기'}
                        </button>` : 
                        '<p style="color: #6c757d; margin-top: 1rem;">로그인 후 상세 확인 가능</p>'
                    }
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

// 프로젝트 필터링
function filterProjects(filter) {
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
        } else if (filter === 'active' && card.dataset.status === 'CONTRACT_IN_PROGRESS') {
            card.style.display = 'block';
        } else if (filter === 'completed' && card.dataset.status === 'COMPLETED') {
            card.style.display = 'block';
        } else if (filter === 'active' && card.dataset.status === 'PENDING_QUOTES') {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 프로젝트 생성 폼
function loadCreateProject() {
    if (!currentUser || currentUser.role !== 'customer') {
        alert('고객으로 로그인해주세요.');
        loadView('customer/projects');
        return;
    }
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="container">
            <h1 style="margin: 2rem 0;">프로젝트 등록</h1>
            <form onsubmit="submitProject(event)" style="max-width: 600px;">
                <div class="form-group">
                    <label class="form-label">프로젝트 제목*</label>
                    <input type="text" class="form-control" name="title" required 
                           placeholder="예: 강남 아파트 32평 리모델링">
                </div>
                
                <div class="form-group">
                    <label class="form-label">지역*</label>
                    <select class="form-control" name="region" required>
                        <option value="">선택하세요</option>
                        <option value="서울 강남구">서울 강남구</option>
                        <option value="서울 서초구">서울 서초구</option>
                        <option value="서울 마포구">서울 마포구</option>
                        <option value="경기 성남시">경기 성남시</option>
                        <option value="경기 용인시">경기 용인시</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">면적*</label>
                    <input type="text" class="form-control" name="area" required 
                           placeholder="예: 32평">
                </div>
                
                <div class="form-group">
                    <label class="form-label">예산*</label>
                    <select class="form-control" name="budget" required>
                        <option value="">선택하세요</option>
                        <option value="20000000">2천만원 이하</option>
                        <option value="30000000">3천만원</option>
                        <option value="50000000">5천만원</option>
                        <option value="80000000">8천만원</option>
                        <option value="100000000">1억원 이상</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">스타일 (복수선택 가능)</label>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <label><input type="checkbox" name="style" value="모던"> 모던</label>
                        <label><input type="checkbox" name="style" value="미니멀"> 미니멀</label>
                        <label><input type="checkbox" name="style" value="북유럽"> 북유럽</label>
                        <label><input type="checkbox" name="style" value="인더스트리얼"> 인더스트리얼</label>
                        <label><input type="checkbox" name="style" value="빈티지"> 빈티지</label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">상세 설명</label>
                    <textarea class="form-control" name="description" rows="4" 
                              placeholder="프로젝트에 대한 상세한 설명을 입력하세요"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">요구사항</label>
                    <textarea class="form-control" name="requirements" rows="3" 
                              placeholder="예: 주방 확장, 거실 바닥재 교체, 전체 도배 및 장판"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">희망 완료일</label>
                    <input type="date" class="form-control" name="deadline">
                </div>
                
                <div class="form-group">
                    <label class="form-label">도면 및 참고 이미지 업로드</label>
                    <div class="file-upload" onclick="document.getElementById('fileInput').click()">
                        <input type="file" id="fileInput" multiple accept=".pdf,.jpg,.png" onchange="previewFiles(this)">
                        <p>클릭하여 파일 선택 (PDF, JPG, PNG)</p>
                        <p style="color: #6c757d; font-size: 0.875rem;">최대 10MB, 최대 5개 파일</p>
                    </div>
                    <div id="filePreview" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;"></div>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">프로젝트 등록</button>
                    <button type="button" class="btn btn-secondary" onclick="loadView('customer/projects')">취소</button>
                </div>
            </form>
        </div>
    `;
}

// 프로젝트 제출
function submitProject(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const styles = formData.getAll('style');
    
    // 파일 처리 (실제로는 업로드 필요, 여기서는 더미 URL 생성)
    const fileInput = document.getElementById('fileInput');
    const files = [];
    if (fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                files.push({
                    name: file.name,
                    type: 'image',
                    url: `https://via.placeholder.com/600x400/random?text=${encodeURIComponent(file.name)}`
                });
            } else {
                files.push({
                    name: file.name,
                    type: 'pdf',
                    url: `https://via.placeholder.com/800x600/e3f2fd/1976d2?text=${encodeURIComponent(file.name)}`
                });
            }
        });
    }
    
    const newProject = {
        projectId: 'p' + Date.now(),
        managementNumber: 'SS250902-' + Math.floor(Math.random() * 900 + 100),
        ownerUid: currentUser.uid,
        ownerName: currentUser.name,
        title: formData.get('title'),
        region: formData.get('region'),
        area: formData.get('area'),
        budget: parseInt(formData.get('budget')),
        style: styles,
        description: formData.get('description'),
        requirements: formData.get('requirements'),
        deadline: formData.get('deadline'),
        status: 'PENDING_QUOTES',
        createdAt: new Date().toISOString().split('T')[0],
        quoteCount: 0,
        files: files
    };
    
    const data = getData();
    data.projects.push(newProject);
    updateData(data);
    
    alert('프로젝트가 성공적으로 등록되었습니다.\n관련 업체에 알림이 전송됩니다.');
    loadView('customer/projects');
}

// 프로젝트 상세보기
function viewProjectDetail(projectId) {
    const data = getData();
    const project = data.projects.find(p => p.projectId === projectId);
    const quotes = data.quotes.filter(q => q.projectId === projectId);
    
    const content = document.getElementById('content');
    let html = `
        <div class="container">
            <h1 style="margin: 2rem 0;">${project.title}</h1>
            
            <div class="quote-card">
                <h3>프로젝트 정보</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <p><strong>고객명:</strong> ${project.ownerName}</p>
                    <p><strong>지역:</strong> ${project.region}</p>
                    <p><strong>면적:</strong> ${project.area}</p>
                    <p><strong>예산:</strong> ${(project.budget/10000000).toFixed(0)}천만원</p>
                    <p><strong>스타일:</strong> ${project.style.join(', ')}</p>
                    <p><strong>희망 완료일:</strong> ${project.deadline}</p>
                </div>
                <p><strong>설명:</strong> ${project.description}</p>
                <p><strong>요구사항:</strong> ${project.requirements}</p>
                
                ${project.files && project.files.length > 0 ? `
                    <div style="margin-top: 1.5rem;">
                        <h4 style="margin-bottom: 1rem;">첨부 파일</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                            ${project.files.map(file => {
                                if (typeof file === 'string') {
                                    // 구 버전 호환성
                                    return `<div style="padding: 1rem; border: 1px solid #ddd; border-radius: 4px;">
                                        <p style="margin: 0;">📎 ${file}</p>
                                    </div>`;
                                } else if (file.type === 'image') {
                                    return `
                                        <div style="border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
                                            <img src="${file.url}" alt="${file.name}" 
                                                 style="width: 100%; height: 150px; object-fit: cover; cursor: pointer;"
                                                 onclick="showImageModal('${file.url}', '${file.name}')">
                                            <p style="padding: 0.5rem; margin: 0; background: #f8f9fa; font-size: 0.875rem;">
                                                🖼️ ${file.name}
                                            </p>
                                        </div>
                                    `;
                                } else {
                                    return `
                                        <div style="border: 1px solid #ddd; border-radius: 4px; overflow: hidden; cursor: pointer;"
                                             onclick="showImageModal('${file.url}', '${file.name}')">
                                            <div style="background: #e3f2fd; height: 150px; display: flex; align-items: center; justify-content: center;">
                                                <span style="font-size: 3rem;">📄</span>
                                            </div>
                                            <p style="padding: 0.5rem; margin: 0; background: #f8f9fa; font-size: 0.875rem;">
                                                📄 ${file.name}
                                            </p>
                                        </div>
                                    `;
                                }
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            ${quotes.length > 0 ? `
                <h3 style="margin-top: 2rem;">받은 견적 (${quotes.length}개)</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 1rem;">
                    ${quotes.map(quote => `
                        <div class="quote-card">
                            <div class="quote-header">
                                <div>
                                    <h4>${quote.vendorName}</h4>
                                    <p style="color: #6c757d;">유효기한: ${quote.validUntil}</p>
                                </div>
                                <div class="quote-amount">₩${(quote.amount/10000000).toFixed(1)}천만</div>
                            </div>
                            <p><strong>공사기간:</strong> ${quote.duration}</p>
                            <p><strong>지불조건:</strong> ${quote.terms}</p>
                            <p><strong>보증:</strong> ${quote.warranty}</p>
                            <p><strong>제외사항:</strong> ${quote.exceptions}</p>
                            ${quote.detailItems && quote.detailItems.length > 0 ? 
                                `<button class="btn btn-secondary" onclick="viewQuoteDetail('${quote.quoteId}')" style="margin-right: 10px;">상세내역 보기</button>` : ''
                            }
                            ${currentUser && project.ownerUid === currentUser.uid ? 
                                `<button class="btn btn-primary" onclick="selectQuote('${quote.quoteId}')">이 견적 선택</button>` : ''
                            }
                        </div>
                    `).join('')}
                </div>
            ` : '<p style="color: #6c757d; margin-top: 2rem;">아직 받은 견적이 없습니다.</p>'}
            
            ${currentUser && currentUser.role === 'vendor' ? `
                <div style="margin-top: 3rem;">
                    <button class="btn btn-success" onclick="toggleQuoteForm('${projectId}')" id="quoteFormToggle">
                        견적서 작성하기
                    </button>
                </div>
                <div id="quoteFormSection" style="display: none; margin-top: 2rem;">
                    <!-- 견적 폼이 여기에 삽입됩니다 -->
                </div>
            ` : ''}
        </div>
    `;
    
    content.innerHTML = html;
}

// 견적 폼 토글
function toggleQuoteForm(projectId) {
    const formSection = document.getElementById('quoteFormSection');
    const toggleBtn = document.getElementById('quoteFormToggle');
    
    if (formSection.style.display === 'none') {
        formSection.style.display = 'block';
        toggleBtn.textContent = '견적서 작성 취소';
        loadQuoteForm(projectId);
    } else {
        formSection.style.display = 'none';
        toggleBtn.textContent = '견적서 작성하기';
    }
}

// 견적 폼 로드
function loadQuoteForm(projectId) {
    const formSection = document.getElementById('quoteFormSection');
    formSection.innerHTML = `
        <div style="background: white; border: 1px solid var(--border-color); border-radius: 8px; padding: 2rem;">
            <h2 style="margin-bottom: 2rem;">견적서 작성</h2>
            <form onsubmit="submitQuote(event, '${projectId}')" id="quoteForm">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">공사기간</label>
                        <input type="text" class="form-control" name="duration" placeholder="예: 60일" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">지불조건</label>
                        <input type="text" class="form-control" name="terms" 
                               value="계약금 30%, 중도금 40%, 잔금 30%" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">보증기간</label>
                        <input type="text" class="form-control" name="warranty" 
                               value="2년 A/S 보장" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">제외사항</label>
                        <textarea class="form-control" name="exceptions" rows="2"></textarea>
                    </div>
                </div>
                
                <h3 style="margin-top: 2rem; margin-bottom: 1rem;">공사 상세 내역서</h3>
                <div style="overflow-x: auto;">
                    <table class="detail-table" id="detailTable" style="width: 100%; min-width: 1000px;">
                        <thead>
                            <tr>
                                <th rowspan="2" width="10%">구분</th>
                                <th rowspan="2" width="20%">품목</th>
                                <th rowspan="2" width="8%">규격</th>
                                <th rowspan="2" width="6%">단위</th>
                                <th rowspan="2" width="6%">수량</th>
                                <th rowspan="2" width="10%">단가</th>
                                <th rowspan="2" width="10%">금액</th>
                                <th colspan="3" width="24%">내역</th>
                                <th rowspan="2" width="6%">비고</th>
                            </tr>
                            <tr>
                                <th width="8%">재료비</th>
                                <th width="8%">노무비</th>
                                <th width="8%">경비</th>
                            </tr>
                        </thead>
                        <tbody id="detailTableBody">
                            <!-- 철거공사 -->
                            <tr class="category-header" data-category-header="철거공사">
                                <td colspan="10">
                                    <input type="text" value="철거공사" onchange="updateCategoryName(this)" style="background: none; border: none; font-weight: bold;">
                                </td>
                                <td style="text-align: right; white-space: nowrap;">
                                    <button type="button" onclick="addRowToCategory('철거공사')" style="padding: 2px 6px; margin-right: 2px; background: #27ae60; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">+항목</button>
                                    <button type="button" onclick="removeCategory('철거공사')" style="padding: 2px 6px; background: #e74c3c; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">삭제</button>
                                </td>
                            </tr>
                            <tr data-category="철거공사">
                                <td><input type="text" value="철거공사" readonly></td>
                                <td><input type="text" placeholder="예: 기존 바닥재 철거"></td>
                                <td><input type="text" placeholder="예: 전체"></td>
                                <td><input type="text" value="평" placeholder="단위"></td>
                                <td><input type="number" step="0.1" onchange="calculateRow(this)"></td>
                                <td><input type="number" onchange="calculateRow(this)"></td>
                                <td><input type="number" readonly class="amount-total"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="material-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="labor-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="expense-cost"></td>
                                <td style="text-align: center;">
                                    <button type="button" class="remove-row-btn" onclick="this.closest('tr').remove(); calculateTotal();">X</button>
                                </td>
                            </tr>
                            
                            <!-- 목공사 -->
                            <tr class="category-header" data-category-header="목공사">
                                <td colspan="10">
                                    <input type="text" value="목공사" onchange="updateCategoryName(this)" style="background: none; border: none; font-weight: bold;">
                                </td>
                                <td style="text-align: right; white-space: nowrap;">
                                    <button type="button" onclick="addRowToCategory('목공사')" style="padding: 2px 6px; margin-right: 2px; background: #27ae60; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">+항목</button>
                                    <button type="button" onclick="removeCategory('목공사')" style="padding: 2px 6px; background: #e74c3c; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">삭제</button>
                                </td>
                            </tr>
                            <tr data-category="목공사">
                                <td><input type="text" value="목공사" readonly></td>
                                <td><input type="text" placeholder="예: 천정 몰딩"></td>
                                <td><input type="text"></td>
                                <td><input type="text" value="M"></td>
                                <td><input type="number" step="0.1" onchange="calculateRow(this)"></td>
                                <td><input type="number" onchange="calculateRow(this)"></td>
                                <td><input type="number" readonly class="amount-total"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="material-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="labor-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="expense-cost"></td>
                                <td style="text-align: center;">
                                    <button type="button" class="remove-row-btn" onclick="this.closest('tr').remove(); calculateTotal();">X</button>
                                </td>
                            </tr>
                            
                            <!-- 전기공사 -->
                            <tr class="category-header" data-category-header="전기공사">
                                <td colspan="10">
                                    <input type="text" value="전기공사" onchange="updateCategoryName(this)" style="background: none; border: none; font-weight: bold;">
                                </td>
                                <td style="text-align: right; white-space: nowrap;">
                                    <button type="button" onclick="addRowToCategory('전기공사')" style="padding: 2px 6px; margin-right: 2px; background: #27ae60; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">+항목</button>
                                    <button type="button" onclick="removeCategory('전기공사')" style="padding: 2px 6px; background: #e74c3c; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">삭제</button>
                                </td>
                            </tr>
                            <tr data-category="전기공사">
                                <td><input type="text" value="전기공사" readonly></td>
                                <td><input type="text" placeholder="예: LED 조명"></td>
                                <td><input type="text"></td>
                                <td><input type="text" value="개"></td>
                                <td><input type="number" step="1" onchange="calculateRow(this)"></td>
                                <td><input type="number" onchange="calculateRow(this)"></td>
                                <td><input type="number" readonly class="amount-total"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="material-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="labor-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="expense-cost"></td>
                                <td style="text-align: center;">
                                    <button type="button" class="remove-row-btn" onclick="this.closest('tr').remove(); calculateTotal();">X</button>
                                </td>
                            </tr>
                            
                            <!-- 타일공사 -->
                            <tr class="category-header" data-category-header="타일공사">
                                <td colspan="10">
                                    <input type="text" value="타일공사" onchange="updateCategoryName(this)" style="background: none; border: none; font-weight: bold;">
                                </td>
                                <td style="text-align: right; white-space: nowrap;">
                                    <button type="button" onclick="addRowToCategory('타일공사')" style="padding: 2px 6px; margin-right: 2px; background: #27ae60; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">+항목</button>
                                    <button type="button" onclick="removeCategory('타일공사')" style="padding: 2px 6px; background: #e74c3c; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">삭제</button>
                                </td>
                            </tr>
                            <tr data-category="타일공사">
                                <td><input type="text" value="타일공사" readonly></td>
                                <td><input type="text" placeholder="예: 바닥 타일"></td>
                                <td><input type="text" placeholder="예: 600x600"></td>
                                <td><input type="text" value="평"></td>
                                <td><input type="number" step="0.1" onchange="calculateRow(this)"></td>
                                <td><input type="number" onchange="calculateRow(this)"></td>
                                <td><input type="number" readonly class="amount-total"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="material-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="labor-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="expense-cost"></td>
                                <td style="text-align: center;">
                                    <button type="button" class="remove-row-btn" onclick="this.closest('tr').remove(); calculateTotal();">X</button>
                                </td>
                            </tr>
                            
                            <!-- 도배/장판 -->
                            <tr class="category-header" data-category-header="도배장판">
                                <td colspan="10">
                                    <input type="text" value="도배/장판" onchange="updateCategoryName(this)" style="background: none; border: none; font-weight: bold;">
                                </td>
                                <td style="text-align: right; white-space: nowrap;">
                                    <button type="button" onclick="addRowToCategory('도배장판')" style="padding: 2px 6px; margin-right: 2px; background: #27ae60; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">+항목</button>
                                    <button type="button" onclick="removeCategory('도배장판')" style="padding: 2px 6px; background: #e74c3c; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">삭제</button>
                                </td>
                            </tr>
                            <tr data-category="도배장판">
                                <td><input type="text" value="도배" readonly></td>
                                <td><input type="text" placeholder="예: 실크벽지"></td>
                                <td><input type="text"></td>
                                <td><input type="text" value="평"></td>
                                <td><input type="number" step="0.1" onchange="calculateRow(this)"></td>
                                <td><input type="number" onchange="calculateRow(this)"></td>
                                <td><input type="number" readonly class="amount-total"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="material-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="labor-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="expense-cost"></td>
                                <td style="text-align: center;">
                                    <button type="button" class="remove-row-btn" onclick="this.closest('tr').remove(); calculateTotal();">X</button>
                                </td>
                            </tr>
                            
                            <!-- 주방/가구 -->
                            <tr class="category-header" data-category-header="주방가구">
                                <td colspan="10">
                                    <input type="text" value="주방/가구" onchange="updateCategoryName(this)" style="background: none; border: none; font-weight: bold;">
                                </td>
                                <td style="text-align: right; white-space: nowrap;">
                                    <button type="button" onclick="addRowToCategory('주방가구')" style="padding: 2px 6px; margin-right: 2px; background: #27ae60; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">+항목</button>
                                    <button type="button" onclick="removeCategory('주방가구')" style="padding: 2px 6px; background: #e74c3c; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">삭제</button>
                                </td>
                            </tr>
                            <tr data-category="주방가구">
                                <td><input type="text" value="주방" readonly></td>
                                <td><input type="text" placeholder="예: 싱크대"></td>
                                <td><input type="text"></td>
                                <td><input type="text" value="식"></td>
                                <td><input type="number" step="1" onchange="calculateRow(this)"></td>
                                <td><input type="number" onchange="calculateRow(this)"></td>
                                <td><input type="number" readonly class="amount-total"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="material-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="labor-cost"></td>
                                <td><input type="number" onchange="updateCostBreakdown(this)" class="expense-cost"></td>
                                <td style="text-align: center;">
                                    <button type="button" class="remove-row-btn" onclick="this.closest('tr').remove(); calculateTotal();">X</button>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr class="sub-total">
                                <td colspan="6" style="text-align: right;">직접공사비 합계</td>
                                <td id="directCostTotal">0</td>
                                <td id="materialTotal">0</td>
                                <td id="laborTotal">0</td>
                                <td id="expenseTotal">0</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td colspan="6" style="text-align: right;">고용산재보험 (노무비의 4.7%)</td>
                                <td id="insuranceAmount">0</td>
                                <td colspan="4"></td>
                            </tr>
                            <tr>
                                <td colspan="6" style="text-align: right;">관리비 (경비의 5%)</td>
                                <td id="managementAmount">0</td>
                                <td colspan="4"></td>
                            </tr>
                            <tr>
                                <td colspan="6" style="text-align: right;">이윤 ((노무비+관리비)의 10%)</td>
                                <td id="profitAmount">0</td>
                                <td colspan="4"></td>
                            </tr>
                            <tr class="sub-total">
                                <td colspan="6" style="text-align: right;">공사비 합계</td>
                                <td id="constructionTotal">0</td>
                                <td colspan="4"></td>
                            </tr>
                            <tr>
                                <td colspan="6" style="text-align: right;">부가가치세 (10%)</td>
                                <td id="vatAmount">0</td>
                                <td colspan="4"></td>
                            </tr>
                            <tr class="grand-total">
                                <td colspan="6" style="text-align: right;">전체 합계 금액</td>
                                <td id="grandTotal">0</td>
                                <td colspan="4"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="addCategory()">+ 새 섹터 추가</button>
                </div>
                
                <div class="detail-summary">
                    <h4>견적 요약</h4>
                    <div class="summary-row">
                        <span>공사비 합계:</span>
                        <span id="summarySubtotal">0원</span>
                    </div>
                    <div class="summary-row">
                        <span>부가세 (10%):</span>
                        <span id="summaryVat">0원</span>
                    </div>
                    <div class="summary-row total">
                        <span>최종 견적금액:</span>
                        <span id="summaryTotal">0원</span>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button type="submit" class="btn btn-primary">견적 제출</button>
                    <button type="button" class="btn btn-secondary" onclick="toggleQuoteForm('${projectId}')">취소</button>
                </div>
            </form>
        </div>
    `;
    
    // 기본 카테고리별 샘플 행 추가
    initializeDetailTable();
}

// 상세 내역 테이블 초기화
function initializeDetailTable() {
    calculateTotal();
}

// 행 계산
function calculateRow(element) {
    const row = element.closest('tr');
    const quantity = parseFloat(row.cells[4].querySelector('input').value) || 0;
    const unitPrice = parseFloat(row.cells[5].querySelector('input').value) || 0;
    const amount = quantity * unitPrice;
    row.cells[6].querySelector('input').value = amount;
    
    // 금액을 재료비/노무비/경비에 자동 분배 (초기값)
    if (!row.cells[7].querySelector('input').value && 
        !row.cells[8].querySelector('input').value && 
        !row.cells[9].querySelector('input').value) {
        // 기본 비율: 재료비 50%, 노무비 35%, 경비 15%
        row.cells[7].querySelector('input').value = Math.round(amount * 0.5);
        row.cells[8].querySelector('input').value = Math.round(amount * 0.35);
        row.cells[9].querySelector('input').value = Math.round(amount * 0.15);
    }
    
    calculateTotal();
}

// 원가 내역 업데이트
function updateCostBreakdown(element) {
    const row = element.closest('tr');
    const material = parseFloat(row.cells[7].querySelector('input').value) || 0;
    const labor = parseFloat(row.cells[8].querySelector('input').value) || 0;
    const expense = parseFloat(row.cells[9].querySelector('input').value) || 0;
    const total = material + labor + expense;
    
    // 합계 업데이트
    row.cells[6].querySelector('input').value = total;
    
    calculateTotal();
}

// 전체 합계 계산
function calculateTotal() {
    const rows = document.querySelectorAll('#detailTableBody tr[data-category]');
    let directCost = 0;
    let materialSum = 0;
    let laborSum = 0;
    let expenseSum = 0;
    
    rows.forEach(row => {
        const amount = parseFloat(row.cells[6].querySelector('input').value) || 0;
        const material = parseFloat(row.cells[7].querySelector('input').value) || 0;
        const labor = parseFloat(row.cells[8].querySelector('input').value) || 0;
        const expense = parseFloat(row.cells[9].querySelector('input').value) || 0;
        
        directCost += amount;
        materialSum += material;
        laborSum += labor;
        expenseSum += expense;
    });
    
    // 직접공사비
    document.getElementById('directCostTotal').textContent = directCost.toLocaleString();
    document.getElementById('materialTotal').textContent = materialSum.toLocaleString();
    document.getElementById('laborTotal').textContent = laborSum.toLocaleString();
    document.getElementById('expenseTotal').textContent = expenseSum.toLocaleString();
    
    // 고용산재보험 (노무비의 4.7%)
    const insurance = Math.round(laborSum * 0.047);
    document.getElementById('insuranceAmount').textContent = insurance.toLocaleString();
    
    // 관리비 (경비의 5%)
    const management = Math.round(expenseSum * 0.05);
    document.getElementById('managementAmount').textContent = management.toLocaleString();
    
    // 이윤 ((노무비+관리비)의 10%)
    const profit = Math.round((laborSum + management) * 0.1);
    document.getElementById('profitAmount').textContent = profit.toLocaleString();
    
    // 공사비 합계
    const constructionTotal = directCost + insurance + management + profit;
    document.getElementById('constructionTotal').textContent = constructionTotal.toLocaleString();
    
    // 부가세 (10%)
    const vat = Math.round(constructionTotal * 0.1);
    document.getElementById('vatAmount').textContent = vat.toLocaleString();
    
    // 전체 합계
    const grandTotal = constructionTotal + vat;
    document.getElementById('grandTotal').textContent = grandTotal.toLocaleString();
    
    // 요약 섹션 업데이트
    document.getElementById('summarySubtotal').textContent = constructionTotal.toLocaleString() + '원';
    document.getElementById('summaryVat').textContent = vat.toLocaleString() + '원';
    document.getElementById('summaryTotal').textContent = grandTotal.toLocaleString() + '원';
    
    return grandTotal;
}

// 특정 카테고리에 행 추가
function addRowToCategory(categoryName) {
    const tbody = document.getElementById('detailTableBody');
    const categoryHeader = document.querySelector(`tr[data-category-header="${categoryName}"]`);
    
    if (!categoryHeader) return;
    
    // 해당 카테고리의 마지막 행 찾기
    let lastRow = categoryHeader;
    let nextRow = categoryHeader.nextElementSibling;
    while (nextRow && nextRow.dataset.category === categoryName) {
        lastRow = nextRow;
        nextRow = nextRow.nextElementSibling;
    }
    
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-category', categoryName);
    newRow.innerHTML = `
        <td><input type="text" value="${categoryName}" readonly></td>
        <td><input type="text" placeholder="품목명"></td>
        <td><input type="text" placeholder="규격"></td>
        <td><input type="text" placeholder="단위"></td>
        <td><input type="number" step="0.1" onchange="calculateRow(this)"></td>
        <td><input type="number" onchange="calculateRow(this)"></td>
        <td><input type="number" readonly class="amount-total"></td>
        <td><input type="number" onchange="updateCostBreakdown(this)" class="material-cost"></td>
        <td><input type="number" onchange="updateCostBreakdown(this)" class="labor-cost"></td>
        <td><input type="number" onchange="updateCostBreakdown(this)" class="expense-cost"></td>
        <td style="text-align: center;">
            <button type="button" class="remove-row-btn" onclick="this.closest('tr').remove(); calculateTotal();">X</button>
        </td>
    `;
    
    lastRow.insertAdjacentElement('afterend', newRow);
}

// 카테고리 추가
function addCategory() {
    const categoryName = prompt('새 섹터 이름을 입력하세요:');
    if (!categoryName) return;
    
    const tbody = document.getElementById('detailTableBody');
    
    // 카테고리 헤더 추가
    const headerRow = document.createElement('tr');
    headerRow.className = 'category-header';
    headerRow.setAttribute('data-category-header', categoryName);
    headerRow.innerHTML = `
        <td colspan="10">
            <input type="text" value="${categoryName}" onchange="updateCategoryName(this)" style="background: none; border: none; font-weight: bold;">
        </td>
        <td style="text-align: right; white-space: nowrap;">
            <button type="button" onclick="addRowToCategory('${categoryName}')" style="padding: 2px 6px; margin-right: 2px; background: #27ae60; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">+항목</button>
            <button type="button" onclick="removeCategory('${categoryName}')" style="padding: 2px 6px; background: #e74c3c; color: white; border: none; border-radius: 3px; font-size: 0.75rem;">삭제</button>
        </td>
    `;
    
    // 첫 번째 항목 행 추가
    const itemRow = document.createElement('tr');
    itemRow.setAttribute('data-category', categoryName);
    itemRow.innerHTML = `
        <td><input type="text" value="${categoryName}" readonly></td>
        <td><input type="text" placeholder="품목명"></td>
        <td><input type="text" placeholder="규격"></td>
        <td><input type="text" placeholder="단위"></td>
        <td><input type="number" step="0.1" onchange="calculateRow(this)"></td>
        <td><input type="number" onchange="calculateRow(this)"></td>
        <td><input type="number" readonly class="amount-total"></td>
        <td><input type="number" onchange="updateCostBreakdown(this)" class="material-cost"></td>
        <td><input type="number" onchange="updateCostBreakdown(this)" class="labor-cost"></td>
        <td><input type="number" onchange="updateCostBreakdown(this)" class="expense-cost"></td>
        <td style="text-align: center;">
            <button type="button" class="remove-row-btn" onclick="this.closest('tr').remove(); calculateTotal();">X</button>
        </td>
    `;
    
    tbody.appendChild(headerRow);
    tbody.appendChild(itemRow);
}

// 카테고리 삭제
function removeCategory(categoryName) {
    if (!confirm(`'${categoryName}' 섹터를 삭제하시겠습니까?`)) return;
    
    const categoryHeader = document.querySelector(`tr[data-category-header="${categoryName}"]`);
    if (!categoryHeader) return;
    
    // 헤더 삭제
    categoryHeader.remove();
    
    // 해당 카테고리의 모든 항목 삭제
    const rows = document.querySelectorAll(`tr[data-category="${categoryName}"]`);
    rows.forEach(row => row.remove());
    
    calculateTotal();
}

// 카테고리 이름 업데이트
function updateCategoryName(input) {
    const oldName = input.parentElement.parentElement.dataset.categoryHeader;
    const newName = input.value;
    
    if (!newName || oldName === newName) return;
    
    // 헤더 데이터 속성 업데이트
    input.parentElement.parentElement.setAttribute('data-category-header', newName);
    
    // 버튼 onclick 업데이트
    const buttons = input.parentElement.nextElementSibling.querySelectorAll('button');
    buttons[0].setAttribute('onclick', `addRowToCategory('${newName}')`);
    buttons[1].setAttribute('onclick', `removeCategory('${newName}')`);
    
    // 모든 관련 행의 카테고리 업데이트
    const rows = document.querySelectorAll(`tr[data-category="${oldName}"]`);
    rows.forEach(row => {
        row.setAttribute('data-category', newName);
        row.cells[0].querySelector('input').value = newName;
    });
}

// 견적 제출
function submitQuote(event, projectId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    // 상세 내역 수집
    const detailItems = [];
    const rows = document.querySelectorAll('#detailTableBody tr[data-category]');
    
    rows.forEach(row => {
        const cells = row.cells;
        const item = cells[1].querySelector('input').value;
        const quantity = parseFloat(cells[4].querySelector('input').value) || 0;
        const unitPrice = parseFloat(cells[5].querySelector('input').value) || 0;
        const amount = parseFloat(cells[6].querySelector('input').value) || 0;
        const material = parseFloat(cells[7].querySelector('input').value) || 0;
        const labor = parseFloat(cells[8].querySelector('input').value) || 0;
        const expense = parseFloat(cells[9].querySelector('input').value) || 0;
        
        if (item && amount > 0) {
            detailItems.push({
                category: cells[0].querySelector('input, select').value,
                item: item,
                spec: cells[2].querySelector('input').value,
                unit: cells[3].querySelector('input').value,
                quantity: quantity,
                unitPrice: unitPrice,
                amount: amount,
                materialCost: material,
                laborCost: labor,
                expenseCost: expense,
                note: cells[10].querySelector('input').value
            });
        }
    });
    
    const finalAmount = calculateTotal();
    
    const data = getData();
    const vendor = data.vendors.find(v => v.vendorId === currentUser.vendorId);
    
    const newQuote = {
        quoteId: 'q' + Date.now(),
        projectId: projectId,
        vendorId: currentUser.vendorId,
        vendorName: vendor.companyName,
        amount: finalAmount,
        duration: formData.get('duration'),
        terms: formData.get('terms'),
        warranty: formData.get('warranty'),
        exceptions: formData.get('exceptions'),
        detailItems: detailItems,
        status: 'submitted',
        createdAt: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    };
    
    data.quotes.push(newQuote);
    
    // 프로젝트의 견적 수 업데이트
    const project = data.projects.find(p => p.projectId === projectId);
    if (project) {
        project.quoteCount = (project.quoteCount || 0) + 1;
    }
    
    updateData(data);
    
    alert('견적이 성공적으로 제출되었습니다.');
    viewProjectDetail(projectId);
}

// 견적 상세 내역 보기
function viewQuoteDetail(quoteId) {
    const data = getData();
    const quote = data.quotes.find(q => q.quoteId === quoteId);
    
    if (!quote || !quote.detailItems) {
        alert('상세 내역이 없습니다.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
                <h2>${quote.vendorName} - 공사 상세 내역서</h2>
                <button onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="modal-body">
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th rowspan="2">구분</th>
                            <th rowspan="2">품목</th>
                            <th rowspan="2">규격</th>
                            <th rowspan="2">단위</th>
                            <th rowspan="2">수량</th>
                            <th rowspan="2">단가</th>
                            <th rowspan="2">금액</th>
                            <th colspan="3">내역</th>
                            <th rowspan="2">비고</th>
                        </tr>
                        <tr>
                            <th>재료비</th>
                            <th>노무비</th>
                            <th>경비</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quote.detailItems.map(item => `
                            <tr>
                                <td>${item.category}</td>
                                <td>${item.item}</td>
                                <td>${item.spec || '-'}</td>
                                <td>${item.unit}</td>
                                <td style="text-align: right;">${item.quantity}</td>
                                <td style="text-align: right;">${item.unitPrice.toLocaleString()}</td>
                                <td style="text-align: right;"><strong>${item.amount.toLocaleString()}</strong></td>
                                <td style="text-align: right;">${(item.materialCost || 0).toLocaleString()}</td>
                                <td style="text-align: right;">${(item.laborCost || 0).toLocaleString()}</td>
                                <td style="text-align: right;">${(item.expenseCost || 0).toLocaleString()}</td>
                                <td>${item.note || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        ${(() => {
                            const totalMaterial = quote.detailItems.reduce((sum, item) => sum + (item.materialCost || 0), 0);
                            const totalLabor = quote.detailItems.reduce((sum, item) => sum + (item.laborCost || 0), 0);
                            const totalExpense = quote.detailItems.reduce((sum, item) => sum + (item.expenseCost || 0), 0);
                            const directCost = totalMaterial + totalLabor + totalExpense;
                            const insurance = Math.round(totalLabor * 0.047);
                            const management = Math.round(totalExpense * 0.05);
                            const profit = Math.round((totalLabor + management) * 0.1);
                            const constructionTotal = directCost + insurance + management + profit;
                            const vat = Math.round(constructionTotal * 0.1);
                            
                            return `
                                <tr class="sub-total">
                                    <td colspan="6" style="text-align: right;">직접공사비 합계</td>
                                    <td style="text-align: right;"><strong>${directCost.toLocaleString()}</strong></td>
                                    <td style="text-align: right;">${totalMaterial.toLocaleString()}</td>
                                    <td style="text-align: right;">${totalLabor.toLocaleString()}</td>
                                    <td style="text-align: right;">${totalExpense.toLocaleString()}</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colspan="6" style="text-align: right;">고용산재보험 (노무비의 4.7%)</td>
                                    <td style="text-align: right;">${insurance.toLocaleString()}</td>
                                    <td colspan="4"></td>
                                </tr>
                                <tr>
                                    <td colspan="6" style="text-align: right;">관리비 (경비의 5%)</td>
                                    <td style="text-align: right;">${management.toLocaleString()}</td>
                                    <td colspan="4"></td>
                                </tr>
                                <tr>
                                    <td colspan="6" style="text-align: right;">이윤 ((노무비+관리비)의 10%)</td>
                                    <td style="text-align: right;">${profit.toLocaleString()}</td>
                                    <td colspan="4"></td>
                                </tr>
                                <tr class="sub-total">
                                    <td colspan="6" style="text-align: right;">공사비 합계</td>
                                    <td style="text-align: right;"><strong>${constructionTotal.toLocaleString()}</strong></td>
                                    <td colspan="4"></td>
                                </tr>
                                <tr>
                                    <td colspan="6" style="text-align: right;">부가가치세 (10%)</td>
                                    <td style="text-align: right;">${vat.toLocaleString()}</td>
                                    <td colspan="4"></td>
                                </tr>
                                <tr class="grand-total">
                                    <td colspan="6" style="text-align: right;">전체 합계 금액</td>
                                    <td style="text-align: right;"><strong>${quote.amount.toLocaleString()}</strong></td>
                                    <td colspan="4"></td>
                                </tr>
                            `;
                        })()}
                    </tfoot>
                </table>
                
                <div class="detail-summary" style="margin-top: 2rem;">
                    <h4>견적 정보</h4>
                    <p><strong>공사기간:</strong> ${quote.duration}</p>
                    <p><strong>지불조건:</strong> ${quote.terms}</p>
                    <p><strong>보증기간:</strong> ${quote.warranty}</p>
                    ${quote.exceptions ? `<p><strong>제외사항:</strong> ${quote.exceptions}</p>` : ''}
                    <p><strong>유효기한:</strong> ${quote.validUntil}</p>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">닫기</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 벤더 대시보드
function loadVendorDashboard() {
    if (!currentUser || currentUser.role !== 'vendor') {
        alert('벤더로 로그인해주세요.');
        return;
    }
    
    const data = getData();
    const vendor = data.vendors.find(v => v.vendorId === currentUser.vendorId);
    const myQuotes = data.quotes.filter(q => q.vendorId === currentUser.vendorId);
    const availableProjects = data.projects.filter(p => 
        p.status === 'PENDING_QUOTES' && 
        vendor.areas.some(area => p.region && p.region.includes(area))
    );
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="container">
            <h1 style="margin: 2rem 0;">${vendor.companyName} 대시보드</h1>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-value">${myQuotes.length}</div>
                    <div class="stat-label">제출한 견적</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${availableProjects.length}</div>
                    <div class="stat-label">견적 가능 프로젝트</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${vendor.completedProjects}</div>
                    <div class="stat-label">완료 프로젝트</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">★ ${vendor.rating}</div>
                    <div class="stat-label">평균 평점</div>
                </div>
            </div>
            
            <h2 style="margin-top: 2rem;">견적 가능한 프로젝트</h2>
            <div class="projects-grid">
                ${availableProjects.map(project => `
                    <div class="project-card">
                        <div class="project-card-header">
                            <h3>${project.title}</h3>
                            <span class="project-status status-pending">견적 대기중</span>
                        </div>
                        <div class="project-card-body">
                            <p><strong>고객:</strong> ${project.ownerName}</p>
                            <p><strong>지역:</strong> ${project.region}</p>
                            <p><strong>예산:</strong> ${(project.budget/10000000).toFixed(0)}천만원</p>
                            <p><strong>면적:</strong> ${project.area}</p>
                            <p><strong>스타일:</strong> ${project.style ? project.style.join(', ') : '-'}</p>
                            ${project.files && project.files.filter(f => f.type === 'image').length > 0 ? 
                                `<p style="color: #666; font-size: 0.875rem;">🖼️ 이미지 ${project.files.filter(f => f.type === 'image').length}개 첨부</p>` : ''
                            }
                            <button class="btn btn-primary" onclick="viewProjectDetail('${project.projectId}')">
                                상세보기 & 견적제출
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <h2 style="margin-top: 2rem;">내가 제출한 견적</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>프로젝트</th>
                        <th>견적금액</th>
                        <th>제출일</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    ${myQuotes.map(quote => {
                        const project = data.projects.find(p => p.projectId === quote.projectId);
                        return `
                            <tr>
                                <td>${project ? project.title : '-'}</td>
                                <td>₩${(quote.amount/10000000).toFixed(1)}천만</td>
                                <td>${quote.createdAt}</td>
                                <td><span class="project-status status-pending">제출됨</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// 관리자 대시보드
function loadAdminDashboard() {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('관리자로 로그인해주세요.');
        return;
    }
    
    const data = getData();
    
    // 프로젝트별 견적 상태 집계
    const projectStats = data.projects.map(project => {
        const projectQuotes = data.quotes.filter(q => q.projectId === project.projectId);
        return {
            ...project,
            quotes: projectQuotes,
            avgAmount: projectQuotes.length > 0 ? 
                projectQuotes.reduce((sum, q) => sum + q.amount, 0) / projectQuotes.length : 0,
            minAmount: projectQuotes.length > 0 ?
                Math.min(...projectQuotes.map(q => q.amount)) : 0,
            maxAmount: projectQuotes.length > 0 ?
                Math.max(...projectQuotes.map(q => q.amount)) : 0
        };
    });
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="container">
            <h1 style="margin: 2rem 0;">관리자 대시보드</h1>
            
            <!-- 전체 통계 -->
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-value">${data.projects.length}</div>
                    <div class="stat-label">전체 프로젝트</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.quotes.length}</div>
                    <div class="stat-label">전체 견적서</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.vendors.filter(v => v.status === 'active').length}</div>
                    <div class="stat-label">활성 벤더</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.projects.filter(p => p.status === 'PENDING_QUOTES').length}</div>
                    <div class="stat-label">견적 대기중</div>
                </div>
            </div>
            
            <h2 style="margin-top: 2rem;">프로젝트별 견적 현황</h2>
            
            <div style="overflow-x: auto;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>관리번호</th>
                            <th>프로젝트명</th>
                            <th>고객명</th>
                            <th>지역</th>
                            <th>예산</th>
                            <th>상태</th>
                            <th>견적수</th>
                            <th>평균견적</th>
                            <th>최저/최고</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${projectStats.map(project => {
                            const statusText = {
                                'PENDING_QUOTES': '견적 대기중',
                                'CONTRACT_IN_PROGRESS': '계약 진행중',
                                'COMPLETED': '완료'
                            }[project.status];
                            
                            const statusClass = {
                                'PENDING_QUOTES': 'pending',
                                'CONTRACT_IN_PROGRESS': 'active',
                                'COMPLETED': 'completed'
                            }[project.status];
                            
                            return `
                                <tr>
                                    <td><strong>${project.managementNumber || 'SS250902-' + Math.floor(Math.random() * 900 + 100)}</strong></td>
                                    <td>${project.title || '-'}</td>
                                    <td>${project.ownerName || '-'}</td>
                                    <td>${project.region || '-'}</td>
                                    <td>${project.budget ? (project.budget/10000).toLocaleString() + '만원' : '-'}</td>
                                    <td><span class="project-status status-${statusClass}">${statusText}</span></td>
                                    <td>${project.quotes.length}개</td>
                                    <td>${project.avgAmount ? (project.avgAmount/10000).toLocaleString() + '만원' : '-'}</td>
                                    <td>${project.quotes.length > 0 ? 
                                        `${(project.minAmount/10000).toLocaleString()}~${(project.maxAmount/10000).toLocaleString()}만원` : '-'
                                    }</td>
                                    <td>
                                        <button class="btn btn-secondary" onclick="viewAdminProjectDetail('${project.projectId}')" 
                                                style="padding: 4px 8px; font-size: 0.875rem;">
                                            상세보기
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- 빠른 메뉴 -->
            <div style="margin-top: 3rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                <h3>빠른 메뉴</h3>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button class="btn btn-secondary" onclick="loadAdminVendors()">벤더 심사 관리</button>
                    <button class="btn btn-secondary" onclick="exportProjectData()">데이터 내보내기</button>
                </div>
            </div>
        </div>
    `;
}

// 관리자용 프로젝트 상세보기
function viewAdminProjectDetail(projectId) {
    const data = getData();
    const project = data.projects.find(p => p.projectId === projectId);
    const quotes = data.quotes.filter(q => q.projectId === projectId);
    
    const content = document.getElementById('content');
    let html = `
        <div class="container">
            <button class="btn btn-secondary" onclick="loadAdminDashboard()" style="margin-top: 1rem;">
                ← 대시보드로 돌아가기
            </button>
            
            <h1 style="margin: 2rem 0;">${project.title}</h1>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <!-- 프로젝트 정보 -->
                <div class="quote-card">
                    <h3>프로젝트 정보</h3>
                    <p><strong>관리번호:</strong> ${project.managementNumber || 'SS250902-' + Math.floor(Math.random() * 900 + 100)}</p>
                    <p><strong>고객명:</strong> ${project.ownerName}</p>
                    <p><strong>지역:</strong> ${project.region}</p>
                    <p><strong>면적:</strong> ${project.area}</p>
                    <p><strong>예산:</strong> ${(project.budget/10000000).toFixed(0)}천만원</p>
                    <p><strong>스타일:</strong> ${project.style.join(', ')}</p>
                    <p><strong>설명:</strong> ${project.description}</p>
                    <p><strong>요구사항:</strong> ${project.requirements}</p>
                    <p><strong>희망 완료일:</strong> ${project.deadline}</p>
                    <p><strong>등록일:</strong> ${project.createdAt}</p>
                    <p><strong>상태:</strong> ${project.status}</p>
                </div>
                
                <!-- 견적 통계 -->
                <div class="quote-card">
                    <h3>견적 분석</h3>
                    ${quotes.length > 0 ? `
                        <p><strong>총 견적수:</strong> ${quotes.length}개</p>
                        <p><strong>평균 견적:</strong> ${(quotes.reduce((sum, q) => sum + q.amount, 0) / quotes.length / 10000000).toFixed(1)}천만원</p>
                        <p><strong>최저 견적:</strong> ${(Math.min(...quotes.map(q => q.amount)) / 10000000).toFixed(1)}천만원</p>
                        <p><strong>최고 견적:</strong> ${(Math.max(...quotes.map(q => q.amount)) / 10000000).toFixed(1)}천만원</p>
                        <p><strong>견적 편차:</strong> ${((Math.max(...quotes.map(q => q.amount)) - Math.min(...quotes.map(q => q.amount))) / 10000000).toFixed(1)}천만원</p>
                    ` : '<p>아직 견적이 없습니다.</p>'}
                </div>
            </div>
            
            ${quotes.length > 0 ? `
                <h3 style="margin-top: 2rem;">제출된 견적 목록</h3>
                <div style="overflow-x: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>업체명</th>
                                <th>견적금액</th>
                                <th>공사기간</th>
                                <th>제출일</th>
                                <th>유효기한</th>
                                <th>상세내역</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${quotes.map(quote => {
                                const vendor = data.vendors.find(v => v.vendorId === quote.vendorId);
                                return `
                                    <tr>
                                        <td>
                                            <strong>${quote.vendorName}</strong>
                                            ${vendor ? `<br><small>평점: ★${vendor.rating} | 완료: ${vendor.completedProjects}건</small>` : ''}
                                        </td>
                                        <td>
                                            <strong>${(quote.amount/10000000).toFixed(1)}천만원</strong>
                                            <br><small>${((quote.amount / project.budget) * 100).toFixed(0)}% of 예산</small>
                                        </td>
                                        <td>${quote.duration}</td>
                                        <td>${quote.createdAt}</td>
                                        <td>${quote.validUntil}</td>
                                        <td>
                                            ${quote.detailItems && quote.detailItems.length > 0 ? 
                                                `<button class="btn btn-secondary" onclick="viewQuoteDetail('${quote.quoteId}')" 
                                                         style="padding: 4px 8px; font-size: 0.875rem;">
                                                    상세보기
                                                </button>` : 
                                                '<small>상세내역 없음</small>'
                                            }
                                        </td>
                                        <td>
                                            <button class="btn btn-secondary" onclick="approveQuote('${quote.quoteId}')" 
                                                    style="padding: 4px 8px; font-size: 0.875rem;">
                                                승인
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p style="color: #6c757d; margin-top: 2rem;">아직 제출된 견적이 없습니다.</p>'}
            
            ${project.files && project.files.length > 0 ? `
                <h3 style="margin-top: 2rem;">첨부 파일</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
                    ${project.files.map(file => {
                        if (typeof file === 'string') {
                            return `<div style="padding: 1rem; border: 1px solid #ddd; border-radius: 4px;">
                                <p style="margin: 0;">📎 ${file}</p>
                            </div>`;
                        } else if (file.type === 'image') {
                            return `
                                <div style="border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
                                    <img src="${file.url}" alt="${file.name}" 
                                         style="width: 100%; height: 100px; object-fit: cover; cursor: pointer;"
                                         onclick="showImageModal('${file.url}', '${file.name}')">
                                    <p style="padding: 0.5rem; margin: 0; background: #f8f9fa; font-size: 0.75rem;">
                                        ${file.name}
                                    </p>
                                </div>
                            `;
                        } else {
                            return `
                                <div style="border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
                                    <div style="background: #e3f2fd; height: 100px; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 2rem;">📄</span>
                                    </div>
                                    <p style="padding: 0.5rem; margin: 0; background: #f8f9fa; font-size: 0.75rem;">
                                        ${file.name}
                                    </p>
                                </div>
                            `;
                        }
                    }).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    content.innerHTML = html;
}

// 견적 승인 (임시)
function approveQuote(quoteId) {
    alert('견적 승인 기능은 준비중입니다.');
}

// 데이터 내보내기 (임시)
function exportProjectData() {
    alert('데이터 내보내기 기능은 준비중입니다.');
}

// 관리자 벤더 관리
function loadAdminVendors() {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('관리자로 로그인해주세요.');
        return;
    }
    
    const data = getData();
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="container">
            <h1 style="margin: 2rem 0;">벤더 심사 관리</h1>
            
            <div class="tabs">
                <button class="tab-item active" onclick="filterVendors('all')">전체</button>
                <button class="tab-item" onclick="filterVendors('pending')">심사대기</button>
                <button class="tab-item" onclick="filterVendors('active')">승인됨</button>
            </div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>업체명</th>
                        <th>유형</th>
                        <th>지역</th>
                        <th>완료 프로젝트</th>
                        <th>평점</th>
                        <th>상태</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.vendors.map(vendor => `
                        <tr data-status="${vendor.status}">
                            <td>${vendor.companyName}</td>
                            <td>${vendor.type}</td>
                            <td>${vendor.areas.join(', ')}</td>
                            <td>${vendor.completedProjects}</td>
                            <td>★ ${vendor.rating || '-'}</td>
                            <td>
                                <span class="project-status status-${vendor.status === 'active' ? 'active' : 'pending'}">
                                    ${vendor.status === 'active' ? '승인됨' : '대기중'}
                                </span>
                            </td>
                            <td>
                                ${vendor.status === 'pending' ? 
                                    `<button class="btn btn-success" onclick="approveVendor('${vendor.vendorId}')">승인</button>` :
                                    `<button class="btn btn-secondary" onclick="viewVendorDetail('${vendor.vendorId}')">상세</button>`
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// 벤더 필터링
function filterVendors(filter) {
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (filter === 'all') {
            row.style.display = '';
        } else if (filter === row.dataset.status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// 벤더 승인
function approveVendor(vendorId) {
    const data = getData();
    const vendor = data.vendors.find(v => v.vendorId === vendorId);
    if (vendor) {
        vendor.status = 'active';
        updateData(data);
        alert(`${vendor.companyName} 업체가 승인되었습니다.`);
        loadAdminVendors();
    }
}

// 파일 미리보기
function previewFiles(input) {
    const preview = document.getElementById('filePreview');
    preview.innerHTML = '';
    
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            const div = document.createElement('div');
            div.style.cssText = 'border: 1px solid #ddd; border-radius: 4px; overflow: hidden; position: relative;';
            
            if (file.type.startsWith('image/')) {
                reader.onload = function(e) {
                    div.innerHTML = `
                        <img src="${e.target.result}" style="width: 100%; height: 120px; object-fit: cover;">
                        <p style="padding: 0.5rem; margin: 0; background: #f8f9fa; font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis;">
                            ${file.name}
                        </p>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                div.innerHTML = `
                    <div style="background: #e3f2fd; height: 120px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 2rem;">📄</span>
                    </div>
                    <p style="padding: 0.5rem; margin: 0; background: #f8f9fa; font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis;">
                        ${file.name}
                    </p>
                `;
            }
            
            preview.appendChild(div);
        });
    }
}

// 이미지 모달 표시
function showImageModal(url, name) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.onclick = function() { this.remove(); };
    modal.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem;">
            <div style="background: white; border-radius: 8px; max-width: 90%; max-height: 90%; overflow: hidden;">
                <div style="padding: 1rem; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">${name}</h3>
                    <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
                </div>
                <div style="padding: 1rem; max-height: 80vh; overflow: auto;">
                    <img src="${url}" alt="${name}" style="width: 100%; height: auto;">
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 초기 로드
window.addEventListener('DOMContentLoaded', () => {
    loadView('customer/projects');
});