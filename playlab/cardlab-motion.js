(function () {
    'use strict';

    const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
    const MOTION_STORAGE_FUNCTION = 'cardlab-motion-storage';
    const PROTECTED_PLAYLAB_AUTH_COOKIE = 'hahalab_playlab_token';
    const DEFAULT_DESCRIPTION = '썸네일을 보고 카드 이름과 움직임을 함께 이야기해 보세요.';

    const state = {
        assets: [],
        categories: [],
        previewUrlMap: {},
        selectedCategories: new Set(),
        search: '',
        detailOpen: false,
        detailRevealText: false,
        detailAssetId: '',
        loading: true,
        error: ''
    };

    const elements = {};
    let supabaseClient = null;

    function getLocalMotionRows() {
        return Array.isArray(window.CARDLAB_MOTION_LOCAL_ASSETS)
            ? window.CARDLAB_MOTION_LOCAL_ASSETS
            : [];
    }

    function mergeMotionAssets(remoteAssets, localAssets) {
        const merged = new Map();
        []
            .concat(Array.isArray(remoteAssets) ? remoteAssets : [])
            .concat(Array.isArray(localAssets) ? localAssets : [])
            .forEach((asset) => {
                const id = String(asset?.id || '').trim();
                if (!id) return;
                merged.set(id, asset);
            });
        return Array.from(merged.values());
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizeToken(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/_/g, '-');
    }

    function getFileNameFromValue(value) {
        const text = String(value || '').trim();
        if (!text) return '';
        const readFileName = (pathname) => String(pathname || '').split('/').filter(Boolean).pop() || '';
        try {
            const parsed = new URL(text, window.location.origin);
            return decodeURIComponent(readFileName(parsed.pathname));
        } catch (_) {
            const clean = text.split('#')[0].split('?')[0];
            return decodeURIComponent(readFileName(clean));
        }
    }

    function uniqueStrings(values = []) {
        return Array.from(new Set(
            (Array.isArray(values) ? values : [])
                .map((value) => String(value || '').trim())
                .filter(Boolean)
        ));
    }

    function chunkArray(values = [], size = 40) {
        const safeSize = Math.max(1, Number(size) || 40);
        const chunks = [];
        for (let index = 0; index < values.length; index += safeSize) {
            chunks.push(values.slice(index, index + safeSize));
        }
        return chunks;
    }

    function resolveAssetUrl(value) {
        const text = String(value || '').trim();
        if (!text) return '';
        if (/^(https?:)?\/\//i.test(text) || /^file:/i.test(text) || /^data:/i.test(text) || /^blob:/i.test(text)) return text;
        if (text.startsWith('/')) return new URL(text, window.location.origin).href;
        return new URL(text, window.location.href).href;
    }

    function readCookieValue(name) {
        const target = String(name || '').trim();
        if (!target || typeof document === 'undefined') return '';
        return String(document.cookie || '')
            .split(';')
            .map((part) => part.trim())
            .filter(Boolean)
            .reduce((matched, part) => {
                if (matched) return matched;
                const index = part.indexOf('=');
                if (index < 0) return matched;
                const key = part.slice(0, index).trim();
                if (key !== target) return matched;
                try {
                    return decodeURIComponent(part.slice(index + 1).trim());
                } catch (_) {
                    return part.slice(index + 1).trim();
                }
            }, '');
    }

    function readSupabaseSessionTokenFromStorage() {
        if (typeof localStorage === 'undefined') return '';
        const projectRef = (() => {
            try {
                return new URL(SUPABASE_URL).hostname.split('.')[0] || '';
            } catch (_) {
                return '';
            }
        })();
        const candidateKeys = [
            `sb-${projectRef}-auth-token`,
            'supabase.auth.token'
        ].filter(Boolean);
        for (const key of candidateKeys) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) continue;
                const parsed = JSON.parse(raw);
                const accessToken = String(parsed?.access_token || parsed?.currentSession?.access_token || '').trim();
                if (accessToken) return accessToken;
            } catch (_) {
                // Ignore malformed or unavailable local storage entries.
            }
        }
        return '';
    }

    async function getMotionStorageAccessToken() {
        try {
            const { data } = await supabaseClient?.auth?.getSession?.() || {};
            const accessToken = String(data?.session?.access_token || '').trim();
            if (accessToken) return accessToken;
        } catch (_) {
            // Fall through to protected Playlab cookie and local storage.
        }
        const cookieToken = readCookieValue(PROTECTED_PLAYLAB_AUTH_COOKIE);
        if (cookieToken) return cookieToken;
        return readSupabaseSessionTokenFromStorage();
    }

    function buildMotionAssetLocalUrl(fileName) {
        const normalized = String(fileName || '').trim();
        if (!normalized) return '';
        return `images/motion/${encodeURIComponent(normalized)}`;
    }

    function getMotionAssetLocalUrl(asset, kind = 'motion') {
        const sourceValues = kind === 'thumbnail'
            ? [
                asset?.thumbnailUrl,
                asset?.thumbnail_url,
                asset?.thumbnailKey,
                asset?.thumbnail_key
            ]
            : [
                asset?.motionUrl,
                asset?.motion_url,
                asset?.motionKey,
                asset?.motion_key,
                asset?.motionName,
                asset?.motion_name
            ];

        for (const value of sourceValues) {
            const fileName = getFileNameFromValue(value);
            if (fileName) return buildMotionAssetLocalUrl(fileName);
        }
        return '';
    }

    function getMotionAssetExtension(value) {
        const text = String(value || '').trim().toLowerCase().split('?')[0].split('#')[0];
        const last = text.split('/').filter(Boolean).pop() || '';
        const index = last.lastIndexOf('.');
        if (index < 0) return '';
        return last.slice(index + 1);
    }

    function inferMotionAssetContentTypeValue(value, fallback = '') {
        const text = String(value || '').trim().toLowerCase();
        if (/^video\/mp\\d+$/i.test(text)) return 'video/mp4';
        if (text.startsWith('video/') || text.startsWith('image/')) return text;
        const extension = getMotionAssetExtension(text);
        if (['mp4', 'webm', 'mov', 'm4v'].includes(extension)) return 'video/mp4';
        if (['webp', 'png', 'jpg', 'jpeg', 'gif', 'avif', 'svg'].includes(extension)) return 'image/' + (extension === 'jpg' ? 'jpeg' : extension);
        return fallback;
    }

    function resolveMotionAssetMediaKind(asset) {
        const motionUrl = String(asset?.motionUrl || asset?.motion_url || '').trim();
        const motionKey = String(asset?.motionKey || asset?.motion_key || '').trim();
        const motionName = String(asset?.motionName || asset?.motion_name || '').trim();
        const contentType = inferMotionAssetContentTypeValue(asset?.motionContentType || asset?.motion_content_type || '', '');
        if (contentType.startsWith('video/')) return 'video';
        if (contentType.startsWith('image/')) return 'image';
        const extension = getMotionAssetExtension(motionUrl || motionName || motionKey);
        if (['mp4', 'webm', 'mov', 'm4v'].includes(extension)) return 'video';
        if (['webp', 'png', 'jpg', 'jpeg', 'gif', 'avif', 'svg'].includes(extension)) return 'image';
        return 'unknown';
    }

    function getMotionAssetPreviewInfo(asset) {
        const mediaKind = resolveMotionAssetMediaKind(asset);
        const motionKey = String(asset?.motionKey || asset?.motion_key || '').trim();
        const directMotionUrl = String(asset?.directMotionUrl || asset?.motion_url || '').trim();
        const previewMotionUrl = motionKey ? String(state.previewUrlMap[motionKey] || '').trim() : '';
        const fallbackMotionUrl = getMotionAssetLocalUrl(asset, 'motion');
        const storageProvider = String(asset?.storageProvider || asset?.storage_provider || '').trim().toLowerCase();
        const isLocalAsset = storageProvider === 'local' || Boolean(motionKey && !motionKey.includes('/'));
        const motionUrl = resolveAssetUrl(directMotionUrl || (isLocalAsset ? (fallbackMotionUrl || previewMotionUrl) : (previewMotionUrl || fallbackMotionUrl)));
        const directThumbnailUrl = String(asset?.directThumbnailUrl || asset?.thumbnail_url || '').trim();
        const thumbnailKey = String(asset?.thumbnailKey || asset?.thumbnail_key || '').trim() || (mediaKind === 'image' ? motionKey : '');
        const previewThumbnailUrl = thumbnailKey ? String(state.previewUrlMap[thumbnailKey] || '').trim() : '';
        const fallbackThumbnailUrl = getMotionAssetLocalUrl(asset, 'thumbnail');
        const thumbnailUrl = resolveAssetUrl(directThumbnailUrl || (isLocalAsset ? (fallbackThumbnailUrl || previewThumbnailUrl) : (previewThumbnailUrl || fallbackThumbnailUrl)) || (mediaKind === 'image' ? motionUrl : ''));
        return {
            mediaKind,
            motionUrl,
            motionKey,
            thumbnailUrl,
            thumbnailKey,
            directMotionUrl,
            directThumbnailUrl,
            previewMotionUrl,
            previewThumbnailUrl,
            fallbackMotionUrl,
            fallbackThumbnailUrl
        };
    }

    function shouldRenderThumbnailAsVideo(previewInfo) {
        if (!previewInfo || previewInfo.mediaKind !== 'video') return false;
        const thumbnailName = getFileNameFromValue(previewInfo.thumbnailUrl || previewInfo.thumbnailKey);
        const motionName = getFileNameFromValue(previewInfo.motionUrl || previewInfo.motionKey);
        if (!motionName) return false;
        return /^weather-(?:heat|snow|wind|rain|hail)\.webp$/i.test(thumbnailName)
            && /^weather-(?:heat|snow|wind|rain|hail)\.mp4$/i.test(motionName);
    }

    async function callMotionStorageFunction(payload = {}) {
        const accessToken = await getMotionStorageAccessToken();
        if (!accessToken) {
            throw new Error('MOTION_AUTH_REQUIRED');
        }
        const response = await fetch(`${SUPABASE_URL}/functions/v1/${MOTION_STORAGE_FUNCTION}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload || {})
        });
        let data = {};
        try {
            data = await response.json();
        } catch (_) {
            data = {};
        }
        if (!response.ok || data?.error) {
            throw new Error(String(data?.error || data?.message || `MOTION_STORAGE_${response.status}`));
        }
        return data || {};
    }

    async function fetchMotionPreviewUrlMap(assets = []) {
        const keys = uniqueStrings(
            (Array.isArray(assets) ? assets : []).flatMap((asset) => {
                const previewInfo = getMotionAssetPreviewInfo(asset);
                return [previewInfo.thumbnailKey, previewInfo.motionKey];
            })
        );
        if (!keys.length) return {};

        const nextMap = {};
        for (const keyChunk of chunkArray(keys, 40)) {
            const result = await callMotionStorageFunction({
                action: 'createDownloadUrls',
                keys: keyChunk
            });
            const items = Array.isArray(result?.items)
                ? result.items
                : Array.isArray(result?.data?.items)
                    ? result.data.items
                    : [];
            items.forEach((item) => {
                const key = String(item?.key || '').trim();
                const url = String(item?.downloadUrl || item?.url || '').trim();
                if (key && url) nextMap[key] = url;
            });
        }
        return nextMap;
    }

    function initElements() {
        elements.searchInput = document.getElementById('searchInput');
        elements.categoryChips = document.getElementById('categoryChips');
        elements.visibleMeta = document.getElementById('visibleMeta');
        elements.cardGrid = document.getElementById('cardGrid');
        elements.emptyState = document.getElementById('emptyState');
        elements.errorState = document.getElementById('errorState');
        elements.errorText = document.getElementById('errorText');
        elements.resetButton = document.getElementById('resetButton');
        elements.retryButton = document.getElementById('retryButton');
        elements.modal = document.getElementById('studyModal');
        elements.modalDialog = document.getElementById('studyModalDialog');
        elements.modalMedia = document.getElementById('studyModalMedia');
        elements.modalCopy = document.getElementById('studyModalCopy');
        elements.modalHint = document.getElementById('studyModalHint');
        elements.modalCopyInner = document.getElementById('studyModalCopyInner');
        elements.modalName = document.getElementById('studyModalName');
        elements.modalDesc = document.getElementById('studyModalDesc');
        elements.modalCounter = document.getElementById('studyModalCounter');
        elements.modalClose = document.getElementById('studyModalClose');
        elements.modalPrev = document.getElementById('studyModalPrev');
        elements.modalNext = document.getElementById('studyModalNext');
        elements.confirmModal = document.getElementById('confirmModal');
        elements.confirmModalOk = document.getElementById('confirmModalOk');
        elements.confirmModalCancel = document.getElementById('confirmModalCancel');
        elements.exitButtons = Array.from(document.querySelectorAll('[data-action="exit"]'));
    }

    function goToPreviousLearning() {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }
        if (document.referrer) {
            window.location.href = document.referrer;
            return;
        }
        window.location.href = '../admin.html';
    }

    function openConfirmModal() {
        if (!elements.confirmModal) return;
        elements.confirmModal.classList.add('is-active');
        elements.confirmModal.setAttribute('aria-hidden', 'false');
    }

    function closeConfirmModal() {
        if (!elements.confirmModal) return;
        elements.confirmModal.classList.remove('is-active');
        elements.confirmModal.setAttribute('aria-hidden', 'true');
    }

    async function enterFullscreen() {
        return false;
    }

    function getMotionAssetTitle(asset) {
        return String(asset?.titleKo || asset?.title_ko || asset?.titleEn || asset?.title_en || '모션 카드').trim() || '모션 카드';
    }

    function getMotionAssetDescription(asset) {
        return String(asset?.descriptionKo || asset?.description_ko || DEFAULT_DESCRIPTION).trim() || DEFAULT_DESCRIPTION;
    }

    function parseTags(value) {
        if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
        if (typeof value === 'string') {
            const text = value.trim();
            if (!text) return [];
            try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) return parsed.map((item) => String(item || '').trim()).filter(Boolean);
            } catch (_error) {
                // ignore
            }
            return text.split(/[,#]/).map((item) => String(item || '').trim()).filter(Boolean);
        }
        return [];
    }

    function normalizeMotionAsset(row, categoryMap) {
        const categoryId = String(row.category_id || row.categoryId || row.category || '').trim();
        const categoryLabel = String(categoryMap.get(categoryId) || row.category_ko || row.categoryKo || categoryId || '기타').trim() || '기타';
        const tags = parseTags(row.tags);
        const directMotionUrl = String(row.motion_url || row.motionUrl || '').trim();
        const directThumbnailUrl = String(row.thumbnail_url || row.thumbnailUrl || '').trim();
        const motionMediaKind = resolveMotionAssetMediaKind({
            motionUrl: directMotionUrl,
            motionKey: row.motion_key || row.motionKey,
            motionContentType: row.motion_content_type || row.motionContentType
        });
        return {
            id: String(row.id || '').trim(),
            categoryId,
            categoryLabel,
            titleKo: getMotionAssetTitle(row),
            titleEn: String(row.title_en || row.titleEn || '').trim(),
            descriptionKo: getMotionAssetDescription(row),
            tags,
            thumbnailKey: String(row.thumbnail_key || row.thumbnailKey || '').trim(),
            thumbnailUrl: resolveAssetUrl(directThumbnailUrl || getMotionAssetLocalUrl(row, 'thumbnail') || (motionMediaKind === 'image' ? directMotionUrl : '')),
            motionKey: String(row.motion_key || row.motionKey || '').trim(),
            motionUrl: resolveAssetUrl(directMotionUrl || getMotionAssetLocalUrl(row, 'motion')),
            storageProvider: String(row.storage_provider || row.storageProvider || '').trim(),
            thumbnailContentType: String(row.thumbnail_content_type || row.thumbnailContentType || '').trim(),
            motionContentType: String(row.motion_content_type || row.motionContentType || '').trim(),
            thumbnailSizeBytes: Number(row.thumbnail_size_bytes || row.thumbnailSizeBytes || 0) || 0,
            motionSizeBytes: Number(row.motion_size_bytes || row.motionSizeBytes || 0) || 0,
            sortOrder: Number(row.sort_order || row.sortOrder || 999) || 999,
            isActive: row.is_active !== false,
            directMotionUrl,
            directThumbnailUrl,
            previewMediaKind: motionMediaKind
        };
    }

    function getVisibleAssets() {
        const search = normalizeToken(state.search);
        return state.assets.filter((asset) => {
            const categoryId = normalizeToken(asset.categoryId || asset.category_id || '');
            if (state.selectedCategories.size > 0 && !state.selectedCategories.has(categoryId)) return false;
            const searchText = normalizeToken([
                asset.titleKo,
                asset.descriptionKo,
                asset.categoryLabel,
                ...(Array.isArray(asset.tags) ? asset.tags : [])
            ].join(' '));
            if (search && !searchText.includes(search)) return false;
            return true;
        }).sort((a, b) => {
            const categoryCompare = String(a.categoryLabel || '').localeCompare(String(b.categoryLabel || ''), 'ko');
            if (categoryCompare !== 0) return categoryCompare;
            return String(a.titleKo || '').localeCompare(String(b.titleKo || ''), 'ko');
        });
    }

    function getCategoryOptions() {
        const counts = state.assets.reduce((map, asset) => {
            const categoryId = normalizeToken(asset.categoryId || '');
            if (!categoryId) return map;
            map.set(categoryId, (map.get(categoryId) || 0) + 1);
            return map;
        }, new Map());
        const categories = state.categories.length
            ? state.categories.map((category) => ({
                id: normalizeToken(category.id),
                label: String(category.titleKo || category.title_ko || category.label || category.id || '').trim() || '기타',
                count: counts.get(normalizeToken(category.id)) || 0
            }))
            : Array.from(counts.entries()).map(([id, count]) => ({ id, label: id, count }));
        return categories.sort((a, b) => String(a.label || '').localeCompare(String(b.label || ''), 'ko'));
    }

    function renderSummary() {
        if (elements.visibleMeta) {
            elements.visibleMeta.textContent = '';
            elements.visibleMeta.hidden = true;
        }
    }

    function renderCategoryChips() {
        const categories = getCategoryOptions();
        const activeAll = state.selectedCategories.size === 0;
        const chipsHtml = [
            `<button type="button" class="chip ${activeAll ? 'is-active' : ''}" data-category="all">전체 <span class="chip-count">${state.assets.length}</span></button>`
        ].concat(categories.map((category) => {
            const active = state.selectedCategories.has(category.id);
            return `<button type="button" class="chip ${active ? 'is-active' : ''}" data-category="${escapeHtml(category.id)}">${escapeHtml(category.label)} <span class="chip-count">${category.count}</span></button>`;
        })).join('');
        elements.categoryChips.innerHTML = chipsHtml;
        Array.from(elements.categoryChips.querySelectorAll('[data-category]')).forEach((button) => {
            button.addEventListener('click', () => {
                const categoryId = String(button.getAttribute('data-category') || '').trim();
                if (categoryId === 'all') {
                    state.selectedCategories.clear();
                } else if (state.selectedCategories.has(categoryId)) {
                    state.selectedCategories.delete(categoryId);
                } else {
                    state.selectedCategories.add(categoryId);
                }
                render();
            });
        });
    }

    function renderMediaHtml(asset, mediaType, cardMode) {
        const previewInfo = getMotionAssetPreviewInfo(asset);
        const title = getMotionAssetTitle(asset);
        const motionKind = previewInfo.mediaKind;
        const motionUrl = previewInfo.motionUrl;
        const thumbnailUrl = previewInfo.thumbnailUrl;
        const renderThumbnailVideo = mediaType === 'thumbnail' && shouldRenderThumbnailAsVideo(previewInfo);
        const sourceUrl = renderThumbnailVideo
            ? motionUrl
            : mediaType === 'thumbnail'
            ? (thumbnailUrl || (motionKind === 'image' ? motionUrl : ''))
            : (motionUrl || thumbnailUrl);
        const fallbackUrl = mediaType === 'thumbnail'
            ? (previewInfo.fallbackThumbnailUrl || (motionKind === 'image' ? previewInfo.fallbackMotionUrl : ''))
            : (previewInfo.fallbackMotionUrl || previewInfo.fallbackThumbnailUrl);
        const resolvedFallbackUrl = fallbackUrl ? resolveAssetUrl(fallbackUrl) : '';
        const fallbackAttribute = resolvedFallbackUrl && resolvedFallbackUrl !== sourceUrl
            ? ` data-fallback-src="${escapeHtml(resolvedFallbackUrl)}" onerror="if(this.dataset.fallbackSrc&&this.src!==this.dataset.fallbackSrc){this.src=this.dataset.fallbackSrc;this.onerror=null;}"`
            : '';

        if (!sourceUrl) {
            return `<div class="pair-panel-empty">${mediaType === 'thumbnail' ? '썸네일 없음' : '모션 없음'}</div>`;
        }

        if ((mediaType === 'motion' || renderThumbnailVideo) && motionKind === 'video') {
            const videoAttributes = cardMode
                ? 'autoplay muted loop playsinline preload="metadata"'
                : 'controls autoplay playsinline preload="metadata"';
            return `<video ${videoAttributes} ${thumbnailUrl && !renderThumbnailVideo ? `poster="${escapeHtml(thumbnailUrl)}"` : ''} src="${escapeHtml(sourceUrl)}"${fallbackAttribute}></video>`;
        }

        return `<img src="${escapeHtml(sourceUrl)}" alt="${escapeHtml(title)}"${fallbackAttribute}>`;
    }

    function renderCard(asset, index) {
        const title = escapeHtml(getMotionAssetTitle(asset));
        const description = escapeHtml(getMotionAssetDescription(asset));
        const tags = Array.isArray(asset.tags) ? asset.tags.filter(Boolean).slice(0, 3) : [];
        const previewInfo = getMotionAssetPreviewInfo(asset);
        const mediaKind = previewInfo.mediaKind;
        const cardMediaHtml = renderMediaHtml(asset, 'thumbnail', true);

        return `
            <button type="button" class="study-card" data-asset-index="${index}" aria-label="${title} 상세 보기">
                <div class="study-card-inner">
                    <div class="study-card-media">
                        ${cardMediaHtml}
                        <div class="study-card-type-badge">썸네일</div>
                        <div class="motion-card-status">${mediaKind === 'video' ? '영상' : '이미지'}</div>
                    </div>
                    <div class="study-card-body">
                        <div class="study-card-name">${title}</div>
                        <div class="motion-card-meta">
                            <span>${escapeHtml(asset.categoryLabel || '기타')}</span>
                            <span>${mediaKind === 'video' ? '영상 카드' : mediaKind === 'image' ? '이미지 카드' : '모션 카드'}</span>
                        </div>
                        <div class="study-card-desc">${description}</div>
                        <div class="motion-card-tags">
                            ${tags.length > 0 ? tags.map((tag) => `<span class="motion-card-tag">#${escapeHtml(String(tag).replace(/^#+/, ''))}</span>`).join('') : '<span class="motion-card-tag is-muted">모션 카드</span>'}
                        </div>
                    </div>
                </div>
            </button>
        `;
    }

    function renderCards() {
        const visible = getVisibleAssets();
        elements.cardGrid.innerHTML = visible.map(renderCard).join('');
        const showEmpty = visible.length === 0;
        elements.emptyState.classList.toggle('is-hidden', !showEmpty);
        elements.cardGrid.style.display = showEmpty ? 'none' : 'grid';
    }

    function getVisibleAssetIndex(assetId) {
        const visible = getVisibleAssets();
        return visible.findIndex((item) => String(item.id || '').trim() === String(assetId || '').trim());
    }

    function openDetailModal(index = 0, preferredType = null) {
        const items = getVisibleAssets();
        if (!items.length) return;
        const normalizedIndex = Math.max(0, Math.min(items.length - 1, Number(index) || 0));
        const asset = items[normalizedIndex];
        if (!asset) return;
        state.detailOpen = true;
        state.detailRevealText = false;
        state.detailAssetId = String(asset.id || '').trim();
        render();
    }

    function closeDetailModal() {
        state.detailOpen = false;
        state.detailRevealText = false;
        state.detailAssetId = '';
        render();
    }

    function moveDetailModal(delta = 1) {
        const items = getVisibleAssets();
        if (!items.length) return;
        const currentIndex = Math.max(0, getVisibleAssetIndex(state.detailAssetId));
        const nextIndex = (currentIndex + Number(delta || 0) + items.length) % items.length;
        state.detailAssetId = String(items[nextIndex]?.id || '').trim();
        state.detailOpen = true;
        state.detailRevealText = false;
        render();
    }

    function flashNavButton(button) {
        if (!button) return;
        button.classList.remove('is-flashing');
        void button.offsetWidth;
        button.classList.add('is-flashing');
        window.setTimeout(() => {
            button.classList.remove('is-flashing');
        }, 180);
    }

    function stopModalVideos() {
        elements.modalMedia?.querySelectorAll('video').forEach((video) => {
            try {
                video.pause();
            } catch (_) {
                // Ignore browser-specific media pause failures.
            }
        });
    }

    function activateModalVideoSound() {
        const video = elements.modalMedia?.querySelector('video');
        if (!video) return;
        video.muted = false;
        video.defaultMuted = false;
        video.volume = 1;
        video.removeAttribute('muted');
        video.setAttribute('controls', '');
        const playPromise = typeof video.play === 'function' ? video.play() : null;
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
        }
    }

    function renderModal() {
        if (!elements.modal) return;
        const items = getVisibleAssets();
        if (!state.detailOpen || !items.length) {
            stopModalVideos();
            elements.modal.classList.remove('is-open');
            elements.modal.setAttribute('aria-hidden', 'true');
            elements.modalMedia.innerHTML = '';
            elements.modalMedia.removeAttribute('data-motion-asset-id');
            if (elements.modalCopy) elements.modalCopy.classList.remove('is-revealed');
            if (elements.modalHint) elements.modalHint.textContent = '내용보기';
            return;
        }

        let index = getVisibleAssetIndex(state.detailAssetId);
        if (index < 0) {
            index = 0;
            state.detailAssetId = String(items[0]?.id || '').trim();
        }
        const asset = items[index];
        const previewInfo = getMotionAssetPreviewInfo(asset);
        const title = getMotionAssetTitle(asset);
        const description = getMotionAssetDescription(asset);
        const tags = Array.isArray(asset.tags) ? asset.tags.filter(Boolean).slice(0, 8) : [];
        const motionAssetId = String(asset.id || '').trim();
        let modalMediaChanged = false;
        if (elements.modalMedia.getAttribute('data-motion-asset-id') !== motionAssetId) {
            stopModalVideos();
            elements.modalMedia.innerHTML = renderMediaHtml(asset, 'motion', false);
            elements.modalMedia.setAttribute('data-motion-asset-id', motionAssetId);
            modalMediaChanged = true;
        }

        if (elements.modalCopy) {
            elements.modalCopy.classList.toggle('is-revealed', Boolean(state.detailRevealText));
            elements.modalCopy.setAttribute('aria-expanded', state.detailRevealText ? 'true' : 'false');
        }
        if (elements.modalHint) {
            elements.modalHint.textContent = state.detailRevealText ? '' : '내용보기';
        }
        elements.modalName.textContent = title;
        elements.modalDesc.textContent = description;
        elements.modalCounter.textContent = `${index + 1} / ${items.length}`;
        if (elements.modalCopyInner) {
            elements.modalCopyInner.innerHTML = `
                <div class="study-modal-name" id="studyModalName">${escapeHtml(title)}</div>
                <div class="study-modal-desc" id="studyModalDesc">${escapeHtml(description)}</div>
            `;
        }

        if (tags.length > 0) {
            const tagHtml = tags.map((tag) => `<span class="motion-card-tag">#${escapeHtml(String(tag).replace(/^#+/, ''))}</span>`).join('');
            const tagsContainer = elements.modalCopyInner?.querySelector('.motion-detail-tags') || null;
            if (tagsContainer) {
                tagsContainer.innerHTML = tagHtml;
            } else if (elements.modalCopyInner) {
                const wrapper = document.createElement('div');
                wrapper.className = 'motion-detail-tags';
                wrapper.innerHTML = tagHtml;
                elements.modalCopyInner.appendChild(wrapper);
            }
        }

        elements.modal.classList.add('is-open');
        elements.modal.setAttribute('aria-hidden', 'false');
        if (modalMediaChanged) {
            activateModalVideoSound();
        }
    }

    function renderError(message) {
        state.error = message || '카드를 불러오지 못했어요.';
        state.detailOpen = false;
        state.detailRevealText = false;
        state.detailAssetId = '';
        if (elements.errorText) {
            elements.errorText.textContent = message || '잠시 후 다시 시도해 주세요.';
        }
        elements.errorState.classList.remove('is-hidden');
        elements.cardGrid.style.display = 'none';
        elements.emptyState.classList.add('is-hidden');
        if (elements.visibleMeta) {
            elements.visibleMeta.textContent = '';
        }
        renderModal();
    }

    function renderLoading() {
        state.detailOpen = false;
        state.detailRevealText = false;
        state.detailAssetId = '';
        if (elements.visibleMeta) {
            elements.visibleMeta.textContent = '';
        }
        elements.cardGrid.innerHTML = '';
        elements.cardGrid.style.display = 'grid';
        renderModal();
    }

    function render() {
        elements.errorState.classList.add('is-hidden');
        elements.emptyState.classList.add('is-hidden');
        renderSummary();
        renderCategoryChips();
        renderCards();
        renderModal();
        elements.resetButton.disabled = state.selectedCategories.size === 0 && !state.search;
    }

    function bindEvents() {
        elements.exitButtons.forEach((button) => {
            button.addEventListener('click', openConfirmModal);
        });
        elements.confirmModalOk?.addEventListener('click', () => {
            closeConfirmModal();
            goToPreviousLearning();
        });
        elements.confirmModalCancel?.addEventListener('click', closeConfirmModal);
        elements.confirmModal?.addEventListener('click', (event) => {
            if (event.target && event.target.hasAttribute('data-modal-close')) {
                closeConfirmModal();
            }
        });
        elements.cardGrid.addEventListener('click', (event) => {
            const button = event.target.closest('[data-asset-index]');
            if (!button) return;
            const index = Number(button.getAttribute('data-asset-index'));
            if (!Number.isFinite(index)) return;
            openDetailModal(index);
        });
        elements.searchInput.addEventListener('input', () => {
            state.search = elements.searchInput.value.trim();
            render();
        });
        elements.resetButton.addEventListener('click', () => {
            state.selectedCategories.clear();
            state.search = '';
            elements.searchInput.value = '';
            render();
        });
        elements.retryButton.addEventListener('click', loadCards);
        elements.searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                elements.searchInput.value = '';
                state.search = '';
                render();
            }
        });
        elements.modalClose?.addEventListener('click', closeDetailModal);
        elements.modalPrev?.addEventListener('click', () => {
            flashNavButton(elements.modalPrev);
            moveDetailModal(-1);
        });
        elements.modalNext?.addEventListener('click', () => {
            flashNavButton(elements.modalNext);
            moveDetailModal(1);
        });
        elements.modalCopy?.addEventListener('click', () => {
            if (!state.detailOpen) return;
            state.detailRevealText = true;
            renderModal();
        });
        elements.modalDialog?.addEventListener('click', (event) => {
            if (!state.detailOpen) return;
            if (event.target.closest('button, a, input, textarea, select, label')) return;
            const rect = elements.modalDialog.getBoundingClientRect();
            const edgeWidth = Math.max(56, rect.width * 0.12);
            if (event.clientX <= rect.left + edgeWidth) {
                flashNavButton(elements.modalPrev);
                moveDetailModal(-1);
            } else if (event.clientX >= rect.right - edgeWidth) {
                flashNavButton(elements.modalNext);
                moveDetailModal(1);
            }
        });
        elements.modal?.addEventListener('click', (event) => {
            if (event.target === elements.modal || event.target?.dataset?.modalClose === 'true') {
                closeDetailModal();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (elements.confirmModal?.classList.contains('is-active')) {
                if (event.key === 'Escape') closeConfirmModal();
                return;
            }
            if (!state.detailOpen) return;
            if (event.key === 'Escape') {
                closeDetailModal();
            } else if (event.key === 'ArrowLeft') {
                flashNavButton(elements.modalPrev);
                moveDetailModal(-1);
            } else if (event.key === 'ArrowRight') {
                flashNavButton(elements.modalNext);
                moveDetailModal(1);
            }
        });
    }

    async function loadCards() {
        state.loading = true;
        state.previewUrlMap = {};
        renderLoading();
        elements.errorState.classList.add('is-hidden');

        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            state.categories = [
                { id: 'action', title_ko: '행동', sort_order: 1, is_active: true },
                { id: 'emotion', title_ko: '감정', sort_order: 2, is_active: true }
            ];
            const fallbackCategoryMap = new Map(state.categories.map((row) => [row.id, row.title_ko]));
            state.assets = getLocalMotionRows()
                .map((row) => normalizeMotionAsset(row, fallbackCategoryMap))
                .filter((asset) => asset.id && asset.titleKo);
            state.loading = false;
            state.error = '';
            if (state.assets.length) {
                render();
                return;
            }
            renderError('Supabase 스크립트를 불러오지 못했어요.');
            return;
        }

        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        supabaseClient = client;

        try {
            const [assetResult, categoryResult] = await Promise.all([
                client
                    .from('cardlab_motion_assets')
                    .select('id,category_id,title_ko,title_en,description_ko,tags,thumbnail_key,thumbnail_url,motion_key,motion_url,storage_provider,thumbnail_content_type,motion_content_type,thumbnail_size_bytes,motion_size_bytes,sort_order,is_active')
                    .eq('is_active', true)
                    .order('sort_order', { ascending: true })
                    .order('title_ko', { ascending: true }),
                client
                    .from('cardlab_motion_categories')
                    .select('id,title_ko,sort_order,is_active,notes')
                    .eq('is_active', true)
                    .order('sort_order', { ascending: true })
            ]);

            if (assetResult.error) throw assetResult.error;
            if (categoryResult.error) throw categoryResult.error;

            const categoryMap = new Map((categoryResult.data || []).map((row) => [String(row.id || '').trim(), String(row.title_ko || row.titleKo || row.id || '').trim() || String(row.id || '').trim()]));
            state.categories = categoryResult.data || [];
            const remoteAssets = (assetResult.data || [])
                .map((row) => normalizeMotionAsset(row, categoryMap))
                .filter((asset) => asset.id && asset.titleKo);
            const localAssets = getLocalMotionRows()
                .map((row) => normalizeMotionAsset(row, categoryMap))
                .filter((asset) => asset.id && asset.titleKo);
            state.assets = mergeMotionAssets(remoteAssets, localAssets);

            if (!state.categories.length) {
                const derived = new Map();
                state.assets.forEach((asset) => {
                    const id = normalizeToken(asset.categoryId || '');
                    if (!id) return;
                    if (!derived.has(id)) {
                        derived.set(id, { id, title_ko: asset.categoryLabel || id, sort_order: 999, is_active: true });
                    }
                });
                state.categories = Array.from(derived.values()).sort((a, b) => String(a.title_ko || '').localeCompare(String(b.title_ko || ''), 'ko'));
            }

            state.loading = false;
            state.error = '';
            render();

            fetchMotionPreviewUrlMap(state.assets)
                .then((previewMap) => {
                    state.previewUrlMap = previewMap || {};
                    render();
                })
                .catch((previewError) => {
                    if (!/MOTION_AUTH_REQUIRED/i.test(String(previewError && previewError.message || previewError || ''))) {
                        console.warn('[CardLabMotion] preview url load failed:', previewError);
                    }
                    state.previewUrlMap = {};
                });
        } catch (error) {
            console.error('[CardLabMotion] load failed:', error);
            renderError(error?.message || '모션 카드를 불러오지 못했어요.');
        } finally {
            state.loading = false;
        }
    }

    function init() {
        initElements();
        bindEvents();
        void enterFullscreen();
        document.addEventListener('pointerdown', enterFullscreen, { once: true, passive: true });
        loadCards();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
