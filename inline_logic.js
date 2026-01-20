// --- Core Logic Inlined (Emergency Fix) ---
window.isDataLoaded = false;

// Simplified Modal Opener (Inline)
window.openResourceModal = (category, series, docId) => {
    const modal = document.getElementById('resource-modal');
    const list = document.getElementById('resource-list-container');
    const title = document.getElementById('resource-modal-title');

    if (modal && list) {
        if (window.openModal) {
            window.openModal(modal);
        } else {
            modal.classList.add('show');
        }
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
                        const fileUrl = item.fileUrl || item.downloadUrl;
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
    const thumbUrl = post.coverUrl || '';

    const div = document.createElement('div');
    div.className = 'carousel-card' + (thumbUrl ? ' has-thumb' : '');

    if (thumbUrl) {
        div.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url("${thumbUrl}")`;
        div.style.backgroundSize = 'cover';
        div.style.backgroundPosition = 'center';
        div.style.color = 'white';
    }

    div.innerHTML = `
                <div class="carousel-card-content">
                    <div class="carousel-card-tag" style="${thumbUrl ? 'background: var(--secondary-color); color: white;' : ''}">${displayCategory}</div>
                    <div class="carousel-card-title">${post.title}</div>
                    <div class="carousel-card-meta">
                        <span style="${thumbUrl ? 'color: rgba(255,255,255,0.8);' : ''}">${date}</span>
                        <div class="carousel-icon-btn" style="${thumbUrl ? 'background: white; color: var(--primary-color);' : ''}"><i class="fas fa-arrow-right"></i></div>
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
        return;
    }

    try {
        // 한 번에 최근 100개를 가져와서 배분 (효율적 + 인덱스 문제 회피)
        const snapshot = await window.db.collection("posts").orderBy("createdAt", "desc").limit(100).get();
        if (snapshot.empty) return;

        window.isDataLoaded = true;
        const allPosts = [];
        snapshot.forEach(doc => allPosts.push({ id: doc.id, data: doc.data() }));

        // 1. New Arrivals (무조건 최근 12개)
        const newTrack = document.getElementById('carousel-new');
        const latestIds = new Set();
        if (newTrack) {
            newTrack.innerHTML = '';
            allPosts.slice(0, 12).forEach(item => {
                latestIds.add(item.id);
                newTrack.appendChild(window.createCarouselCard(item.data, item.id));
            });
        }

        // 2. Featured Topics (강해가 아닌 것들 우선, 청교도 관련 주제 위주)
        const topicTrack = document.getElementById('carousel-topic');
        if (topicTrack) {
            topicTrack.innerHTML = '';
            const topicItems = allPosts.filter(item => {
                const tags = item.data.tags || [];
                return !tags.includes('강해') && !tags.includes('강해설교') && !tags.includes('설교') && !latestIds.has(item.id);
            });

            let displayTopics = topicItems.length >= 6 ? topicItems : allPosts.filter(item => {
                const tags = item.data.tags || [];
                return !tags.includes('강해') && !tags.includes('강해설교') && !latestIds.has(item.id);
            });
            displayTopics = [...displayTopics].sort(() => 0.5 - Math.random());

            displayTopics.slice(0, 12).forEach(item => {
                topicTrack.appendChild(window.createCarouselCard(item.data, item.id));
            });
        }

        // 3. Expository Sermons (강해 태그가 있는 것들)
        const sermonTrack = document.getElementById('carousel-sermon');
        if (sermonTrack) {
            sermonTrack.innerHTML = '';
            const sermonItems = allPosts.filter(item => {
                const tags = item.data.tags || [];
                return tags.includes('강해') || tags.includes('강해설교') || tags.includes('설교');
            });

            const displaySermons = sermonItems.length >= 4 ? sermonItems : allPosts;

            displaySermons.slice(0, 12).forEach(item => {
                sermonTrack.appendChild(window.createCarouselCard(item.data, item.id));
            });
        }

    } catch (e) {
        console.error("Load Carousels Error:", e);
    }
};

// Auto-run if DB connected
if (window.db) {
    setTimeout(window.loadMainCarousels, 100);
}
