// Data is loaded from data.js globally

// --- Firebase Configuration ---
// 관리자님: 파이어베이스 콘솔에서 받은 본인의 설정값으로 아래를 교체해주세요.
const firebaseConfig = {
    apiKey: "AIzaSyCJbOaiElCypwgtPgbwdnudn3VC737fMrs",
    authDomain: "kpuritan-home.firebaseapp.com",
    projectId: "kpuritan-home",
    storageBucket: "kpuritan-home.firebasestorage.app",
    messagingSenderId: "1071220455502", // Project specific ID (optional usually)
    appId: "1:1071220455502:web:7f6f59b48c48a73437f8f0" // App specific ID (optional usually)
};

// Initialize Firebase
let useMock = false;
let db, storage;
let isAdmin = false; // Add global isAdmin variable

try {
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage();
    console.log("✅ Firebase 연결 성공!");
} catch (e) {
    console.error("❌ Firebase 초기화 실패:", e);
    console.warn("테스트 모드로 전환합니다.");
    useMock = true;
}

document.addEventListener('DOMContentLoaded', () => {
    // Sort Categories Alphabetically as requested
    // Bible books kept in canonical order.
    if (typeof topics !== 'undefined') topics.sort();
    if (typeof authors !== 'undefined') authors.sort();

    // Display Firebase Connection Status
    const statusEl = document.getElementById('firebase-status');
    if (statusEl) {
        if (useMock) {
            statusEl.innerHTML = '⚠️ <span style="color: orange;">테스트 모드</span> - Firebase 연결 안됨 (로컬 저장만 가능)';
        } else {
            statusEl.innerHTML = '✅ <span style="color: green;">Firebase 연결됨</span> - 정상 작동';
        }
    }

    const topicDropdown = document.getElementById('topic-dropdown');
    const authorDropdownGrid = document.getElementById('author-dropdown-grid');

    // ... (기존 렌더링 함수들) ...

    // Render function for dropdowns
    const renderMegaMenuItems = (items, container) => {
        if (!container) return;
        const grid = document.createElement('div');
        grid.className = 'mega-menu-grid';

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'mega-menu-item';
            div.textContent = item;
            div.addEventListener('click', () => {
                openResourceModal(item);
            });
            grid.appendChild(div);
        });
        container.appendChild(grid);
    };

    // Populate dropdowns
    renderMegaMenuItems(topics, topicDropdown);

    // Render for Author Dropdown (Special case for search)
    const renderAuthorsInDropdown = (list) => {
        if (!authorDropdownGrid) return;
        authorDropdownGrid.innerHTML = '';
        list.forEach(item => {
            const div = document.createElement('div');
            div.className = 'mega-menu-item';
            div.textContent = item;
            div.addEventListener('click', () => {
                openResourceModal(item);
            });
            authorDropdownGrid.appendChild(div);
        });
    };

    renderAuthorsInDropdown(authors);

    // --- Main Grid Rendering ---
    const renderMainGridItems = (items, containerId, iconClass) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'main-grid-item';
            div.innerHTML = `
                <i class="${iconClass}"></i>
                <span>${item}</span>
            `;
            div.addEventListener('click', () => {
                openResourceModal(item);
            });
            container.appendChild(div);
        });
    };

    // Populate main grids
    // renderMainGridItems(topics, 'topic-grid-main', 'fas fa-tags');
    // renderMainGridItems(authors, 'author-grid-main', 'fas fa-user-edit');

    // Show sections that were hidden
    const sectionsToShow = ['recent-updates'];
    sectionsToShow.forEach(id => {
        const sec = document.getElementById(id);
        if (sec) sec.classList.remove('section-hidden');
    });

    // Search function for Author Dropdown
    const authorSearchInput = document.getElementById('author-dropdown-search');
    if (authorSearchInput) {
        authorSearchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = authors.filter(a => a.toLowerCase().includes(val));
            renderAuthorsInDropdown(filtered);
        });

        // Prevent dropdown from closing when clicking search input
        authorSearchInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Smooth scroll for all anchor links (Navigation & Hero buttons)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Recent Updates Link Logic
    const recentLink = document.querySelector('a[href="#recent-updates"]');
    const recentSection = document.getElementById('recent-updates');
    if (recentLink && recentSection) {
        recentLink.addEventListener('click', (e) => {
            e.preventDefault();
            recentSection.classList.remove('section-hidden');
            // Allow small delay for display change
            setTimeout(() => {
                recentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 10);
        });
    }



    // Fade in effect on scroll
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });

    // Login Modal Logic
    const loginModal = document.getElementById('login-modal');
    const loginOpenBtn = document.getElementById('login-open-btn');
    const loginCloseBtn = document.getElementById('login-close-btn');
    const loginForm = document.getElementById('login-form');

    if (loginOpenBtn && loginModal) {
        loginOpenBtn.addEventListener('click', () => {
            loginModal.classList.add('show');
        });
    }

    if (loginCloseBtn && loginModal) {
        loginCloseBtn.addEventListener('click', () => {
            loginModal.classList.remove('show');
        });
    }

    // About Modal Logic
    const aboutModal = document.getElementById('about-modal');
    const aboutCloseBtn = document.getElementById('about-close-btn');
    const aboutLinks = document.querySelectorAll('a[href="#about"]');

    aboutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Stop smooth scroll
            if (aboutModal) aboutModal.classList.add('show');
        });
    });

    if (aboutCloseBtn && aboutModal) {
        aboutCloseBtn.addEventListener('click', () => {
            aboutModal.classList.remove('show');
        });
    }

    // Close modal when clicking outside content (Unified logic)
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('admin-id').value;
            const pw = document.getElementById('admin-pw').value;

            // Simple mock login
            if (id === 'admin' && pw === '1234') {
                alert('관리자로 로그인되었습니다. 하단 대시보드에서 자료를 관리하세요.');
                isAdmin = true;
                loginModal.classList.remove('show');
                loginOpenBtn.innerHTML = '<i class="fas fa-user-check"></i> 관리자(로그인됨)';

                // Show Admin Dashboard
                const dashboard = document.getElementById('admin-dashboard');
                if (dashboard) {
                    dashboard.classList.remove('section-hidden');
                    dashboard.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                alert('아이디 또는 비밀번호가 일치하지 않습니다.');
            }
        });
    }

    // Admin Dashboard Logic: Populate Category Selects
    const populateSelect = (selectId, items) => {
        const select = document.getElementById(selectId);
        if (!select) return;
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item;
            opt.textContent = item;
            select.appendChild(opt);
        });
    };

    populateSelect('post-topic', topics);
    populateSelect('post-author', authors);
    populateSelect('edit-topic', topics);
    populateSelect('edit-author', authors);

    // Real Database Upload Logic
    const uploadForm = document.getElementById('post-upload-form');
    const recentPostsList = document.getElementById('admin-recent-posts');
    window.switchAdminTab = (tabName) => {
        const portalCards = document.querySelectorAll('.admin-portal-card');
        portalCards.forEach(card => {
            card.classList.remove('active');
            card.style.border = '2px solid #eee';
            card.style.boxShadow = 'none';
        });

        // 탭 상태 업데이트
        const targetTabId = `tab-${tabName}`;
        const activeCard = document.getElementById(targetTabId);
        if (activeCard) {
            activeCard.classList.add('active');
            activeCard.style.border = `2px solid var(--primary-color)`;
            activeCard.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
        }

        // 섹션 표시 전환
        document.querySelectorAll('.admin-tab-content').forEach(section => {
            section.style.display = 'none';
        });

        const targetSection = document.getElementById(`admin-${tabName}-section`);
        if (targetSection) {
            targetSection.style.display = (tabName === 'general') ? 'grid' : 'block';
        }

        // 강해설교 탭 선택 시 시리즈 목록 로드
        if (tabName === 'bible-study') {
            loadAdminSeries('강해설교');
        }
    };

    let adminSeriesUnsubscribe = null;

    // 관리자용 시리즈 목록 로드 (실시간 동기화로 변경)
    window.loadAdminSeries = (category) => {
        const container = document.getElementById('admin-series-list-container');
        if (!container) return;

        // 기존 리스너가 있으면 해제하여 중복 방지
        if (adminSeriesUnsubscribe) {
            adminSeriesUnsubscribe();
            adminSeriesUnsubscribe = null;
        }

        container.innerHTML = '<div class="loading-msg">시리즈 목록을 불러오는 중...</div>';

        try {
            // onSnapshot을 사용하여 실시간으로 데이터 변화 감지
            adminSeriesUnsubscribe = db.collection("posts")
                .where("tags", "array-contains", category)
                .onSnapshot((snapshot) => {
                    const seriesSet = new Set();
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.series && data.series.trim() !== "") {
                            seriesSet.add(data.series.trim());
                        }
                    });

                    if (seriesSet.size === 0) {
                        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:#999;">아직 생성된 필더(시리즈)가 없습니다.<br>오른쪽 상단 버튼으로 폴더를 먼저 만들어보세요.</div>';
                        return;
                    }

                    container.innerHTML = '';
                    // 가나다순 정렬
                    const sortedSeries = Array.from(seriesSet).sort();

                    sortedSeries.forEach(seriesName => {
                        const card = document.createElement('div');
                        card.className = 'admin-series-card';
                        card.style.cssText = 'background:#f9f9f9; padding:20px; border-radius:12px; border:1px solid #ddd; cursor:pointer; transition:all 0.3s;';
                        card.innerHTML = `
                            <div style="display:flex; align-items:center; gap:15px;">
                                <i class="fas fa-folder" style="font-size:2rem; color:var(--secondary-color);"></i>
                                <div style="flex:1;">
                                    <h4 style="margin:0; font-size:1.1rem;">${seriesName}</h4>
                                    <p style="font-size:0.8rem; color:#888; margin-top:3px;">클릭하여 자료 추가/관리</p>
                                </div>
                                <i class="fas fa-chevron-right" style="color:#ccc;"></i>
                            </div>
                        `;
                        card.onclick = () => openResourceModalWithSeries(category, seriesName);
                        card.onmouseover = () => { card.style.background = '#fff'; card.style.borderColor = 'var(--secondary-color)'; card.style.transform = 'translateY(-3px)'; };
                        card.onmouseout = () => { card.style.background = '#f9f9f9'; card.style.borderColor = '#ddd'; card.style.transform = 'none'; };
                        container.appendChild(card);
                    });
                }, (err) => {
                    console.error("실시간 시리즈 로드 에러:", err);
                    container.innerHTML = '<div style="color:red; text-align:center; padding:20px;">목록 로딩 중 오류가 발생했습니다.</div>';
                });
        } catch (err) {
            console.error(err);
            container.innerHTML = '목록 로딩 실패';
        }
    };

    window.createNewSeriesPrompt = (category) => {
        const name = prompt("새롭게 만드실 시리즈(폴더) 이름을 입력하세요.\n예: 사도행전 강해 시리즈");
        if (name && name.trim()) {
            // 폴더를 '생성'한다는 것은 해당 시리즈명으로 첫 자료를 올릴 준비를 하는 것
            openResourceModalWithSeries(category, name.trim());
            setTimeout(() => {
                const uploadBtn = document.getElementById('toggle-modal-upload');
                if (uploadBtn) uploadBtn.click();
            }, 500);
        }
    };

    // 특정 시리즈가 선택된 상태로 모달 열기
    window.openResourceModalWithSeries = (category, seriesName) => {
        window.openResourceModal(category);
        // 모달이 열린 후 인풋 세팅을 위해 약간의 지연
        setTimeout(() => {
            const seriesInput = document.getElementById('modal-post-series');
            if (seriesInput) {
                seriesInput.value = seriesName;
                seriesInput.readOnly = true; // 폴더 내 업로드 시 이름 고정
            }
        }, 300);
    };
    let currentUploadTarget = null;

    window.prepareUploadForCategory = (categoryName) => {
        // 이 함수는 이제 모달 내부의 업로드 창을 열어주는 역할로 변경합니다.
        const modalUploadForm = document.getElementById('modal-upload-form');
        if (modalUploadForm) {
            modalUploadForm.style.display = 'block';
            const titleInput = document.getElementById('modal-post-title');
            if (titleInput) titleInput.focus();
        }
    };

    window.clearUploadTarget = () => {
        // 기존 알림바 제거
        const targetInfo = document.getElementById('admin-upload-target-info');
        if (targetInfo) targetInfo.style.display = 'none';
    };

    if (uploadForm && recentPostsList) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const topic = document.getElementById('post-topic').value;
            const author = document.getElementById('post-author').value;
            const other = document.getElementById('post-other-category').value;

            let tags = [topic, author, other].filter(t => t !== "");
            if (currentUploadTarget) {
                if (!tags.includes(currentUploadTarget)) tags.push(currentUploadTarget);
            }
            const title = document.getElementById('post-title').value.trim() || '제목 없음';
            const series = document.getElementById('post-series').value.trim() || '';
            const content = document.getElementById('post-content').value;
            const fileInput = document.getElementById('post-file');
            const file = fileInput.files[0];

            if (tags.length === 0) {
                alert("최소 하나 이상의 분류를 선택해 주세요.");
                return;
            }

            console.log('📤 업로드 시작:', { tags, title });

            if (useMock) {
                // Mock Upload
                alert(`[테스트 모드] 자료가 업로드되었습니다.`);

                const li = document.createElement('li');
                li.className = 'post-item';
                const date = new Date().toLocaleString();
                li.innerHTML = `
                    <strong>[${tags.join(', ')}]</strong> ${title} 
                    <span style="color:red; font-size:0.8em;">(테스트 저장)</span>
                    <br> <small>${date}</small>
                `;
                if (recentPostsList.querySelector('.empty-msg')) recentPostsList.innerHTML = '';
                recentPostsList.prepend(li); // Add to top

                uploadForm.reset();
                return;
            }

            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            const progressContainer = document.getElementById('upload-progress-container');
            const progressBar = document.getElementById('upload-progress-bar');
            const percText = document.getElementById('upload-perc-text');
            const statusText = document.getElementById('upload-status-text');
            const originalBtnText = submitBtn.innerHTML;

            // --- 1. UI 초기화 및 상태 표시 ---
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 업로드 준비 중...';

            if (progressContainer) {
                progressContainer.style.display = 'block';
                if (progressBar) progressBar.style.width = '0%';
                if (percText) percText.textContent = '0%';
                if (statusText) statusText.textContent = '서버 연결 중...';
            }

            try {
                // Firebase 상태 체크
                if (!useMock && (!db || !storage)) {
                    throw new Error("Firebase가 아직 초기화되지 않았거나 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
                }

                let fileUrl = "";

                // --- 2. 파일 업로드 (있을 경우) ---
                if (file) {
                    console.log(`📂 파일 업로드 시도: ${file.name} (${file.size} bytes)`);
                    const storageRef = storage.ref(`files/${Date.now()}_${file.name}`);
                    const uploadTask = storageRef.put(file);

                    fileUrl = await new Promise((resolve, reject) => {
                        uploadTask.on('state_changed',
                            (snapshot) => {
                                const progress = (snapshot.totalBytes > 0)
                                    ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                                    : 0;

                                // UI 업데이트
                                if (progressBar) progressBar.style.width = progress + '%';
                                if (percText) percText.textContent = Math.round(progress) + '%';
                                if (statusText) statusText.textContent = `파일 전송 중... (${Math.round(progress)}%)`;

                                submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> 전송 중 (${Math.round(progress)}%)`;
                                console.log(`📊 업로드 진행률: ${Math.round(progress)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes})`);
                            },
                            (error) => {
                                console.error("❌ Storage 업로드 에러 상세:", error);
                                reject(new Error("파일 서버 업로드 중 오류가 발생했습니다: " + error.message));
                            },
                            async () => {
                                try {
                                    if (statusText) statusText.textContent = '파일 처리 중...';
                                    console.log('✅ 파일 업로드 완료, URL 추출 중...');
                                    const url = await uploadTask.snapshot.ref.getDownloadURL();
                                    resolve(url);
                                } catch (err) {
                                    console.error("❌ URL 추출 에러:", err);
                                    reject(new Error("파일 주소를 가져오는 데 실패했습니다."));
                                }
                            }
                        );
                    });
                }

                // --- 3. Firestore 데이터 저장 ---
                if (statusText) statusText.textContent = '자료 정보 저장 중...';
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 정보 저장 중...';

                const postData = {
                    topic,
                    author,
                    otherCategory: other,
                    tags,
                    title,
                    series,
                    content,
                    fileUrl,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                console.log('📝 Firestore 저장 데이터:', postData);
                await db.collection("posts").add(postData);

                // --- 4. 성공 처리 ---
                if (statusText) statusText.textContent = '업로드 완료!';
                alert(`✅ 자료가 성공적으로 업로드되었습니다!`);

                uploadForm.reset();
                clearUploadTarget();
                if (window.loadRecentPostsGrid) window.loadRecentPostsGrid();

            } catch (error) {
                console.error("❌ Upload Workflow Error:", error);
                alert("업로드 중 오류가 발생했습니다:\n" + error.message);
            } finally {
                // UI 복구
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                // 진행바는 성공 시 1~2초 후 사라지게 하거나 즉시 숨김
                setTimeout(() => {
                    if (progressContainer) progressContainer.style.display = 'none';
                    if (progressBar) progressBar.style.width = '0%';
                }, 2000);
            }

        });

        // 실시간 목록 불러오기 (Only if not mocking initially)
        if (!useMock && db) {
            db.collection("posts").orderBy("createdAt", "desc").limit(100)
                .onSnapshot((querySnapshot) => {
                    recentPostsList.innerHTML = '';
                    if (querySnapshot.empty) {
                        recentPostsList.innerHTML = '<li class="empty-msg">아직 업로드된 자료가 없습니다.</li>';
                        return;
                    }
                    querySnapshot.forEach((doc) => {
                        const post = doc.data();
                        const id = doc.id;
                        const li = document.createElement('li');
                        li.className = 'post-item admin-post-item';
                        const date = post.createdAt ? post.createdAt.toDate().toLocaleString() : '방금 전';
                        const displayTags = post.tags ? post.tags.join(', ') : '분류 없음';
                        li.innerHTML = `
                            <div class="post-info">
                                <strong>[${displayTags}]</strong> ${post.title} 
                                ${post.fileUrl ? `<a href="${post.fileUrl}" target="_blank" style="color:var(--secondary-color); margin-left:10px;"><i class="fas fa-file-download"></i></a>` : ''}
                                <br> <small>${date}</small>
                            </div>
                            <div class="post-actions">
                                <button class="action-btn edit" onclick="openEditModal('${id}')"><i class="fas fa-edit"></i></button>
                                <button class="action-btn delete" onclick="deletePost('${id}')"><i class="fas fa-trash"></i></button>
                            </div>
                        `;
                        recentPostsList.appendChild(li);
                    });
                }, (error) => {
                    console.log("Real-time sync failed:", error);
                    // Ignore auth errors for casual browsing
                });
        }
    }

    // --- Edit & Delete Functions ---
    const editModal = document.getElementById('edit-modal');
    const editCloseBtn = document.getElementById('edit-close-btn');
    const editForm = document.getElementById('edit-form');

    if (editCloseBtn) {
        editCloseBtn.addEventListener('click', () => editModal.classList.remove('show'));
    }

    window.openEditModal = async (id) => {
        try {
            const doc = await db.collection("posts").doc(id).get();
            if (!doc.exists) return alert("자료를 찾을 수 없습니다.");
            const post = doc.data();

            document.getElementById('edit-post-id').value = id;
            document.getElementById('edit-topic').value = post.topic || "";
            document.getElementById('edit-author').value = post.author || "";
            document.getElementById('edit-other-category').value = post.otherCategory || "";

            document.getElementById('edit-title').value = post.title;
            document.getElementById('edit-series').value = post.series || "";
            document.getElementById('edit-content').value = post.content || '';
            document.getElementById('edit-file-status').textContent = post.fileUrl ? "기존 파일이 있습니다 (교체 시 새로 선택)" : "첨부된 파일 없음";

            editModal.classList.add('show');
        } catch (error) {
            console.error("Error opening edit modal:", error);
        }
    };

    window.deletePost = async (id) => {
        if (!confirm("정말 이 자료를 삭제하시겠습니까?")) return;
        try {
            await db.collection("posts").doc(id).delete();
            alert("삭제되었습니다.");
        } catch (error) {
            console.error("Delete error:", error);
            alert("삭제 실패: " + error.message);
        }
    };

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-post-id').value;

            const topic = document.getElementById('edit-topic').value;
            const author = document.getElementById('edit-author').value;
            const other = document.getElementById('edit-other-category').value;
            const tags = [topic, author, other].filter(t => t !== "");

            const title = document.getElementById('edit-title').value.trim();
            const series = document.getElementById('edit-series').value.trim() || "";
            const content = document.getElementById('edit-content').value;
            const fileInput = document.getElementById('edit-file');
            const file = fileInput.files[0];

            if (tags.length === 0) {
                alert("최소 하나 이상의 분류를 선택해 주세요.");
                return;
            }

            const submitBtn = editForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 수정 중...';

            try {
                let updateData = {
                    topic,
                    author,
                    otherCategory: other,
                    tags,
                    title,
                    series,
                    content,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                if (file) {
                    const storageRef = storage.ref(`files/${Date.now()}_${file.name}`);
                    await storageRef.put(file);
                    updateData.fileUrl = await storageRef.getDownloadURL();
                }

                await db.collection("posts").doc(id).update(updateData);
                alert("수정되었습니다.");
                editModal.classList.remove('show');
            } catch (error) {
                console.error("Update error:", error);
                alert("수정 실패: " + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Inquiry Form Logic
    const inquiryForm = document.querySelector('.inquiry-form');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('문의 및 세미나 소식 신청이 접수되었습니다. 곧 안내해 드리겠습니다.');
            inquiryForm.reset();
        });
    }
    // Resource Modal Logic
    const resourceModal = document.getElementById('resource-modal');
    const resourceCloseBtn = document.getElementById('resource-close-btn');
    const resourceListContainer = document.getElementById('resource-list-container');
    const resourceModalTitle = document.getElementById('resource-modal-title');

    window.openResourceModal = async (categoryName) => {
        if (!resourceModal) return;
        resourceModal.classList.add('show');
        resourceListContainer.classList.remove('compact-view'); // 기본 목록은 크게
        resourceModalTitle.textContent = `${categoryName} 자료 목록`;
        resourceListContainer.innerHTML = '<li class="no-resource-msg">자료를 불러오는 중입니다...</li>';

        // Admin UI Logic in Modal
        const adminHeader = document.getElementById('resource-modal-admin-header');
        const modalUploadForm = document.getElementById('modal-upload-form');
        const toggleBtn = document.getElementById('toggle-modal-upload');
        const seriesInput = document.getElementById('modal-post-series');

        if (adminHeader) {
            if (typeof isAdmin !== 'undefined' && isAdmin) {
                adminHeader.style.display = 'block';
                modalUploadForm.style.display = 'none'; // 초기엔 닫힘
                toggleBtn.textContent = '업로드 창 열기';

                // 시리즈가 폴더면 시리즈 인풋값을 폴더명으로 자동 세팅. 
                // 단 성경책/주제 등은 시리즈라기보단 태그이므로 비워두거나 필요시 입력.
                if (seriesInput && !seriesInput.value) {
                    seriesInput.value = '';
                    seriesInput.readOnly = false;
                }

                toggleBtn.onclick = () => {
                    const isHidden = modalUploadForm.style.display === 'none';
                    modalUploadForm.style.display = isHidden ? 'block' : 'none';
                    toggleBtn.textContent = isHidden ? '업로드 창 닫기' : '업로드 창 열기';
                };

                // 모달 전용 업로드 이벤트
                modalUploadForm.onsubmit = async (e) => {
                    e.preventDefault();
                    const title = document.getElementById('modal-post-title').value.trim();
                    const series = document.getElementById('modal-post-series').value.trim();
                    const content = document.getElementById('modal-post-content').value;
                    const fileInput = document.getElementById('modal-post-file');
                    const file = fileInput.files[0];
                    const progressContainer = document.getElementById('modal-upload-progress');
                    const progressBar = document.getElementById('modal-upload-bar');

                    if (!title) { alert('제목을 입력해 주세요.'); return; }

                    try {
                        let fileUrl = "";
                        if (file) {
                            progressContainer.style.display = 'block';
                            const storageRef = storage.ref(`files/${Date.now()}_${file.name}`);
                            const uploadTask = storageRef.put(file);

                            fileUrl = await new Promise((res, rej) => {
                                uploadTask.on('state_changed',
                                    (snap) => {
                                        const p = (snap.bytesTransferred / snap.totalBytes) * 100;
                                        progressBar.style.width = p + '%';
                                    }, rej, async () => {
                                        res(await uploadTask.snapshot.ref.getDownloadURL());
                                    }
                                );
                            });
                        }

                        await db.collection("posts").add({
                            title, series, content, fileUrl,
                            tags: [categoryName],
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        alert('✅ 업로드 완료!');
                        modalUploadForm.reset();
                        modalUploadForm.style.display = 'none';
                        toggleBtn.textContent = '업로드 창 열기';
                        openResourceModal(categoryName); // 목록 새로고침
                        if (window.loadRecentPostsGrid) window.loadRecentPostsGrid(); // 메인 갱신
                    } catch (err) {
                        alert('업로드 실패: ' + err.message);
                    } finally {
                        progressContainer.style.display = 'none';
                        progressBar.style.width = '0%';
                    }
                };
            } else {
                adminHeader.style.display = 'none';
            }
        }

        // Use Mock data if in test mode
        if (typeof useMock !== 'undefined' && useMock) {
            setTimeout(() => {
                resourceListContainer.innerHTML = `
                    <li class="resource-item">
                        <div class="resource-header">
                            <span class="resource-title">[테스트] ${categoryName} 관련 자료 예시</span>
                            <span class="resource-date">2026.01.15</span>
                        </div>
                        <div class="resource-body">이것은 테스트 모드에서 보여지는 예시 자료입니다. 실제 업로드된 자료가 아닙니다.</div>
                    </li>`;
            }, 500);
            return;
        }

        try {
            // Updated Query Logic: Use "tags" array-contains
            const snapshot = await db.collection("posts")
                .where("tags", "array-contains", categoryName)
                .get();

            if (snapshot.empty) {
                resourceListContainer.innerHTML = '<li class="no-resource-msg">아직 등록된 자료가 없습니다.</li>';
                return;
            }

            let posts = [];
            snapshot.forEach(doc => {
                posts.push({ id: doc.id, ...doc.data() });
            });

            // Sort by date desc (Javascript Sort)
            posts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

            // Group items by series
            const groupedPosts = {};
            posts.forEach(post => {
                const sName = (post.series && post.series.trim()) ? post.series.trim() : '_none';
                if (!groupedPosts[sName]) groupedPosts[sName] = [];
                groupedPosts[sName].push(post);
            });

            resourceListContainer.innerHTML = '';

            // 1. Render Series Groups (Folders)
            Object.keys(groupedPosts).forEach(sName => {
                if (sName === '_none') return;

                const seriesPosts = groupedPosts[sName];
                // 회차 순으로 정렬 (오래된 순 -> 회차별로 1편, 2편 순서대로 나오게)
                seriesPosts.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

                // 대표 이미지 찾기 (첫 번째 포스트에서 추출)
                let thumbId = '';
                const firstPostWithVideo = seriesPosts.find(p => p.content && (p.content.includes('youtube.com') || p.content.includes('youtu.be')));

                if (firstPostWithVideo) {
                    const contentText = firstPostWithVideo.content;
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const urlsInContent = contentText.match(urlRegex) || [];
                    urlsInContent.forEach(url => {
                        const lowerUrl = url.toLowerCase();
                        if (lowerUrl.includes('v=')) { thumbId = url.split('v=')[1].split('&')[0]; }
                        else if (lowerUrl.includes('youtu.be/')) { thumbId = url.split('youtu.be/')[1].split('?')[0]; }
                    });
                }

                const thumbUrl = thumbId
                    ? `https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`
                    : 'https://images.unsplash.com/photo-1507738911740-02941ded416a?auto=format&fit=crop&q=80&w=400';

                const seriesCard = document.createElement('li');
                seriesCard.className = 'series-folder-item';
                seriesCard.innerHTML = `
                    <div class="series-folder-header">
                        <div class="series-thumbnail-wrapper">
                            <img src="${thumbUrl}" alt="Thumbnail">
                            <div class="series-thumbnail-overlay">
                                <i class="fas fa-play-circle"></i>
                                <span>${seriesPosts.length}</span>
                            </div>
                        </div>
                        <div class="folder-text">
                            <span class="series-label">재생목록 시리즈</span>
                            <h3 class="series-name">${sName}</h3>
                            <span class="series-count">총 ${seriesPosts.length}개의 말씀과 자료</span>
                        </div>
                        <i class="fas fa-chevron-down toggle-icon"></i>
                    </div>
                    <ul class="series-sub-list" style="display: none;"></ul>
                `;

                const subList = seriesCard.querySelector('.series-sub-list');
                const header = seriesCard.querySelector('.series-folder-header');

                header.addEventListener('click', () => {
                    const isVisible = subList.style.display === 'block';
                    subList.style.display = isVisible ? 'none' : 'block';
                    seriesCard.classList.toggle('expanded', !isVisible);
                });

                seriesPosts.forEach(post => renderSingleResource(post, subList));
                resourceListContainer.appendChild(seriesCard);
            });

            // 2. Render standalone posts (No series)
            if (groupedPosts['_none']) {
                groupedPosts['_none'].forEach(post => renderSingleResource(post, resourceListContainer));
            }

        } catch (error) {
            console.error("Error fetching documents: ", error);
            resourceListContainer.innerHTML = `<li class="no-resource-msg">자료를 불러오는 중 오류가 발생했습니다.<br>(${error.message})</li>`;
        }
    };

    function renderSingleResource(post, container) {
        const li = document.createElement('li');
        li.className = 'resource-item-wrapper';

        const date = post.createdAt ? post.createdAt.toDate().toLocaleDateString() : '날짜 없음';
        let youtubeEmbedHtml = '';
        let contentText = post.content || '';
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urlsInContent = contentText.match(urlRegex) || [];
        let primaryLink = post.fileUrl || (urlsInContent.length > 0 ? urlsInContent[0] : '#');
        let isPdf = primaryLink.toLowerCase().includes('.pdf');

        if (contentText.toLowerCase().includes('youtube.com') || contentText.toLowerCase().includes('youtu.be')) {
            urlsInContent.forEach(url => {
                let embedUrl = '';
                const lowerUrl = url.toLowerCase();
                if (lowerUrl.includes('list=')) { embedUrl = `https://www.youtube.com/embed/videoseries?list=${url.split('list=')[1].split('&')[0]}`; }
                else if (lowerUrl.includes('v=')) { embedUrl = `https://www.youtube.com/embed/${url.split('v=')[1].split('&')[0]}`; }
                else if (lowerUrl.includes('youtu.be/')) { embedUrl = `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`; }
                if (embedUrl) { youtubeEmbedHtml += `<div class="youtube-embed-container" style="border-bottom: 1px solid #eee;"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`; }
            });
        }

        const linkedContent = contentText.replace(urlRegex, '<a href="$1" target="_blank" class="text-link">$1</a>');
        let fileLinkHtml = '';
        if (post.fileUrl) {
            const icon = isPdf ? 'fa-file-pdf' : 'fa-file-download';
            const label = isPdf ? 'PDF 파일 보기' : '첨부파일 다운로드';
            const color = isPdf ? '#e74c3c' : 'var(--secondary-color)';
            fileLinkHtml = `<a href="${post.fileUrl}" target="_blank" class="resource-link premium-btn" style="border-color:${color}; color:${color}; margin-top:10px;">
                <i class="fas ${icon}"></i> ${label}</a>`;
        }

        let adminButtons = '';
        if (isAdmin) {
            adminButtons = `
                <div class="resource-admin-actions">
                    <button onclick="openEditModal('${post.id}')" class="action-btn edit-small" title="수정"><i class="fas fa-edit"></i></button>
                    <button onclick="deletePost('${post.id}')" class="action-btn delete-small" title="삭제"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }

        li.innerHTML = `
            <div class="resource-card-modern" style="margin-bottom: 20px;">
                ${youtubeEmbedHtml}
                <div class="resource-content-padding">
                    <div class="resource-header-modern">
                        <div class="resource-tag-row">
                            <span class="resource-type-badge">${post.tags && post.tags[0] ? post.tags[0] : '자료'}</span>
                            <span class="resource-date-modern">${date}</span>
                        </div>
                        <h4 class="resource-title-modern">
                            <a href="${primaryLink}" target="${primaryLink !== '#' ? '_blank' : '_self'}" class="title-clickable">
                                ${isPdf ? '<i class="fas fa-file-pdf" style="color:#e74c3c; margin-right:5px;"></i>' : ''}
                                ${post.title}
                                ${primaryLink !== '#' ? '<i class="fas fa-external-link-alt" style="font-size:0.7em; margin-left:8px; opacity:0.3;"></i>' : ''}
                            </a>
                        </h4>
                        ${adminButtons}
                    </div>
                    <div class="resource-body-modern">${linkedContent.trim() || '<span style="color:#ccc; font-style:italic;">상세 내용 없음</span>'}</div>
                    ${fileLinkHtml}
                </div>
            </div>`;
        container.appendChild(li);
    }

    if (resourceCloseBtn && resourceModal) {
        resourceCloseBtn.addEventListener('click', () => {
            resourceModal.classList.remove('show');
        });
    }

    // Load Public Recent Posts (Visitor View) with Infinite Scroll
    const recentGrid = document.getElementById('recent-posts-grid');
    const recentLoadMoreTrigger = document.getElementById('recent-load-more');
    let lastRecentDoc = null;
    let isRecentLoading = false;
    let hasMoreRecent = true;

    window.loadRecentPostsGrid = async (isInitial = true) => {
        if (!recentGrid || typeof db === 'undefined' || isRecentLoading || !hasMoreRecent && !isInitial) return;

        // Safe check for Mock Mode
        if (typeof useMock !== 'undefined' && useMock) {
            recentGrid.innerHTML = '<p style="text-align:center;">[테스트 모드] 서버 연결 대기 중...</p>';
            return;
        }

        isRecentLoading = true;
        if (isInitial) {
            recentGrid.innerHTML = '<div class="loading-msg">자료를 불러오는 중입니다...</div>';
            lastRecentDoc = null;
            hasMoreRecent = true;
        }

        if (recentLoadMoreTrigger) {
            recentLoadMoreTrigger.style.display = 'none';
        }

        try {
            // 메인 페이지에는 최상위 6개만 항상 표시
            let query = db.collection("posts").orderBy("createdAt", "desc").limit(6);
            const snapshot = await query.get();

            if (snapshot.empty) {
                if (isInitial) {
                    recentGrid.innerHTML = '<p style="text-align:center; width:100%; color:#999;">아직 등록된 자료가 없습니다.</p>';
                }
                hasMoreRecent = false;
                return;
            }

            if (isInitial) {
                recentGrid.innerHTML = '';
            }

            snapshot.forEach(doc => {
                const post = doc.data();
                const date = post.createdAt ? post.createdAt.toDate().toLocaleDateString() : '최근';
                const displayCategory = post.tags ? post.tags[0] : '자료';

                const div = document.createElement('div');
                div.className = 'recent-card-premium';
                div.innerHTML = `
                    <div class="recent-card-inner">
                        <div class="recent-card-top">
                            <span class="recent-status-pill">NEW</span>
                            <span class="recent-category-tag">${displayCategory}</span>
                        </div>
                        <h3 class="recent-title-premium">${post.title}</h3>
                        <div class="recent-card-footer">
                            <span class="recent-date-premium"><i class="far fa-calendar-alt"></i> ${date}</span>
                            <button class="recent-link-btn" onclick="openResourceModal('${displayCategory}')">
                                상세보기 <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                `;
                recentGrid.appendChild(div);
            });

            hasMoreRecent = false;

        } catch (err) {
            console.log("Error loading recents:", err);
            if (isInitial) {
                recentGrid.innerHTML = '<p style="text-align:center; color:red;">자료 불러오기 실패</p>';
            }
        } finally {
            isRecentLoading = false;
        }
    };

    // Set up Infinite Scroll Observer removed to keep main page clean (limit 4)

    // Initial Load
    loadRecentPostsGrid();

    // Real Search Logic
    const searchInput = document.querySelector('.search-bar input');

    const performSearch = async (query) => {
        if (!query) return;
        if (!resourceModal) return;

        resourceModal.classList.add('show');
        resourceModalTitle.textContent = `'${query}' 검색 결과`;
        resourceListContainer.innerHTML = '<li class="no-resource-msg">검색 중입니다...</li>';

        try {
            const snapshot = await db.collection("posts")
                .where('title', '>=', query)
                .where('title', '<=', query + '\uf8ff')
                .get();

            if (snapshot.empty) {
                resourceListContainer.innerHTML = '<li class="no-resource-msg">검색 결과가 없습니다.</li>';
                return;
            }

            resourceListContainer.innerHTML = '';
            snapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                renderSingleResource(post, resourceListContainer);
            });

        } catch (error) {
            console.error("Search Error: ", error);
            resourceListContainer.innerHTML = `<li class="no-resource-msg">검색 중 오류가 발생했습니다.<br>(${error.message})</li>`;
        }
    };

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value.trim());
            }
        });
        const searchIcon = document.querySelector('.search-icon');
        if (searchIcon) {
            searchIcon.addEventListener('click', () => performSearch(searchInput.value.trim()));
        }
    }

    // --- Global View Functions (Moved here for scope) ---
    window.openAllRecentModal = async () => {
        if (!resourceModal) return;
        resourceModal.classList.add('show');
        resourceModalTitle.textContent = `최신 업데이트 전체 목록`;
        resourceListContainer.innerHTML = '<li class="no-resource-msg">최신 자료를 불러오는 중입니다...</li>';
        resourceListContainer.classList.add('compact-view'); // 숲을 볼 수 있게 콤팩트하게 표시

        try {
            const snapshot = await db.collection("posts")
                .orderBy("createdAt", "desc")
                .limit(200)
                .get();

            if (snapshot.empty) {
                resourceListContainer.innerHTML = '<li class="no-resource-msg">최신 자료가 없습니다.</li>';
                return;
            }

            resourceListContainer.innerHTML = '';

            // 전체보기 모달에서도 관리자 기능을 위해 UI 설정 로직 추가
            const adminHeader = document.getElementById('resource-modal-admin-header');
            const modalUploadForm = document.getElementById('modal-upload-form');
            if (adminHeader) {
                if (typeof isAdmin !== 'undefined' && isAdmin) {
                    adminHeader.style.display = 'block';
                    modalUploadForm.style.display = 'none';
                } else {
                    adminHeader.style.display = 'none';
                }
            }

            snapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                renderSingleResource(post, resourceListContainer);
            });
        } catch (e) {
            console.error(e);
            resourceListContainer.innerHTML = '<li class="no-resource-msg">자료를 불러오는 중에 오류가 발생했습니다.</li>';
        }
    };

    window.openAllTopicsModal = () => {
        if (!resourceModal) return;
        resourceModal.classList.add('show');
        resourceListContainer.classList.remove('compact-view');
        resourceModalTitle.textContent = `전체 주제 목록`;
        resourceListContainer.innerHTML = '<div class="main-grid-container" id="modal-topic-grid"></div>';

        // 검색/카테고리 선택 모달에서는 업로드 헤더 숨김
        const adminHeader = document.getElementById('resource-modal-admin-header');
        if (adminHeader) adminHeader.style.display = 'none';

        const grid = document.getElementById('modal-topic-grid');

        topics.forEach(item => {
            const div = document.createElement('div');
            div.className = 'main-grid-item';
            div.innerHTML = `
                <i class="fas fa-tags"></i>
                <span>${item}</span>
            `;
            div.addEventListener('click', () => {
                openResourceModal(item);
            });
            grid.appendChild(div);
        });
    };

    window.openAllAuthorsModal = () => {
        if (!resourceModal) return;
        resourceModal.classList.add('show');
        resourceListContainer.classList.remove('compact-view');
        resourceModalTitle.textContent = `전체 저자 목록`;
        resourceListContainer.innerHTML = `
            <div class="author-search-container" style="margin-bottom: 2rem;">
                <input type="text" id="modal-author-search" placeholder="저자 이름 검색..." style="width: 100%; padding: 1rem; border-radius: 8px; border: 1px solid #ddd;">
            </div>
            <div class="main-grid-container" id="modal-author-grid"></div>
        `;

        // 검색/카테고리 선택 모달에서는 업로드 헤더 숨김
        const adminHeader = document.getElementById('resource-modal-admin-header');
        if (adminHeader) adminHeader.style.display = 'none';

        const grid = document.getElementById('modal-author-grid');
        const searchInput = document.getElementById('modal-author-search');

        const renderGrid = (list) => {
            grid.innerHTML = '';
            list.forEach(item => {
                const div = document.createElement('div');
                div.className = 'main-grid-item';
                div.innerHTML = `
                    <i class="fas fa-user-edit"></i>
                    <span>${item}</span>
                `;
                div.addEventListener('click', () => {
                    openResourceModal(item);
                });
                grid.appendChild(div);
            });
        };

        renderGrid(authors);

        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = authors.filter(a => a.toLowerCase().includes(val));
            renderGrid(filtered);
        });
    };

}); // End of main DOMContentLoaded

// --- BGM Player Logic (YouTube API) ---
let player;
const bgmVideoId = 'rr8AnfdhP7Q'; // Amazing Grace (Instrumental)
let isPlayerReady = false;

// Load YouTube API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('yt-player-container', {
        height: '0',
        width: '0',
        videoId: bgmVideoId,
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'loop': 1,
            'playlist': bgmVideoId,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    isPlayerReady = true;
    player.setVolume(50); // Set volume
    player.playVideo();   // Attempt immediate playback
}

function onPlayerStateChange(event) {
    const bgmPlayer = document.getElementById('bgm-player');
    const musicText = document.querySelector('.music-text');

    if (event.data === YT.PlayerState.PLAYING) {
        if (bgmPlayer) bgmPlayer.classList.add('playing');
        if (musicText) musicText.textContent = "Amazing Grace (Instrumental)";
    } else if (event.data === YT.PlayerState.PAUSED) {
        if (bgmPlayer) bgmPlayer.classList.remove('playing');
        if (musicText) musicText.textContent = "배경음악 On/Off";
    }
}

// BGM Toggle & Autoplay Fallback
document.addEventListener('DOMContentLoaded', () => {
    const bgmBtn = document.getElementById('bgm-toggle-btn');

    // Toggle Button Logic
    if (bgmBtn) {
        bgmBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't trigger the body fallback

            if (!isPlayerReady || !player) {
                alert("음악 플레이어가 로딩 중입니다. 잠시만 기다려주세요.");
                return;
            }

            const state = player.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        });
    }

    // Robust Auto-play Fallback (One-time click on body)
    const unlockAudio = () => {
        if (isPlayerReady && player) {
            if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
                player.playVideo();
            }
        }
        // Remove listeners after first interaction
        document.body.removeEventListener('click', unlockAudio);
        document.body.removeEventListener('touchstart', unlockAudio);
        document.body.removeEventListener('keydown', unlockAudio);
    };

    // --- Global View Functions (Moved to main scope above) ---
}); // End of main DOMContentLoaded

