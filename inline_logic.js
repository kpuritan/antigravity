// --- Core Logic Inlined (Emergency Fix) ---
window.isDataLoaded = false;

// Simplified Modal Opener (Inline)
window.openResourceModal = (category, series, docId) => {
    const modal = document.getElementById('resource-modal');
    const list = document.getElementById('resource-list-container');
    const title = document.getElementById('resource-modal-title');

    if (modal && list) {
        modal.classList.add('show');
        if (title) title.textContent = (series || category) + " 자료 목록";
        list.innerHTML = '<li class="no-resource-msg">자료를 불러오는 중입니다...</li>';

        // Fetch specific resource or list
        if (window.db) {
            let query = window.db.collection("posts");
            if (series) {
                query = query.where("series", "==", series);
            } else {
                query = query.where("tags", "array-contains", category);
            }

            query.orderBy("createdAt", "desc").limit(20).get().then(snap => {
                if (!snap.empty) {
                    list.innerHTML = '';
                    snap.forEach(doc => {
                        const item = doc.data();
                        const li = document.createElement('li');
                        li.className = 'resource-item';

                        // Link Check
                        let linkHtml = '';
                        const fileUrl = item.fileUrl || item.downloadUrl; // fileUrl 혹은 downloadUrl 확인
                        if (fileUrl) linkHtml += `<a href="${fileUrl}" target="_blank" class="download-btn"><i class="fas fa-file-download"></i> 다운로드</a>`;
                        if (item.youtubeLink) linkHtml += `<a href="${item.youtubeLink}" target="_blank" class="download-btn youtube"><i class="fab fa-youtube"></i> 영상 보기</a>`;
                        if (!linkHtml) linkHtml = `<span style="color:#999; font-size:0.8rem;">첨부 파일 없음</span>`;

                        li.innerHTML = `
                                    <div class="resource-header">
                                        <span class="resource-category">${item.series || item.tags[0]}</span>
                                        <span class="resource-date">${item.createdAt ? item.createdAt.toDate().toLocaleDateString() : ''}</span>
                                    </div>
                                    <h3 class="resource-title">${item.title}</h3>
                                    <div class="resource-link-container">
                                        ${linkHtml}
                                    </div>
                                    <div class="resource-content">${item.content || ''}</div>
                                 `;
                        list.appendChild(li);
                    });
                } else {
                    list.innerHTML = '<li class="no-resource-msg">해당 분류에 등록된 자료가 없습니다.</li>';
                }
            }).catch(err => {
                list.innerHTML = '<li class="no-resource-msg">자료 로딩 실패: ' + err.message + '</li>';
            });
        } else {
            list.innerHTML = '<li class="no-resource-msg">DB 연결이 되어있지 않습니다.</li>';
        }
    }
};

window.createCarouselCard = (post, docId) => {
    const date = post.createdAt ? post.createdAt.toDate().toLocaleDateString() : '최근';
    const displayCategory = post.tags ? post.tags[0] : '자료';

    const div = document.createElement('div');
    div.className = 'carousel-card';
    div.innerHTML = `
                <div class="carousel-card-content">
                    <div class="carousel-card-tag">${displayCategory}</div>
                    <div class="carousel-card-title">${post.title}</div>
                    <div class="carousel-card-meta">
                        <span>${date}</span>
                        <div class="carousel-icon-btn"><i class="fas fa-arrow-right"></i></div>
                    </div>
                </div>
            `;
    div.addEventListener('click', () => {
        if (window.openResourceModal) {
            window.openResourceModal(displayCategory, post.series || '', docId);
        } else {
            alert("상세 보기 기능 준비 중...");
        }
    });
    return div;
};

window.loadMainCarousels = async () => {
    if (!window.db) {
        // alert("DEBUG: DB 연결 대기 중...");
        return;
    }
    // alert("DEBUG: 2. (Inline) 데이터 로딩 시작");

    // 1. New Arrivals
    const newTrack = document.getElementById('carousel-new');
    if (newTrack) {
        try {
            const snapshot = await window.db.collection("posts").orderBy("createdAt", "desc").limit(10).get();
            if (!snapshot.empty) {
                window.isDataLoaded = true; // 성공 플래그 설정
                newTrack.innerHTML = '';
                snapshot.forEach(doc => {
                    newTrack.appendChild(window.createCarouselCard(doc.data(), doc.id));
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    // 2. Topics (청교도 신학)
    const topicTrack = document.getElementById('carousel-topic');
    if (topicTrack) {
        try {
            // Fetch more items to allow randomization
            const snapshot = await window.db.collection("posts")
                .where("tags", "array-contains", "청교도 신학")
                .orderBy("createdAt", "desc")
                .limit(40).get();

            if (!snapshot.empty) {
                topicTrack.innerHTML = '';
                const items = [];
                snapshot.forEach(doc => {
                    items.push({ data: doc.data(), id: doc.id });
                });

                // Shuffle and pick 10
                const shuffled = items.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 10);

                selected.forEach(item => {
                    topicTrack.appendChild(window.createCarouselCard(item.data, item.id));
                });
            }
        } catch (e) { console.error(e); }
    }

    // 3. Sermons (강해설교)
    const sermonTrack = document.getElementById('carousel-sermon');
    if (sermonTrack) {
        try {
            const snapshot = await window.db.collection("posts")
                .where("tags", "array-contains", "강해설교")
                .orderBy("createdAt", "desc").limit(10).get();
            if (!snapshot.empty) {
                sermonTrack.innerHTML = '';
                snapshot.forEach(doc => {
                    sermonTrack.appendChild(window.createCarouselCard(doc.data(), doc.id));
                });
            }
        } catch (e) { console.error(e); }
    }
};

// Auto-run if DB connected
if (window.db) {
    setTimeout(window.loadMainCarousels, 100);
}
