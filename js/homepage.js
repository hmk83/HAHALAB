        const LAB_META = {
            all: { label: "전체", accent: "#111827" },
            cardlab: { label: "카드랩", accent: "#ff9f1c" },
            numberlab: { label: "숫자랩", accent: "#2f80ed" },
            playlab: { label: "플레이랩", accent: "#22c55e" },
            rehablab: { label: "재활랩", accent: "#ff4f9a" },
            picturecard: { label: "그림카드", accent: "#a855f7" },
            motioncard: { label: "모션카드", accent: "#14b8a6" }
        };

        const SUPABASE_URL = "https://gxungzlecmibgvykoiib.supabase.co";
        const SUPABASE_KEY = "sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE";
        const LAB_LAUNCHER_CONFIG_TERM_TYPE = "lab_launcher_config";
        const DESKTOP_INITIAL_RENDER_LIMIT = 60;
        const TABLET_INITIAL_RENDER_LIMIT = 40;
        const MOBILE_INITIAL_RENDER_LIMIT = 24;
        const RENDER_BATCH_SIZE = 40;
        const SCROLL_LOAD_OFFSET = 900;

        const state = {
            items: [],
            learningItems: [],
            pictureCardItems: [],
            motionCardItems: [],
            activeLab: "all",
            renderLimits: {}
        };

        function getLabKey(item) {
            const section = String(item.labKey || item.kind || item.suggestedSection || item.filePrefix || "").toLowerCase();
            const fileName = String(item.fileName || item.targetUrl || item.thumbnailPath || "").toLowerCase();
            if (section.includes("number") || fileName.includes("number-")) return "numberlab";
            if (section.includes("rehab") || section === "rehab" || fileName.includes("rehablab-")) return "rehablab";
            if (section.includes("play") || fileName.includes("playlab-")) return "playlab";
            return "cardlab";
        }

        function getLearningFileName(item = {}) {
            const raw = String(item.fileName || item.file_name || item.targetUrl || item.htmlUrl || item.url || "").trim();
            return raw.split("?")[0].split("#")[0].split("/").pop() || "";
        }

        function escapeHtml(value) {
            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function normalizeThumb(path) {
            const raw = String(path || "").trim();
            if (!raw) return "";
            return raw.replace(/^\/+/, "");
        }

        function buildThumbnailFromFileName(fileName = "") {
            const fileOnly = String(fileName || "").trim().split("/").pop();
            if (!fileOnly) return "";
            return `images/playlab-thumbnails/${fileOnly.replace(/\.html?$/i, "")}.webp`;
        }

        function normalizeTags(value) {
            const rawTags = Array.isArray(value) ? value : String(value || "").split(/[,#\n]/);
            return Array.from(new Set(rawTags.map((tag) => String(tag || "").trim().replace(/^#+/, "")).filter(Boolean)));
        }

        function isVisibleRegisteredLearning(item = {}) {
            if (!item || item.isActive === false || item.is_active === false) return false;
            if (item.isHidden === true || item.is_hidden === true || item.hidden === true) return false;
            const status = String(item.status || item.visibility || "").toLowerCase();
            if (status === "hidden" || status === "disabled") return false;
            const scheduledAt = String(item.scheduledAt || item.scheduled_at || item.visibleFrom || item.visible_from || "").trim();
            if (!scheduledAt) return true;
            const scheduledTime = new Date(scheduledAt).getTime();
            return !Number.isFinite(scheduledTime) || scheduledTime <= Date.now();
        }

        function parseRegistryContent(content) {
            if (!content) return {};
            if (typeof content === "object") return content;
            try {
                return JSON.parse(content);
            } catch (_error) {
                return {};
            }
        }

        function getAccessLabel(item) {
            if (item.isPictureCard) return "그림카드";
            if (item.isMotionCard) return "모션카드";
            if (item.requiresPaid) return "";
            if (item.requiresLogin) return "로그인 필요";
            return "무료";
        }

        function getInitialRenderLimit() {
            if (window.innerWidth <= 560) return MOBILE_INITIAL_RENDER_LIMIT;
            if (window.innerWidth <= 980) return TABLET_INITIAL_RENDER_LIMIT;
            return DESKTOP_INITIAL_RENDER_LIMIT;
        }

        function getMasonryColumnCount() {
            if (window.innerWidth <= 560) return 1;
            if (window.innerWidth <= 820) return 2;
            if (window.innerWidth <= 980) return 4;
            if (window.innerWidth <= 1180) return 5;
            return 6;
        }

        function getBaseItems() {
            if (state.activeLab === "picturecard") return state.pictureCardItems;
            if (state.activeLab === "motioncard") return state.motionCardItems;
            return state.activeLab === "all"
                ? state.items
                : state.items.filter((item) => item.labKey === state.activeLab);
        }

        function getVisibleItems() {
            const baseItems = getBaseItems();
            const limit = state.renderLimits[state.activeLab] || getInitialRenderLimit();
            return baseItems.slice(0, Math.min(limit, baseItems.length));
        }

        function renderFilters() {
            const filterBar = document.getElementById("filterBar");
            filterBar.innerHTML = Object.entries(LAB_META).map(([key, meta]) => {
                const count = key === "all"
                    ? state.items.length
                    : (key === "picturecard"
                        ? state.pictureCardItems.length
                        : (key === "motioncard" ? state.motionCardItems.length : state.learningItems.filter((item) => item.labKey === key).length));
                return `<button type="button" class="filter-btn${state.activeLab === key ? " active" : ""}" data-lab="${key}">${meta.label} ${count}</button>`;
            }).join("");
        }

        function createCardHtml(item) {
            const meta = LAB_META[item.labKey] || LAB_META.cardlab;
            const tags = Array.isArray(item.tags) ? item.tags.slice(0, 4) : [];
            const accessLabel = getAccessLabel(item);
            const fallbackVideoAttr = item.motionPath ? ` data-fallback-video="${escapeHtml(normalizeThumb(item.motionPath))}"` : "";
            return `
                <article class="content-card${item.isPictureCard ? " is-picture-card" : ""}${item.isMotionCard ? " is-motion-card" : ""}" data-lab="${escapeHtml(item.labKey)}">
                    <div class="card-media">
                        <img src="${escapeHtml(normalizeThumb(item.thumbnailPath || item.thumbnailUrl))}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" draggable="false"${fallbackVideoAttr}>
                        <span class="lab-badge">${escapeHtml(meta.label)}</span>
                    </div>
                    <div class="card-body">
                        <h3>${escapeHtml(item.title)}</h3>
                        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                        ${tags.length ? `<div class="tag-row">${tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
                        ${item.isPictureCard || item.isMotionCard ? "" : `<div class="meta-row">
                            <span>${escapeHtml(item.version || "v1.0.0")}</span>
                            ${accessLabel ? `<span class="access${accessLabel === "무료" ? " free" : ""}">${escapeHtml(accessLabel)}</span>` : ""}
                        </div>`}
                    </div>
                </article>
            `;
        }

        function renderCards() {
            const list = getVisibleItems();
            const baseItems = getBaseItems();
            const masonry = document.getElementById("contentMasonry");
            const emptyState = document.getElementById("emptyState");
            const columnCount = getMasonryColumnCount();
            const columns = Array.from({ length: columnCount }, () => []);
            list.forEach((item, index) => {
                columns[index % columnCount].push(createCardHtml(item));
            });
            masonry.innerHTML = columns.map((cards) => `<div class="masonry-column">${cards.join("")}</div>`).join("");
            emptyState.classList.toggle("is-visible", !baseItems.length);
        }

        function render() {
            renderFilters();
            renderCards();
        }

        function loadMoreVisibleItems() {
            const baseItems = getBaseItems();
            const currentLimit = state.renderLimits[state.activeLab] || getInitialRenderLimit();
            if (currentLimit >= baseItems.length) return false;
            state.renderLimits[state.activeLab] = Math.min(currentLimit + RENDER_BATCH_SIZE, baseItems.length);
            renderCards();
            return true;
        }

        function maybeLoadMoreVisibleItems() {
            const scrollBottom = window.scrollY + window.innerHeight;
            const pageBottom = document.documentElement.scrollHeight - SCROLL_LOAD_OFFSET;
            if (scrollBottom >= pageBottom) loadMoreVisibleItems();
        }

        function updateBackToTopButton() {
            document.getElementById("backToTop")?.classList.toggle("is-visible", window.scrollY > 520);
        }

        function handlePageScroll() {
            maybeLoadMoreVisibleItems();
            updateBackToTopButton();
        }

        async function loadLocalCatalogData() {
            try {
                const response = await fetch(`data/playlab-content-catalog.json?ts=${Date.now()}`, { cache: "no-store" });
                if (!response.ok) return { rows: [], map: new Map() };
                const payload = await response.json();
                const rows = Array.isArray(payload.rows) ? payload.rows : [];
                return {
                    rows,
                    map: new Map(rows.map((item) => [getLearningFileName(item), item]).filter(([fileName]) => fileName))
                };
            } catch (_error) {
                return { rows: [], map: new Map() };
            }
        }

        async function loadRegisteredLearningConfig() {
            const query = [
                `${SUPABASE_URL}/rest/v1/app_terms`,
                "?select=id,content,updated_at,created_at",
                `&type=eq.${encodeURIComponent(LAB_LAUNCHER_CONFIG_TERM_TYPE)}`,
                "&order=updated_at.desc",
                "&order=created_at.desc",
                "&limit=1"
            ].join("");
            const response = await fetch(query, {
                cache: "no-store",
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            });
            if (!response.ok) throw new Error("REGISTERED_LEARNING_CONFIG_LOAD_FAILED");
            const rows = await response.json();
            return parseRegistryContent(rows?.[0]?.content);
        }

        function getRegistryRowsByKind(config, configKey) {
            const source = config?.[configKey];
            return Array.isArray(source) ? source : (Array.isArray(source?.categories) ? source.categories : []);
        }

        function normalizeLearningItem(item, labKey, index, catalogItem = {}) {
            const fileName = getLearningFileName(item);
            const tags = normalizeTags(item.tags || item.hashtags || item.hashTags || catalogItem.tags);
            return {
                ...catalogItem,
                ...item,
                fileName,
                labKey,
                title: String(item.title || catalogItem.title || fileName.replace(/\.html?$/i, "")).trim(),
                description: String(item.description || catalogItem.description || "").trim(),
                thumbnailPath: normalizeThumb(item.thumbnailUrl || item.thumbnail_url || item.thumbnailPath || catalogItem.thumbnailUrl || catalogItem.thumbnailPath) || buildThumbnailFromFileName(fileName),
                tags,
                sortOrder: Number(item.sortOrder ?? item.sort_order ?? catalogItem.sortOrder ?? catalogItem.order ?? index + 1),
                accessTier: item.accessTier || item.access_tier || catalogItem.accessTier || "paid",
                requiresLogin: (item.requiresLogin ?? item.requires_login ?? catalogItem.requiresLogin ?? true) !== false,
                requiresPaid: (item.requiresPaid ?? item.requires_paid ?? catalogItem.requiresPaid ?? true) !== false,
                isFreePreview: (item.isFreePreview ?? item.is_free_preview ?? catalogItem.isFreePreview ?? true) !== false
            };
        }

        function sortLearningItems(items) {
            return items.sort((a, b) => {
                const aRegisteredAt = Date.parse(a.registeredAt || a.registered_at || "") || 0;
                const bRegisteredAt = Date.parse(b.registeredAt || b.registered_at || "") || 0;
                if (aRegisteredAt !== bRegisteredAt) return bRegisteredAt - aRegisteredAt;
                const order = { cardlab: 0, numberlab: 1, playlab: 2, rehablab: 3 };
                if ((order[a.labKey] ?? 9) !== (order[b.labKey] ?? 9)) return (order[a.labKey] ?? 9) - (order[b.labKey] ?? 9);
                return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
            });
        }

        function normalizeRegisteredItems(config, catalogMap) {
            const kinds = [
                ["cardlab", "cardlab"],
                ["numberlab", "numberlab"],
                ["playlab", "playlab"],
                ["rehab", "rehablab"]
            ];
            return sortLearningItems(kinds.flatMap(([configKey, labKey]) => {
                return getRegistryRowsByKind(config, configKey)
                    .filter(isVisibleRegisteredLearning)
                    .map((item, index) => {
                        const fileName = getLearningFileName(item);
                        const catalogItem = catalogMap.get(fileName) || {};
                        return normalizeLearningItem(item, labKey, index, catalogItem);
                    });
            }));
        }

        function normalizePictureCardPath(item = {}) {
            const raw = String(item.file_path || item.filePath || item.image_url || item.imageUrl || item.path || item.url || "").trim();
            if (!raw) return "";
            if (/^https?:\/\//i.test(raw)) return raw;
            if (raw.startsWith("/")) return raw.replace(/^\/+/, "");
            if (raw.startsWith("playlab/")) return raw;
            if (raw.startsWith("images/")) return `playlab/${raw}`;
            return raw;
        }

        function interleaveSupplementalItems(firstItems, secondItems) {
            const mixed = [];
            const maxLength = Math.max(firstItems.length, secondItems.length);
            for (let index = 0; index < maxLength; index += 1) {
                if (firstItems[index]) mixed.push(firstItems[index]);
                if (secondItems[index]) mixed.push(secondItems[index]);
            }
            return mixed;
        }

        function createPictureCardItems(pictureCards) {
            return pictureCards.map((card, index) => ({
                id: `picture-card-${index + 1}`,
                labKey: "picturecard",
                title: "하하랩 그림카드",
                description: "",
                thumbnailPath: card.src,
                tags: [],
                version: "카드 이미지",
                sortOrder: 10000 + index,
                requiresLogin: false,
                requiresPaid: false,
                isPictureCard: true
            }));
        }

        function createMotionCardItems(motionCards) {
            return motionCards.map((card, index) => ({
                id: card.id || `motion-card-${index + 1}`,
                labKey: "motioncard",
                title: "하하랩 모션카드",
                description: "",
                thumbnailPath: card.src,
                motionPath: card.motionSrc || "",
                tags: [],
                version: "모션 카드",
                sortOrder: index + 1,
                requiresLogin: false,
                requiresPaid: false,
                isMotionCard: true
            }));
        }

        function mixPreviewItems(learningItems, pictureCardItems, motionCardItems) {
            const supplementalItems = interleaveSupplementalItems(pictureCardItems, motionCardItems);
            const mixed = [];
            let cardIndex = 0;
            let batchIndex = 0;
            const firstLearningBatch = 8;
            const learningBatch = 8;
            learningItems.forEach((item, index) => {
                mixed.push(item);
                if (index + 1 < firstLearningBatch || ((index + 1 - firstLearningBatch) % learningBatch !== 0)) {
                    return;
                }
                const insertCount = batchIndex % 2 === 0 ? 2 : 3;
                for (let i = 0; i < insertCount && cardIndex < supplementalItems.length; i += 1) {
                    mixed.push(supplementalItems[cardIndex]);
                    cardIndex += 1;
                }
                batchIndex += 1;
            });
            return mixed.concat(supplementalItems.slice(cardIndex));
        }

        async function loadPictureCards() {
            try {
                const response = await fetch(`playlab/webp-manifest.json?ts=${Date.now()}`, { cache: "no-store" });
                let payload = null;
                if (response.ok) {
                    payload = await response.json();
                } else {
                    const fallbackResponse = await fetch(`playlab/webp-manifest.js?ts=${Date.now()}`, { cache: "no-store" });
                    if (!fallbackResponse.ok) return [];
                    const source = await fallbackResponse.text();
                    const jsonText = source.replace(/^window\.CARDLAB_WEBP_MANIFEST\s*=\s*/, "").replace(/;\s*$/, "");
                    payload = JSON.parse(jsonText);
                }
                const assets = Array.isArray(payload.assets) ? payload.assets : [];
                const seen = new Set();
                return assets
                    .filter((item) => {
                        const sourcePath = String(item?.file_path || item?.filePath || item?.image_url || item?.imageUrl || item?.path || item?.url || "").trim();
                        return item && item.is_active !== false && sourcePath && /\.webp(\?|#|$)/i.test(sourcePath);
                    })
                    .map((item) => normalizePictureCardPath(item))
                    .filter((src) => {
                        if (!src || seen.has(src)) return false;
                        seen.add(src);
                        return true;
                    })
                    .map((src) => ({ src }));
            } catch (_error) {
                return [];
            }
        }

        function normalizeMotionCardPath(value = "") {
            const raw = String(value || "").trim();
            if (!raw) return "";
            if (/^https?:\/\//i.test(raw)) return raw;
            if (raw.startsWith("/")) return raw.replace(/^\/+/, "");
            if (raw.startsWith("playlab/")) return raw;
            if (raw.startsWith("images/motion/")) return `playlab/${raw}`;
            return raw;
        }

        function getFileNameFromPath(value = "") {
            const raw = String(value || "").trim().split("?")[0].split("#")[0];
            return raw.split("/").filter(Boolean).pop() || "";
        }

        function getMotionThumbnailPath(row = {}) {
            const directThumbnail = String(row.thumbnail_url || row.thumbnailUrl || "").trim();
            if (directThumbnail) return normalizeMotionCardPath(directThumbnail);
            const thumbnailKey = String(row.thumbnail_key || row.thumbnailKey || "").trim();
            const thumbnailFileName = getFileNameFromPath(thumbnailKey);
            if (thumbnailFileName) return `playlab/images/motion/${encodeURIComponent(thumbnailFileName)}`;
            const directMotion = String(row.motion_url || row.motionUrl || "").trim();
            if (/\.(webp|png|jpe?g|gif|avif|svg)(\?|#|$)/i.test(directMotion)) return normalizeMotionCardPath(directMotion);
            return "";
        }

        function getMotionVideoPath(row = {}) {
            const directMotion = String(row.motion_url || row.motionUrl || "").trim();
            if (directMotion) return normalizeMotionCardPath(directMotion);
            const motionKey = String(row.motion_key || row.motionKey || "").trim();
            const motionFileName = getFileNameFromPath(motionKey);
            if (motionFileName) return `playlab/images/motion/${encodeURIComponent(motionFileName)}`;
            return "";
        }

        async function loadMotionCards() {
            try {
                const query = [
                    `${SUPABASE_URL}/rest/v1/cardlab_motion_assets`,
                    "?select=id,title_ko,thumbnail_key,thumbnail_url,motion_key,motion_url,storage_provider,sort_order,is_active",
                    "&is_active=eq.true",
                    "&order=sort_order.asc",
                    "&order=title_ko.asc"
                ].join("");
                const response = await fetch(query, {
                    cache: "no-store",
                    headers: {
                        apikey: SUPABASE_KEY,
                        Authorization: `Bearer ${SUPABASE_KEY}`
                    }
                });
                if (!response.ok) return [];
                const rows = await response.json();
                const seen = new Set();
                return (Array.isArray(rows) ? rows : [])
                    .map((row) => ({
                        id: String(row.id || "").trim(),
                        src: getMotionThumbnailPath(row),
                        motionSrc: getMotionVideoPath(row),
                        sortOrder: Number(row.sort_order ?? row.sortOrder ?? 999) || 999
                    }))
                    .filter((item) => {
                        if (!item.src || seen.has(item.src)) return false;
                        seen.add(item.src);
                        return true;
                    });
            } catch (_error) {
                return [];
            }
        }

        async function loadCatalog() {
            try {
                const [catalogData, registeredConfig, pictureCards, motionCards] = await Promise.all([
                    loadLocalCatalogData(),
                    loadRegisteredLearningConfig(),
                    loadPictureCards(),
                    loadMotionCards()
                ]);
                const catalogMap = catalogData.map || new Map();
                const learningItems = normalizeRegisteredItems(registeredConfig, catalogMap)
                    .filter((item) => item.fileName && (item.thumbnailPath || item.thumbnailUrl));
                state.learningItems = learningItems;
                state.pictureCardItems = createPictureCardItems(pictureCards);
                state.motionCardItems = createMotionCardItems(motionCards);
                state.items = mixPreviewItems(learningItems, state.pictureCardItems, state.motionCardItems);
                state.renderLimits = { all: getInitialRenderLimit() };
            } catch (_error) {
                state.items = [];
                state.learningItems = [];
                state.pictureCardItems = [];
                state.motionCardItems = [];
                state.renderLimits = { all: getInitialRenderLimit() };
            }
            render();
        }

        document.getElementById("filterBar").addEventListener("click", (event) => {
            const button = event.target.closest("[data-lab]");
            if (!button) return;
            state.activeLab = button.dataset.lab || "all";
            if (!state.renderLimits[state.activeLab]) {
                state.renderLimits[state.activeLab] = getInitialRenderLimit();
            }
            renderFilters();
            renderCards();
        });

        function isPreviewCardTarget(target) {
            return Boolean(target?.closest?.("#contentMasonry, .content-card, .card-media"));
        }

        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        }, { capture: true });

        document.getElementById("contentMasonry").addEventListener("dragstart", (event) => {
            if (isPreviewCardTarget(event.target)) event.preventDefault();
        });

        document.getElementById("contentMasonry").addEventListener("error", (event) => {
            const image = event.target;
            if (!image?.matches?.("img[data-fallback-video]")) return;
            const fallbackVideo = image.dataset.fallbackVideo;
            if (!fallbackVideo) return;
            const video = document.createElement("video");
            video.muted = true;
            video.playsInline = true;
            video.preload = "metadata";
            video.setAttribute("aria-label", image.alt || "모션카드 썸네일");
            video.innerHTML = `<source src="${escapeHtml(fallbackVideo)}" type="video/mp4">`;
            image.replaceWith(video);
        }, true);

        document.getElementById("backToTop").addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        window.addEventListener("scroll", handlePageScroll, { passive: true });
        window.addEventListener("resize", renderCards);

        updateBackToTopButton();
        loadCatalog();

        document.getElementById("introductionLink").addEventListener("click", (event) => {
            event.preventDefault();
            alert("소개 페이지는 준비중입니다.");
        });
