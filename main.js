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

    const bibleDropdown = document.getElementById('bible-dropdown');
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
    renderMegaMenuItems(bibleBooks, bibleDropdown);
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

    populateSelect('post-bible-book', bibleBooks);
    populateSelect('post-topic', topics);
    populateSelect('post-author', authors);
    populateSelect('edit-bible-book', bibleBooks);
    populateSelect('edit-topic', topics);
    populateSelect('edit-author', authors);

    // Real Database Upload Logic
    const uploadForm = document.getElementById('post-upload-form');
    const recentPostsList = document.getElementById('admin-recent-posts');
    let currentUploadTarget = null;

    window.prepareUploadForCategory = (categoryName) => {
        currentUploadTarget = categoryName;
        const modal = document.getElementById('resource-modal');
        if (modal) modal.classList.remove('show');

        const targetInfo = document.getElementById('admin-upload-target-info');
        const targetName = document.getElementById('admin-target-category-name');
        if (targetInfo && targetName) {
            targetInfo.style.display = 'block';
            targetName.textContent = categoryName;
        }

        const adminSection = document.getElementById('admin');
        if (adminSection) adminSection.scrollIntoView({ behavior: 'smooth' });
    };

    window.clearUploadTarget = () => {
        currentUploadTarget = null;
        const targetInfo = document.getElementById('admin-upload-target-info');
        if (targetInfo) targetInfo.style.display = 'none';
    };

    if (uploadForm && recentPostsList) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const bibleBook = document.getElementById('post-bible-book').value;
            const topic = document.getElementById('post-topic').value;
            const author = document.getElementById('post-author').value;
            const other = document.getElementById('post-other-category').value;

            let tags = [bibleBook, topic, author, other].filter(t => t !== "");
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
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 대기 중...';

            try {
                let fileUrl = "";

                // 파일이 있다면 Firebase Storage에 업로드
                if (file) {
                    if (progressContainer) progressContainer.style.display = 'block';
                    const storageRef = storage.ref(`files/${Date.now()}_${file.name}`);
                    const uploadTask = storageRef.put(file);

                    fileUrl = await new Promise((resolve, reject) => {
                        uploadTask.on('state_changed',
                            (snapshot) => {
                                const progress = (snapshot.totalBytes > 0)
                                    ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                                    : 0;

                                if (progressBar) progressBar.style.width = progress + '%';
                                if (percText) percText.textContent = Math.round(progress) + '%';
                                submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> 전송 중 (${Math.round(progress)}%)`;
                                console.log(`📊 업로드 진행률: ${Math.round(progress)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes})`);
                            },
                            (error) => {
                                console.error("❌ Storage 업로드 에러 상세:", error);
                                reject(error);
                            },
                            async () => {
                                try {
                                    console.log('✅ 파일 업로드 완료, URL 추출 중...');
                                    const url = await uploadTask.snapshot.ref.getDownloadURL();
                                    resolve(url);
                                } catch (err) {
                                    console.error("❌ URL 추출 에러:", err);
                                    reject(err);
                                }
                            }
                        );
                    });
                }

                // Firestore에 저장
                const postData = {
                    bibleBook,
                    topic,
                    author,
                    otherCategory: other,
                    tags,
                    title,
                    series, // 누락된 시리즈 필드 추가
                    content,
                    fileUrl,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                console.log('📝 Firestore 저장 데이터:', postData);
                await db.collection("posts").add(postData);

                alert(`✅ 자료가 성공적으로 업로드되었습니다!`);
                uploadForm.reset();
                clearUploadTarget(); // 업로드 후 타겟 초기화
                if (progressContainer) progressContainer.style.display = 'none';
            } catch (error) {
                console.error("Error adding document: ", error);
                alert("업로드 중 오류가 발생했습니다: " + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                if (progressContainer) progressContainer.style.display = 'none';
                if (progressBar) progressBar.style.width = '0%';
            }
        });

        // 실시간 목록 불러오기 (Only if not mocking initially)
        if (!useMock && db) {
            db.collection("posts").orderBy("createdAt", "desc").limit(10)
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
            document.getElementById('edit-bible-book').value = post.bibleBook || "";
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

            const bibleBook = document.getElementById('edit-bible-book').value;
            const topic = document.getElementById('edit-topic').value;
            const author = document.getElementById('edit-author').value;
            const other = document.getElementById('edit-other-category').value;
            const tags = [bibleBook, topic, author, other].filter(t => t !== "");

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
                    bibleBook,
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
        resourceModalTitle.textContent = `${categoryName} 자료 목록`;
        resourceListContainer.innerHTML = '<li class="no-resource-msg">자료를 불러오는 중입니다...</li>';

        // Admin Upload Button in Modal
        const adminHeader = document.getElementById('resource-modal-admin-header');
        if (adminHeader) {
            if (typeof isAdmin !== 'undefined' && isAdmin) {
                adminHeader.style.display = 'block';
                adminHeader.innerHTML = `
                    <button class="cta-btn primary" style="padding: 10px 20px; font-size: 0.9rem;" onclick="prepareUploadForCategory('${categoryName}')">
                        <i class="fas fa-plus-circle"></i> '${categoryName}'에 새 자료 올리기
                    </button>
                `;
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
                seriesPosts.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

                const seriesCard = document.createElement('li');
                seriesCard.className = 'series-folder-item';
                seriesCard.innerHTML = `
                    <div class="series-folder-header">
                        <div class="folder-info">
                            <i class="fas fa-folder folder-icon"></i>
                            <div class="folder-text">
                                <span class="series-label">시리즈 자료</span>
                                <h3 class="series-name">${sName}</h3>
                                <span class="series-count">${seriesPosts.length}개의 자료</span>
                            </div>
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

                    const icon = header.querySelector('.toggle-icon');
                    icon.className = isVisible ? 'fas fa-chevron-down toggle-icon' : 'fas fa-chevron-up toggle-icon';

                    const fIcon = header.querySelector('.folder-icon');
                    fIcon.className = isVisible ? 'fas fa-folder folder-icon' : 'fas fa-folder-open folder-icon';
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

    // Load Public Recent Posts (Visitor View)
    const recentGrid = document.getElementById('recent-posts-grid');
    if (recentGrid && typeof db !== 'undefined') {
        // Safe check for Mock Mode
        if (typeof useMock !== 'undefined' && useMock) {
            recentGrid.innerHTML = '<p style="text-align:center;">[테스트 모드] 서버 연결 대기 중...</p>';
        } else {
            db.collection("posts").orderBy("createdAt", "desc").limit(6).get()
                .then((snapshot) => {
                    if (snapshot.empty) {
                        recentGrid.innerHTML = '<p style="text-align:center; width:100%; color:#999;">아직 등록된 자료가 없습니다.</p>';
                        return;
                    }
                    recentGrid.innerHTML = '';
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
                })
                .catch(err => {
                    console.log("Error loading recents:", err);
                    recentGrid.innerHTML = '<p style="text-align:center; color:red;">자료 불러오기 실패</p>';
                });
        }
    }

    // Real Search Logic
    const searchInput = document.querySelector('.search-bar input');

    const performSearch = async (query) => {
        if (!query) return;
        if (!resourceModal) return;

        resourceModal.classList.add('show');
        resourceModalTitle.textContent = `'${query}' 검색 결과`;
        resourceListContainer.innerHTML = '<li class="no-resource-msg">검색 중입니다...</li>';

        try {
            // Firestore simple prefix search on 'title'
            // Note: This is case-sensitive and prefix-only.
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
        // Also allow clicking search icon if wanted
        const searchIcon = document.querySelector('.search-icon');
        if (searchIcon) {
            searchIcon.addEventListener('click', () => performSearch(searchInput.value.trim()));
        }
    }

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

    // --- Global View Functions ---
    window.openAllRecentModal = async () => {
        if (!resourceModal) return;
        resourceModal.classList.add('show');
        resourceModalTitle.textContent = `최신 업데이트 전체 목록`;
        resourceListContainer.innerHTML = '<li class="no-resource-msg">최신 자료를 불러오는 중입니다...</li>';

        try {
            const snapshot = await db.collection("posts")
                .orderBy("createdAt", "desc")
                .limit(30)
                .get();

            if (snapshot.empty) {
                resourceListContainer.innerHTML = '<li class="no-resource-msg">최신 자료가 없습니다.</li>';
                return;
            }

            // reuse render logic (simplified for this call)
            resourceListContainer.innerHTML = '';
            snapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                renderSingleResource(post, resourceListContainer);
            });
        } catch (e) {
            console.error(e);
        }
    };
}); // End of main DOMContentLoaded
