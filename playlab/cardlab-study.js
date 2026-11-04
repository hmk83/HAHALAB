(function () {
    'use strict';

    const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
    const DEFAULT_DESCRIPTION = '그림을 보고 카드 이름과 특징을 함께 이야기해 보세요.';
    const IMAGE_BASE_URL = '';
    const CARD_SOUND_MANIFEST_URL = '../sound/card/manifest.json';
    const KNOWN_MISSING_IMAGE_PATHS = new Set([
        'images/category/animal-crocodile-photo.webp',
        'images/category/animal-mouse-illust.webp',
        'images/category/animal-mouse-photo.webp',
        'images/category/clothing-shirt-illust.webp',
        'images/category/electronics-lamp-photo.webp',
        'images/category/food-malatang-illust.webp',
        'images/category/food-malatang-photo.webp',
        'images/category/food-tanghuru-illust.webp',
        'images/category/food-tanghuru-photo.webp',
        'images/category/food-yoajung-illust.webp',
        'images/category/food-yoajung-photo.webp',
        'images/category/house-fence-illust.webp',
        'images/category/play-squishy-illust.webp',
        'images/category/play-squishy-photo.webp'
    ]);

    const state = {
        rawAssets: [],
        groups: [],
        selectedCategories: new Set(),
        search: '',
        viewMode: 'photo',
        detailOpen: false,
        detailRevealText: false,
        detailGroupId: '',
        detailAssetType: 'photo',
        loading: true,
        error: ''
    };

    const elements = {};
    const audioState = {
        token: 0,
        current: null,
        resolveCurrent: null
    };
    const cardSoundLookup = new Map();
    let cardSoundManifestLoaded = false;
    let cardSoundManifestPromise = null;

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

    function normalizeSoundLookupText(value) {
        return String(value || '')
            .normalize('NFC')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '');
    }

    function normalizeAssetType(value) {
        const normalized = normalizeToken(value);
        if (normalized === 'photo' || normalized === '실사' || normalized === '사진') return 'photo';
        if (normalized === 'illust' || normalized === 'illustration' || normalized === '일러스트') return 'illust';
        return normalized || 'unknown';
    }

    function normalizeSoundPath(value) {
        const text = String(value || '').trim();
        if (!text) return '';
        if (/^(https?:|data:|blob:|file:)/i.test(text)) return text;
        if (text.startsWith('../') || text.startsWith('./') || text.startsWith('/')) return text;
        if (text.startsWith('sound/card/')) return `../${text}`;
        return text;
    }

    function resolveSoundUrl(value) {
        const normalized = normalizeSoundPath(value);
        if (!normalized) return '';
        if (/^(https?:|data:|blob:|file:)/i.test(normalized)) return normalized;
        try {
            return new URL(normalized, window.location.href).href;
        } catch (_error) {
            return normalized;
        }
    }

    function loadEmbeddedCardSoundManifest() {
        const embedded = window.CARDLAB_SOUND_MANIFEST;
        const items = Array.isArray(embedded)
            ? embedded
            : Array.isArray(embedded && embedded.items)
                ? embedded.items
                : Array.isArray(embedded && embedded.assets)
                    ? embedded.assets
                    : [];
        if (!items.length) return false;
        items.forEach((item) => {
            const filePath = String(item.filePath || item.file_path || '').trim();
            const key = normalizeSoundLookupText(item.normalizedText || item.text || '');
            if (!filePath || !key) return;
            cardSoundLookup.set(key, normalizeSoundPath(filePath));
        });
        cardSoundManifestLoaded = true;
        return true;
    }

    async function loadCardSoundManifest() {
        if (cardSoundManifestLoaded) return;
        if (cardSoundManifestPromise) return cardSoundManifestPromise;
        if (loadEmbeddedCardSoundManifest()) return;
        cardSoundManifestPromise = (async () => {
            try {
                const manifestUrl = new URL(CARD_SOUND_MANIFEST_URL, window.location.href).href;
                const response = await fetch(manifestUrl, { cache: 'no-store' });
                if (!response.ok) return;
                const manifest = await response.json();
                const items = Array.isArray(manifest && manifest.items)
                    ? manifest.items
                    : Array.isArray(manifest && manifest.assets)
                        ? manifest.assets
                        : [];
                items.forEach((item) => {
                    const filePath = String(item.filePath || item.file_path || '').trim();
                    const key = normalizeSoundLookupText(item.normalizedText || item.text || '');
                    if (!filePath || !key) return;
                    cardSoundLookup.set(key, normalizeSoundPath(filePath));
                });
            } catch (_error) {
                // The card rows still carry direct sound paths, so this is only a fallback.
            } finally {
                cardSoundManifestLoaded = true;
                cardSoundManifestPromise = null;
            }
        })();
        return cardSoundManifestPromise;
    }

    function getCardSoundPathForText(text) {
        const key = normalizeSoundLookupText(text);
        return key ? (cardSoundLookup.get(key) || '') : '';
    }

    function buildImageUrl(asset) {
        const direct = String(asset.imageUrl || asset.url || '').trim();
        const filePath = String(asset.filePath || '').trim();
        const fileName = String(asset.fileName || '').trim();
        const category = String(asset.category || '').trim();
        const candidates = [];
        const push = (value) => {
            const next = String(value || '').trim();
            if (!next || candidates.includes(next)) return;
            candidates.push(next);
        };

        if (direct) push(direct);

        if (filePath) {
            if (/^https?:\/\//i.test(filePath)) {
                push(filePath);
            } else if (IMAGE_BASE_URL) {
                push(`${IMAGE_BASE_URL}${filePath.replace(/^\/+/, '')}`);
            } else {
                push(filePath.replace(/^\/+/, ''));
            }
        }

        if (fileName) {
            if (IMAGE_BASE_URL) {
                if (category) push(`${IMAGE_BASE_URL}images/${category}/${fileName}`);
                push(`${IMAGE_BASE_URL}images/${fileName}`);
            } else {
                if (category) push(`images/${category}/${fileName}`);
                push(`images/${fileName}`);
            }
        }

        return candidates[0] || '';
    }

    function isKnownMissingImagePath(value) {
        const normalized = String(value || '')
            .trim()
            .replace(/^https?:\/\/[^/]+\/playlab\//i, '')
            .replace(/^\/?playlab\//i, '')
            .replace(/^\/+/, '');
        return KNOWN_MISSING_IMAGE_PATHS.has(normalized);
    }

    function normalizeAsset(row) {
        const assetType = normalizeAssetType(row.asset_type || row.assetType || row.asset_type_ko || row.assetTypeKo);
        const imageUrl = buildImageUrl({
            imageUrl: row.image_url || row.imageUrl,
            filePath: row.file_path || row.filePath,
            fileName: row.file_name || row.fileName,
            category: row.category
        });
        return {
            id: String(row.id || '').trim(),
            category: String(row.category || '').trim(),
            categoryKo: String(row.category_ko || row.categoryKo || '').trim(),
            assetType,
            assetTypeLabel: String(row.asset_type_ko || row.assetTypeKo || '').trim() || (assetType === 'photo' ? '실사' : assetType === 'illust' ? '일러스트' : '카드'),
            nameKo: String(row.name_ko || row.nameKo || row.name_ko_auto || row.nameKoAuto || '').trim(),
            nameEn: String(row.name_en || row.nameEn || '').trim(),
            descriptionKo: String(row.description_ko || row.descriptionKo || '').trim() || DEFAULT_DESCRIPTION,
            nameSoundPath: normalizeSoundPath(row.name_sound_path || row.nameSoundPath || row.name_sound_url || row.nameSoundUrl || ''),
            descriptionSoundPath: normalizeSoundPath(row.description_sound_path || row.descriptionSoundPath || row.description_sound_url || row.descriptionSoundUrl || ''),
            fileName: String(row.file_name || row.fileName || '').trim(),
            filePath: String(row.file_path || row.filePath || '').trim(),
            imageUrl: isKnownMissingImagePath(imageUrl || row.file_path || row.filePath || row.file_name || row.fileName) ? '' : imageUrl
        };
    }

    function isMeaningfulText(value) {
        const text = String(value || '').trim();
        return Boolean(text && text !== DEFAULT_DESCRIPTION);
    }

    function isPeopleCategory(asset) {
        const raw = normalizeToken(`${asset.category || ''} ${asset.categoryKo || ''} ${asset.nameKo || ''}`);
        return raw.includes('사람') || raw.includes('person') || raw.includes('human');
    }

    function getDisplayCategory(asset) {
        return String(asset.categoryKo || asset.category || '기타').trim() || '기타';
    }

    function getDisplayName(asset) {
        return String(asset.nameKo || asset.nameEn || '').trim() || '이름 없음';
    }

    function formatDescriptionText(value) {
        return String(value || DEFAULT_DESCRIPTION)
            .trim()
            .replace(/\.\s*/g, '.\n')
            .replace(/\n+$/g, '');
    }

    function stopStudyAudio() {
        audioState.token += 1;
        const activeResolve = audioState.resolveCurrent;
        const active = audioState.current;
        audioState.current = null;
        audioState.resolveCurrent = null;
        if (!active) return;
        try {
            active.pause();
            active.currentTime = 0;
            active.src = '';
        } catch (_error) {
            // ignore audio stop failures
        }
        if (typeof activeResolve === 'function') {
            activeResolve(false);
        }
    }

    function playStudyAudioUrl(url, token) {
        const resolvedUrl = resolveSoundUrl(url);
        if (!resolvedUrl) return Promise.resolve(false);

        return new Promise((resolve) => {
            const audio = new Audio(resolvedUrl);
            audio.preload = 'auto';
            audioState.current = audio;
            let settled = false;

            const finish = (success) => {
                if (settled) return;
                settled = true;
                if (token !== audioState.token) {
                    resolve(false);
                    return;
                }
                if (audioState.current === audio) {
                    audioState.current = null;
                }
                if (audioState.resolveCurrent === finish) {
                    audioState.resolveCurrent = null;
                }
                resolve(Boolean(success));
            };

            audioState.resolveCurrent = finish;
            audio.addEventListener('ended', () => finish(true), { once: true });
            audio.addEventListener('error', () => finish(false), { once: true });

            try {
                audio.play().catch(() => finish(false));
            } catch (_error) {
                finish(false);
            }
        });
    }

    async function playStudyNarration(group, includeDescription = true) {
        if (!group) return false;
        await loadCardSoundManifest();
        const pathEntries = [
            { text: group.nameKo, path: group.nameSoundPath }
        ];
        if (includeDescription) {
            pathEntries.push({ text: group.descriptionKo, path: group.descriptionSoundPath });
        }
        const paths = pathEntries
            .map((entry) => normalizeSoundPath(entry.path) || getCardSoundPathForText(entry.text))
            .map(normalizeSoundPath)
            .filter(Boolean);
        if (!paths.length) return false;

        stopStudyAudio();
        const token = audioState.token;

        for (const path of paths) {
            if (token !== audioState.token) return false;
            const played = await playStudyAudioUrl(path, token);
            if (!played || token !== audioState.token) return false;
            await new Promise((resolve) => {
                window.setTimeout(resolve, 120);
            });
        }
        return true;
    }

    function groupAssets(list) {
        const map = new Map();
        list.forEach((asset) => {
            if (!asset.nameKo && !asset.nameEn) return;
            if (isPeopleCategory(asset)) return;
            const key = `${normalizeToken(asset.category)}::${normalizeToken(getDisplayName(asset))}`;
            if (!map.has(key)) {
                map.set(key, {
                    id: key,
                    category: asset.category,
                    categoryKo: asset.categoryKo,
                    categoryLabel: getDisplayCategory(asset),
                    nameKo: getDisplayName(asset),
                    descriptionKo: asset.descriptionKo || DEFAULT_DESCRIPTION,
                    nameSoundPath: asset.nameSoundPath || '',
                    descriptionSoundPath: asset.descriptionSoundPath || '',
                    photo: null,
                    illust: null,
                    assets: []
                });
            }
            const group = map.get(key);
            group.assets.push(asset);
            if (!group.descriptionKo && asset.descriptionKo) group.descriptionKo = asset.descriptionKo;
            if (!group.nameSoundPath && asset.nameSoundPath) group.nameSoundPath = asset.nameSoundPath;
            if (!group.descriptionSoundPath && asset.descriptionSoundPath) group.descriptionSoundPath = asset.descriptionSoundPath;
            if (asset.assetType === 'photo') group.photo = asset;
            if (asset.assetType === 'illust') group.illust = asset;
        });

        return Array.from(map.values()).sort((a, b) => {
            const catA = String(a.categoryLabel || '').localeCompare(String(b.categoryLabel || ''), 'ko');
            if (catA !== 0) return catA;
            return String(a.nameKo || '').localeCompare(String(b.nameKo || ''), 'ko');
        });
    }

    function getCategoryList(groups) {
        const map = new Map();
        groups.forEach((group) => {
            const id = normalizeToken(group.category || group.categoryLabel);
            if (!id) return;
            const entry = map.get(id) || { id, label: group.categoryLabel || id, count: 0 };
            entry.count += 1;
            map.set(id, entry);
        });
        return Array.from(map.values()).sort((a, b) => {
            const countDiff = b.count - a.count;
            if (countDiff !== 0) return countDiff;
            return String(a.label || '').localeCompare(String(b.label || ''), 'ko');
        });
    }

    function initElements() {
        elements.searchInput = document.getElementById('searchInput');
        elements.categoryChips = document.getElementById('categoryChips');
        elements.modeButtons = document.getElementById('modeButtons');
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
        elements.modalCopyReveal = document.getElementById('studyModalCopyReveal');
        elements.modalCopyBody = document.getElementById('studyModalCopyBody');
        elements.modalAudio = document.getElementById('studyModalAudio');
        elements.modalHint = document.getElementById('studyModalHint');
        elements.modalName = document.getElementById('studyModalName');
        elements.modalDesc = document.getElementById('studyModalDesc');
        elements.modalCounter = document.getElementById('studyModalCounter');
        elements.modalTypeSwitch = document.getElementById('studyModalTypeSwitch');
        elements.modalCategory = document.getElementById('studyModalCategory');
        elements.modalClose = document.getElementById('studyModalClose');
        elements.modalPrev = document.getElementById('studyModalPrev');
        elements.modalNext = document.getElementById('studyModalNext');
        elements.confirmModal = document.getElementById('confirmModal');
        elements.confirmModalOk = document.getElementById('confirmModalOk');
        elements.confirmModalCancel = document.getElementById('confirmModalCancel');
        elements.exitButtons = Array.from(document.querySelectorAll('[data-action="exit"]'));
    }

    function goToPreviousLearning() {
        void leaveFullscreen();
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

    async function leaveFullscreen() {
        return false;
    }

    function getVisibleGroups() {
        const search = normalizeToken(state.search);
        const selected = state.selectedCategories;
        const mode = state.viewMode;
        return state.groups.filter((group) => {
            const groupCatId = normalizeToken(group.category || group.categoryLabel);
            const categoryOk = selected.size === 0 || selected.has(groupCatId);
            if (!categoryOk) return false;

            const searchText = normalizeToken([
                group.nameKo,
                group.categoryLabel,
                group.descriptionKo,
                group.photo?.assetTypeLabel,
                group.illust?.assetTypeLabel
            ].join(' '));
            if (search && !searchText.includes(search)) return false;

            if (mode === 'photo') return Boolean(group.photo);
            if (mode === 'illust') return Boolean(group.illust);
            return Boolean(group.photo || group.illust);
        });
    }

    function renderSummary() {
        if (elements.visibleMeta) {
            elements.visibleMeta.textContent = '';
        }
    }

    function renderCategoryChips() {
        const categories = getCategoryList(state.groups);
        const activeAll = state.selectedCategories.size === 0;
        const chipsHtml = [
            `<button type="button" class="chip ${activeAll ? 'is-active' : ''}" data-category="all">전체 <span class="chip-count">${state.groups.length}</span></button>`
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

    function renderModeButtons() {
        const buttons = [
            { id: 'photo', label: '실사보기' },
            { id: 'illust', label: '일러스트보기' },
            { id: 'compare', label: '비교해서 보기' }
        ];
        elements.modeButtons.innerHTML = buttons.map((button) => {
            const active = state.viewMode === button.id;
            return `<button type="button" class="mode-btn ${active ? 'is-active' : ''}" data-mode="${button.id}">${button.label}</button>`;
        }).join('');
        Array.from(elements.modeButtons.querySelectorAll('[data-mode]')).forEach((button) => {
            button.addEventListener('click', () => {
                const mode = String(button.getAttribute('data-mode') || 'compare');
                state.viewMode = mode;
                render();
            });
        });
    }

    function getDetailItems() {
        return getVisibleGroups();
    }

    function getDetailGroupIndex(items, groupId) {
        const normalized = String(groupId || '').trim();
        if (!normalized) return -1;
        return items.findIndex((item) => String(item.id || '').trim() === normalized);
    }

    function getDetailImageAsset(group) {
        return group?.photo || group?.illust || null;
    }

    function getPreferredDetailAssetType() {
        if (state.viewMode === 'photo' || state.viewMode === 'illust') return state.viewMode;
        return 'photo';
    }

    function getDetailAssetForGroup(group, preferredType) {
        const preferred = preferredType === 'illust' ? 'illust' : 'photo';
        const hasPhoto = Boolean(group?.photo?.imageUrl);
        const hasIllust = Boolean(group?.illust?.imageUrl);

        if (preferred === 'photo' && hasPhoto) return { asset: group.photo, type: 'photo' };
        if (preferred === 'illust' && hasIllust) return { asset: group.illust, type: 'illust' };
        if (hasPhoto) return { asset: group.photo, type: 'photo' };
        if (hasIllust) return { asset: group.illust, type: 'illust' };
        return { asset: null, type: preferred };
    }

    function getAssetLookupKey(asset) {
        return [
            normalizeToken(asset && asset.filePath),
            normalizeToken(asset && asset.fileName),
            normalizeToken(asset && asset.nameEn)
        ].filter(Boolean).join('|');
    }

    function mergeAssetRecords(localAsset, remoteAsset) {
        if (!localAsset) return remoteAsset;
        if (!remoteAsset) return localAsset;
        const localDescription = String(localAsset.descriptionKo || '').trim();
        const remoteDescription = String(remoteAsset.descriptionKo || '').trim();
        return {
            ...remoteAsset,
            ...localAsset,
            category: localAsset.category || remoteAsset.category,
            categoryKo: localAsset.categoryKo || remoteAsset.categoryKo,
            assetType: localAsset.assetType || remoteAsset.assetType,
            assetTypeLabel: localAsset.assetTypeLabel || remoteAsset.assetTypeLabel,
            nameKo: localAsset.nameKo || remoteAsset.nameKo,
            nameEn: localAsset.nameEn || remoteAsset.nameEn,
            descriptionKo: isMeaningfulText(localDescription) ? localDescription : remoteDescription,
            nameSoundPath: localAsset.nameSoundPath || remoteAsset.nameSoundPath,
            descriptionSoundPath: localAsset.descriptionSoundPath || remoteAsset.descriptionSoundPath,
            imageUrl: localAsset.imageUrl || remoteAsset.imageUrl,
            fileName: localAsset.fileName || remoteAsset.fileName,
            filePath: localAsset.filePath || remoteAsset.filePath
        };
    }

    function mergeAssetCollections(localAssets, remoteAssets) {
        if (!Array.isArray(localAssets) || !localAssets.length) {
            return Array.isArray(remoteAssets) ? remoteAssets : [];
        }
        if (!Array.isArray(remoteAssets) || !remoteAssets.length) {
            return localAssets;
        }
        const remoteByKey = new Map();
        remoteAssets.forEach(function (asset) {
            const key = getAssetLookupKey(asset);
            if (!key) return;
            if (!remoteByKey.has(key)) remoteByKey.set(key, asset);
        });
        return localAssets.map(function (asset) {
            const key = getAssetLookupKey(asset);
            return mergeAssetRecords(asset, remoteByKey.get(key));
        });
    }

    function openDetailModal(index = 0, preferredType = null) {
        const items = getDetailItems();
        if (!items.length) return;
        stopStudyAudio();
        const normalizedIndex = Math.max(0, Math.min(items.length - 1, Number(index) || 0));
        const group = items[normalizedIndex] || null;
        if (!group) return;
        const resolved = getDetailAssetForGroup(group, preferredType || getPreferredDetailAssetType());
        state.detailOpen = true;
        state.detailRevealText = false;
        state.detailGroupId = String(group.id || '').trim();
        state.detailAssetType = resolved.type;
        render();
    }

    function closeDetailModal() {
        if (!state.detailOpen) return;
        stopStudyAudio();
        state.detailOpen = false;
        state.detailRevealText = false;
        state.detailGroupId = '';
        state.detailAssetType = 'photo';
        render();
    }

    function moveDetailModal(delta = 1) {
        const items = getDetailItems();
        if (!items.length) return;
        stopStudyAudio();
        const currentIndex = Math.max(0, getDetailGroupIndex(items, state.detailGroupId));
        const nextIndex = (currentIndex + Number(delta || 0) + items.length) % items.length;
        state.detailRevealText = false;
        state.detailGroupId = String(items[nextIndex]?.id || '').trim();
        const resolved = getDetailAssetForGroup(items[nextIndex], state.detailAssetType);
        state.detailAssetType = resolved.type;
        state.detailOpen = true;
        render();
    }

    function switchDetailAssetType() {
        if (!state.detailOpen) return;
        stopStudyAudio();
        const items = getDetailItems();
        const index = getDetailGroupIndex(items, state.detailGroupId);
        const group = index >= 0 ? items[index] : null;
        if (!group) return;
        const nextType = state.detailAssetType === 'photo' ? 'illust' : 'photo';
        const resolved = getDetailAssetForGroup(group, nextType);
        if (resolved.type === state.detailAssetType && resolved.type !== nextType) return;
        state.detailAssetType = resolved.type;
        state.detailRevealText = false;
        renderModal();
    }

    function toggleDetailTextReveal() {
        if (!state.detailOpen) return;
        const shouldReveal = !state.detailRevealText;
        stopStudyAudio();
        state.detailRevealText = shouldReveal;
        renderModal();
        if (shouldReveal) {
            const items = getDetailItems();
            const index = getDetailGroupIndex(items, state.detailGroupId);
            const group = index >= 0 ? items[index] : null;
            if (group) {
                void playStudyNarration(group, false);
            }
        }
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

    function renderCard(group, index) {
        const name = escapeHtml(group.nameKo);
        const description = escapeHtml(group.descriptionKo || DEFAULT_DESCRIPTION);
        const photo = group.photo;
        const illust = group.illust;
        const mode = state.viewMode;

        if (mode === 'compare') {
            return `
                <button type="button" class="study-card study-card-compare" data-group-index="${index}" aria-label="${escapeHtml(group.nameKo)} 상세 보기">
                    <div class="study-card-inner">
                        <div class="study-card-media study-card-media-compare">
                            <div class="pair-grid">
                                <div class="pair-panel">
                                    ${photo?.imageUrl ? `<img src="${escapeHtml(photo.imageUrl)}" alt="${name}">` : `<div class="pair-panel-empty">이미지 없음</div>`}
                                </div>
                                <div class="pair-panel">
                                    ${illust?.imageUrl ? `<img src="${escapeHtml(illust.imageUrl)}" alt="${name}">` : `<div class="pair-panel-empty">이미지 없음</div>`}
                                </div>
                            </div>
                        </div>
                        <div class="study-card-body study-card-body-compare">
                            <div class="study-card-name">${name}</div>
                            <div class="study-card-desc">${description}</div>
                        </div>
                    </div>
                </button>
            `;
        }

        const asset = mode === 'photo' ? photo : illust;
        const fallbackType = mode === 'photo' ? '실사 없음' : '일러스트 없음';
        const typeLabel = mode === 'photo' ? '실사' : '일러스트';
        const category = escapeHtml(group.categoryLabel || getDisplayCategory(group));
        return `
            <button type="button" class="study-card" data-group-index="${index}" aria-label="${escapeHtml(group.nameKo)} 상세 보기">
                <div class="study-card-inner">
                    <div class="study-card-media">
                        ${asset?.imageUrl ? `<img src="${escapeHtml(asset.imageUrl)}" alt="${name} ${typeLabel}">` : `<div class="pair-panel-empty">${fallbackType}</div>`}
                        <div class="study-card-type-badge">${typeLabel}</div>
                    </div>
                    <div class="study-card-body">
                        <div class="study-card-name">${name}</div>
                        <div class="study-card-meta">${category}</div>
                        <div class="study-card-desc">${description}</div>
                    </div>
                </div>
            </button>
        `;
    }

    function renderCards() {
        const visible = getVisibleGroups();
        elements.cardGrid.innerHTML = visible.map(renderCard).join('');
        const showEmpty = visible.length === 0;
        elements.emptyState.classList.toggle('is-hidden', !showEmpty);
        elements.cardGrid.style.display = showEmpty ? 'none' : 'grid';
    }

    function renderModal() {
        const items = getDetailItems();
        if (!elements.modal) return;
        if (!state.detailOpen || !items.length) {
            stopStudyAudio();
            elements.modal.classList.remove('is-open');
            elements.modal.setAttribute('aria-hidden', 'true');
            if (elements.modalMedia) elements.modalMedia.innerHTML = '';
            if (elements.modalCopy) elements.modalCopy.classList.remove('is-revealed');
            if (elements.modalTypeSwitch) {
                elements.modalTypeSwitch.textContent = '';
                elements.modalTypeSwitch.disabled = true;
            }
            if (elements.modalCategory) elements.modalCategory.textContent = '';
            return;
        }

        let index = getDetailGroupIndex(items, state.detailGroupId);
        if (index < 0) {
            index = 0;
            state.detailGroupId = String(items[0]?.id || '').trim();
        }
        const group = items[index];
        const resolved = getDetailAssetForGroup(group, state.detailAssetType);
        state.detailAssetType = resolved.type;
        const imageAsset = resolved.asset;
        const imageHtml = imageAsset?.imageUrl
            ? `<img src="${escapeHtml(imageAsset.imageUrl)}" alt="${escapeHtml(group.nameKo)}">`
            : `<div class="study-modal-image-empty">이미지가 없어요</div>`;

        elements.modalMedia.innerHTML = imageHtml;
        elements.modalCopy?.classList.toggle('is-revealed', Boolean(state.detailRevealText));
        if (elements.modalHint) {
            elements.modalHint.textContent = state.detailRevealText ? '' : '클릭해서 보세요.';
        }
        elements.modalName.textContent = group.nameKo || '이름 없음';
        elements.modalDesc.textContent = formatDescriptionText(group.descriptionKo || DEFAULT_DESCRIPTION);
        if (elements.modalCategory) {
            elements.modalCategory.textContent = group.categoryLabel || getDisplayCategory(group);
        }
        if (elements.modalTypeSwitch) {
            const nextType = state.detailAssetType === 'photo' ? 'illust' : 'photo';
            const switchLabel = state.detailAssetType === 'photo' ? '일러스트로 교체' : '실사로 교체';
            const switchIcon = nextType === 'photo' ? 'photo_camera' : 'palette';
            const switchDisabled = nextType === 'photo' ? !group.photo?.imageUrl : !group.illust?.imageUrl;
            elements.modalTypeSwitch.innerHTML = `
                <span class="material-symbols-outlined" aria-hidden="true">${switchIcon}</span>
            `;
            elements.modalTypeSwitch.disabled = switchDisabled;
            elements.modalTypeSwitch.setAttribute('aria-label', switchLabel);
            elements.modalTypeSwitch.setAttribute('title', switchLabel);
        }
        if (elements.modalCopyReveal) {
            elements.modalCopyReveal.setAttribute('aria-expanded', state.detailRevealText ? 'true' : 'false');
        }
        if (elements.modalCopyBody) {
            elements.modalCopyBody.setAttribute('aria-hidden', state.detailRevealText ? 'false' : 'true');
        }
        if (elements.modalAudio) {
            elements.modalAudio.disabled = !(group.nameSoundPath || group.descriptionSoundPath);
        }
        elements.modalCounter.textContent = `${index + 1} / ${items.length}`;
        elements.modal.classList.add('is-open');
        elements.modal.setAttribute('aria-hidden', 'false');
        elements.modalCopyReveal?.focus?.({ preventScroll: true });
    }

    function renderError(message) {
        stopStudyAudio();
        state.error = message || '카드를 불러오지 못했어요.';
        state.detailOpen = false;
        state.detailRevealText = false;
        state.detailGroupId = '';
        state.detailAssetType = 'photo';
        if (elements.errorText) {
            elements.errorText.textContent = '카드 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
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
        stopStudyAudio();
        state.detailOpen = false;
        state.detailRevealText = false;
        state.detailGroupId = '';
        state.detailAssetType = 'photo';
        if (elements.visibleMeta) {
            elements.visibleMeta.textContent = '';
        }
        elements.cardGrid.innerHTML = '';
        elements.cardGrid.style.display = 'grid';
        renderModal();
    }

    function loadEmbeddedManifest() {
        const embeddedManifest = window.CARDLAB_WEBP_MANIFEST;
        const embeddedItems = Array.isArray(embeddedManifest)
            ? embeddedManifest
            : Array.isArray(embeddedManifest && embeddedManifest.items)
                ? embeddedManifest.items
                : Array.isArray(embeddedManifest && embeddedManifest.assets)
                    ? embeddedManifest.assets
                : [];
        if (!embeddedItems.length) return [];
        return embeddedItems.map(normalizeAsset).filter((asset) => {
            if (!asset.id) return false;
            if (!asset.imageUrl) return false;
            if (isPeopleCategory(asset)) return false;
            return asset.assetType === 'photo' || asset.assetType === 'illust';
        });
    }

    function render() {
        elements.errorState.classList.add('is-hidden');
        elements.emptyState.classList.add('is-hidden');
        renderSummary();
        renderCategoryChips();
        renderModeButtons();
        renderCards();
        renderModal();
        elements.resetButton.disabled = state.selectedCategories.size === 0 && !state.search && state.viewMode === 'photo';
    }

    function bindEvents() {
        elements.exitButtons.forEach((button) => {
            button.addEventListener('click', openConfirmModal);
        });
        document.addEventListener('pointerdown', (event) => {
            if (event.target.closest('button, a, input, textarea, select, label')) {
                stopStudyAudio();
            }
        }, true);
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
            const button = event.target.closest('[data-group-index]');
            if (!button) return;
            const index = Number(button.getAttribute('data-group-index'));
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
            state.viewMode = 'photo';
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
        elements.modalTypeSwitch?.addEventListener('click', switchDetailAssetType);
        elements.modalCopyReveal?.addEventListener('click', toggleDetailTextReveal);
        elements.modalAudio?.addEventListener('click', () => {
            const items = getDetailItems();
            const index = getDetailGroupIndex(items, state.detailGroupId);
            const group = index >= 0 ? items[index] : null;
            if (!group) return;
            void playStudyNarration(group);
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
        renderLoading();
        elements.errorState.classList.add('is-hidden');

        const localAssets = loadEmbeddedManifest();

        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            state.rawAssets = localAssets;
            state.groups = groupAssets(state.rawAssets);
            if (state.groups.length) {
                state.loading = false;
                state.error = '';
                render();
                return;
            }
            renderError('Supabase 스크립트를 불러오지 못했어요.');
            return;
        }

        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        try {
            let result = await client
                .from('playlab_webp_assets')
                .select('id,category,category_ko,asset_type,asset_type_ko,name_ko,name_en,name_ko_auto,description_ko,file_name,file_path,is_public,is_approved,is_active,is_source_only,is_big_folder')
                .order('category', { ascending: true })
                .order('name_ko', { ascending: true });

            if (result.error && /sound_path/i.test(String(result.error.message || ''))) {
                result = await client
                    .from('playlab_webp_assets')
                    .select('id,category,category_ko,asset_type,asset_type_ko,name_ko,name_en,name_ko_auto,description_ko,file_name,file_path,is_public,is_approved,is_active,is_source_only,is_big_folder')
                    .order('category', { ascending: true })
                    .order('name_ko', { ascending: true });
            }

            if (result.error) throw result.error;

            const visibleRows = (result.data || []).filter((row) => {
                return row
                    && row.is_public !== false
                    && row.is_approved !== false
                    && row.is_active !== false
                    && row.is_source_only !== true
                    && row.is_big_folder !== true;
            });

            const remoteAssets = visibleRows.map(normalizeAsset).filter((asset) => {
                if (!asset.id) return false;
                if (!asset.imageUrl) return false;
                if (isPeopleCategory(asset)) return false;
                return asset.assetType === 'photo' || asset.assetType === 'illust';
            });
            state.rawAssets = mergeAssetCollections(localAssets, remoteAssets);
            if (!state.rawAssets.length) {
                state.rawAssets = localAssets;
            }
            state.groups = groupAssets(state.rawAssets);
            state.loading = false;
            state.error = '';
            render();
        } catch (error) {
            console.error('[CardLabStudy] load failed:', error);
            state.rawAssets = localAssets;
            state.groups = groupAssets(state.rawAssets);
            if (state.groups.length) {
                state.loading = false;
                state.error = '';
                render();
                return;
            }
            renderError(error?.message || '카드를 불러오지 못했어요.');
        }
    }

    function init() {
        initElements();
        bindEvents();
        void enterFullscreen();
        document.addEventListener('pointerdown', enterFullscreen, { once: true, passive: true });
        window.addEventListener('pagehide', stopStudyAudio, { passive: true });
        window.addEventListener('beforeunload', stopStudyAudio, { passive: true });
        loadCards();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
