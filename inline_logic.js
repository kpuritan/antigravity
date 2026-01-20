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

    const latestIds = new Set();
    window.isDataLoaded = true;

    // 1. New Arrivals
    const newTrack = document.getElementById('carousel-new');
    if (newTrack) {
        try {
            const snapshot = await window.db.collection("posts").orderBy("createdAt", "desc").limit(15).get();
            if (!snapshot.empty) {
                newTrack.innerHTML = '';
                snapshot.forEach(doc => {
                    latestIds.add(doc.id);
                    newTrack.appendChild(window.createCarouselCard(doc.data(), doc.id));
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    // 2. Featured Topics (Randomly pick 15 from latest 40 '청교도 신학' posts, excluding new arrivals)
    const topicTrack = document.getElementById('carousel-topic');
    if (topicTrack) {
        try {
            const snapshot = await window.db.collection("posts")
                .where("tags", "array-contains", "청교도 신학")
                .orderBy("createdAt", "desc")
                .limit(40).get();

            if (!snapshot.empty) {
                topicTrack.innerHTML = '';
                const items = [];
                snapshot.forEach(doc => {
                    if (!latestIds.has(doc.id)) {
                        items.push({ data: doc.data(), id: doc.id });
                    }
                });

                // Shuffle and pick 15
                const shuffled = items.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 15);

                selected.forEach(item => {
                    topicTrack.appendChild(window.createCarouselCard(item.data, item.id));
                });
            }
        } catch (e) { console.error(e); }
    }

    // 3. Expository Sermons (Latest 20 '강해설교' posts)
    const sermonTrack = document.getElementById('carousel-sermon');
    if (sermonTrack) {
        try {
            const snapshot = await window.db.collection("posts")
                .where("tags", "array-contains", "강해설교")
                .orderBy("createdAt", "desc")
                .limit(20).get();
            if (!snapshot.empty) {
                sermonTrack.innerHTML = '';
                snapshot.forEach(doc => {
                    sermonTrack.appendChild(window.createCarouselCard(doc.data(), doc.id));
                });
            } else {
                // Fallback: If no '강해설교' tag found, try '설교' tag
                const fallbackSnap = await window.db.collection("posts")
                    .where("tags", "array-contains", "설교")
                    .orderBy("createdAt", "desc")
                    .limit(20).get();

                if (!fallbackSnap.empty) {
                    sermonTrack.innerHTML = '';
                    fallbackSnap.forEach(doc => {
                        sermonTrack.appendChild(window.createCarouselCard(doc.data(), doc.id));
                    });
                }
            }
        } catch (e) { console.error(e); }
    }
};

// Auto-run if DB connected
if (window.db) {
    setTimeout(window.loadMainCarousels, 100);
}
