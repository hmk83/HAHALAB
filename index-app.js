(function() {
"use strict";
const e = React.createElement;
const { useState, useEffect, useMemo, useRef } = React;

const SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
const supabase = window.supabase?.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;
const CLASS_START_URL = 'class-new.html?start=calendar';
const CLASS_LOGIN_URL = 'class-new.html';
const PUBLIC_CONTENT_STATS_FALLBACK = {
    cardCount: 996,
    motionCardCount: 50,
    learningCount: 39
};
const PUBLIC_CONTENT_STATS_CACHE_KEY = 'haha_public_content_stats_v1';

function getKstDateKey(date = new Date()) {
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    } catch (_error) {
        return date.toISOString().slice(0, 10);
    }
}

function getMsUntilNextKstMidnight() {
    const now = Date.now();
    const kstNow = new Date(now + (9 * 60 * 60 * 1000));
    const nextMidnightUtc = Date.UTC(
        kstNow.getUTCFullYear(),
        kstNow.getUTCMonth(),
        kstNow.getUTCDate() + 1,
        -9,
        0,
        5
    );
    return Math.max(60 * 1000, nextMidnightUtc - now);
}

function normalizePublicStatsNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.round(number) : fallback;
}

function normalizePublicContentStats(value = {}) {
    return {
        cardCount: normalizePublicStatsNumber(value.cardCount ?? value.card_count, PUBLIC_CONTENT_STATS_FALLBACK.cardCount),
        motionCardCount: normalizePublicStatsNumber(value.motionCardCount ?? value.motion_card_count, PUBLIC_CONTENT_STATS_FALLBACK.motionCardCount),
        learningCount: normalizePublicStatsNumber(value.learningCount ?? value.learning_count, PUBLIC_CONTENT_STATS_FALLBACK.learningCount)
    };
}

function readCachedPublicContentStats() {
    try {
        const raw = window.localStorage?.getItem(PUBLIC_CONTENT_STATS_CACHE_KEY);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        if (cached?.dateKey !== getKstDateKey()) return null;
        return normalizePublicContentStats(cached?.stats);
    } catch (_error) {
        return null;
    }
}

function writeCachedPublicContentStats(stats) {
    try {
        window.localStorage?.setItem(PUBLIC_CONTENT_STATS_CACHE_KEY, JSON.stringify({
            dateKey: getKstDateKey(),
            updatedAt: new Date().toISOString(),
            stats: normalizePublicContentStats(stats)
        }));
    } catch (_error) {
        // noop
    }
}

function normalizePublicStatsToken(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/_/g, '-');
}

function normalizePublicStatsAssetType(value) {
    const normalized = normalizePublicStatsToken(value);
    if (normalized === 'photo' || normalized === '실사' || normalized === '사진') return 'photo';
    if (normalized === 'illust' || normalized === 'illustration' || normalized === '일러스트') return 'illust';
    return normalized || 'unknown';
}

function isPublicStatsPeopleCard(row = {}) {
    const raw = normalizePublicStatsToken(`${row.category || ''} ${row.category_ko || row.categoryKo || ''} ${row.name_ko || row.nameKo || row.name_ko_auto || row.nameKoAuto || ''}`);
    return raw.includes('사람') || raw.includes('person') || raw.includes('human');
}

function countCardStudyManifestAssets(payload = null) {
    const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.assets)
            ? payload.assets
            : Array.isArray(payload?.items)
                ? payload.items
                : [];
    if (!rows.length) return normalizePublicStatsNumber(payload?.count, 0);
    const count = rows.filter((row) => {
        if (!row) return false;
        if (row.is_public === false || row.is_approved === false || row.is_active === false) return false;
        if (row.is_source_only === true || row.is_big_folder === true) return false;
        if (isPublicStatsPeopleCard(row)) return false;
        const assetType = normalizePublicStatsAssetType(row.asset_type || row.assetType || row.asset_type_ko || row.assetTypeKo);
        if (assetType !== 'photo' && assetType !== 'illust') return false;
        return Boolean(row.file_path || row.filePath || row.file_name || row.fileName || row.image_url || row.imageUrl);
    }).length;
    return count || normalizePublicStatsNumber(payload?.count, 0);
}

function countVisibleLearningRegistry(content = null) {
    const parsed = typeof content === 'string'
        ? (() => {
            try { return JSON.parse(content); } catch (_error) { return {}; }
        })()
        : (content && typeof content === 'object' ? content : {});
    const now = Date.now();
    return ['cardlab', 'numberlab', 'playlab'].reduce((total, kind) => {
        const source = parsed?.[kind];
        const rows = Array.isArray(source)
            ? source
            : Array.isArray(source?.categories)
                ? source.categories
                : [];
        const visibleRows = rows.filter((row) => {
            if (!row || row.isActive === false || row.is_active === false || row.isHidden === true || row.is_hidden === true) return false;
            const scheduledAt = String(row.scheduledAt || row.scheduled_at || row.visibleFrom || row.visible_from || row.publishedAt || row.published_at || '').trim();
            if (!scheduledAt) return true;
            const scheduledMs = new Date(scheduledAt).getTime();
            return !Number.isFinite(scheduledMs) || scheduledMs <= now;
        });
        return total + visibleRows.length;
    }, 0);
}

async function fetchPublicStatsJsonFallback() {
    try {
        const response = await fetch(`./data/public-content-stats.json?date=${encodeURIComponent(getKstDateKey())}`, { cache: 'no-store' });
        if (!response.ok) return null;
        const payload = await response.json();
        return normalizePublicContentStats(payload);
    } catch (_error) {
        return null;
    }
}

async function fetchCardStudyCount() {
    const candidates = ['./playlab/webp-manifest.json', './playlab/webp-manifest.js'];
    for (const path of candidates) {
        try {
            const response = await fetch(`${path}?date=${encodeURIComponent(getKstDateKey())}`, { cache: 'no-store' });
            if (!response.ok) continue;
            const text = await response.text();
            let payload = null;
            if (/\.json(?:\?|$)/i.test(path)) {
                payload = JSON.parse(text);
            } else {
                const matched = text.match(/CARDLAB_WEBP_MANIFEST\s*=\s*({[\s\S]*?});?\s*$/);
                payload = matched ? JSON.parse(matched[1]) : null;
            }
            const count = countCardStudyManifestAssets(payload);
            if (count) return count;
        } catch (_error) {
            // Try next source.
        }
    }
    return null;
}

async function fetchMotionCardCount() {
    if (!supabase) return null;
    try {
        const { count, error } = await supabase
            .from('cardlab_motion_assets')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true);
        if (error) throw error;
        return normalizePublicStatsNumber(count, 0);
    } catch (_error) {
        return null;
    }
}

async function fetchLearningRegistryCount() {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase
            .from('app_terms')
            .select('content')
            .eq('type', 'lab_launcher_config')
            .order('updated_at', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) throw error;
        const count = countVisibleLearningRegistry(data?.content);
        return normalizePublicStatsNumber(count, 0);
    } catch (_error) {
        return null;
    }
}

async function fetchPublicContentStats() {
    const fallback = await fetchPublicStatsJsonFallback();
    const [cardCount, motionCardCount, learningCount] = await Promise.all([
        fetchCardStudyCount(),
        fetchMotionCardCount(),
        fetchLearningRegistryCount()
    ]);
    return normalizePublicContentStats({
        cardCount: cardCount ?? fallback?.cardCount ?? PUBLIC_CONTENT_STATS_FALLBACK.cardCount,
        motionCardCount: motionCardCount ?? fallback?.motionCardCount ?? PUBLIC_CONTENT_STATS_FALLBACK.motionCardCount,
        learningCount: learningCount ?? fallback?.learningCount ?? PUBLIC_CONTENT_STATS_FALLBACK.learningCount
    });
}

const IconBase = ({ children, size = 24, className = "", ...props }) => (
    e("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: className, ...props }, children)
);
const Brain = (p) => e(IconBase, { ...p }, e("path", { d: "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" }), e("path", { d: "M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" }));
const CalendarIcon = (p) => e(IconBase, { ...p }, e("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }), e("line", { x1: "16", y1: "2", x2: "16", y2: "6" }), e("line", { x1: "8", y1: "2", x2: "8", y2: "6" }), e("line", { x1: "3", y1: "10", x2: "21", y2: "10" }));
const BarChart2 = (p) => e(IconBase, { ...p }, e("line", { x1: "18", y1: "20", x2: "18", y2: "10" }), e("line", { x1: "12", y1: "20", x2: "12", y2: "4" }), e("line", { x1: "6", y1: "20", x2: "6", y2: "14" }));
const HistoryIcon = (p) => e(IconBase, { ...p }, e("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }), e("path", { d: "M3 3v5h5" }), e("path", { d: "M12 7v5l4 2" }));
const SparklesIcon = (p) => e(IconBase, { ...p }, e("path", { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" }));
const XIcon = (p) => e(IconBase, { ...p }, e("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), e("line", { x1: "6", y1: "6", x2: "18", y2: "18" }));
const MegaphoneIcon = (p) => e(IconBase, { ...p }, e("path", { d: "m3 11 18-5v12L3 14v-3z" }), e("path", { d: "M11.6 16.8a3 3 0 1 1-5.8-1.6" }));
const ChevronDownIcon = (p) => e(IconBase, { ...p }, e("polyline", { points: "6 9 12 15 18 9" }));
const ArrowDownIcon = (p) => e(IconBase, { ...p }, e("line", { x1: "12", y1: "5", x2: "12", y2: "19" }), e("polyline", { points: "19 12 12 19 5 12" }));
const ArrowUpIcon = (p) => e(IconBase, { ...p }, e("line", { x1: "12", y1: "19", x2: "12", y2: "5" }), e("polyline", { points: "5 12 12 5 19 12" }));
const InfoIcon = (p) => e(IconBase, { ...p }, e("circle", { cx: "12", cy: "12", r: "10" }), e("line", { x1: "12", y1: "16", x2: "12", y2: "12" }), e("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" }));

const POLICY_DOCS = window.HAHA_LAB_POLICY_DOCS || {};
const TERM_DOC_META = {
    terms: {
        title: POLICY_DOCS?.terms?.title || '이용약관',
        fallbackTitle: POLICY_DOCS?.terms?.fallbackTitle || 'HAHA LAB 이용약관',
        fallbackContent: POLICY_DOCS?.terms?.content || '이용약관을 준비 중입니다.',
    },
    privacy: {
        title: POLICY_DOCS?.privacy?.title || '개인정보처리방침',
        fallbackTitle: POLICY_DOCS?.privacy?.fallbackTitle || 'HAHA LAB 개인정보처리방침',
        fallbackContent: POLICY_DOCS?.privacy?.content || '개인정보처리방침을 준비 중입니다.',
    }
};

const normalizeTermType = (rawType) => rawType === 'terms' ? 'terms' : 'privacy';
const NOTICE_CHECK_KEY = 'haha_last_public_message_check';
const FAQ_CATEGORY_TABLE = 'faq_categories';
const FAQ_ITEM_TABLE = 'faq_items';

const normalizeMessageCategoryRow = (row) => ({
    id: row?.id || row?.slug || null,
    slug: String(row?.slug || row?.id || 'other').trim().toLowerCase(),
    title: row?.title || '기타',
    description: row?.description || '',
    sortOrder: Number(row?.sort_order ?? row?.sortOrder ?? 0),
    isActive: (row?.is_active ?? row?.isActive ?? true) !== false
});

const normalizeNoticeRow = (row) => {
    const deliveryDate = row?.scheduled_at || row?.scheduledAt || row?.created_at || row?.createdAt || null;
    const categorySlug = String(row?.category_slug || row?.categorySlug || '').trim().toLowerCase();
    const categoryTitle = row?.category_title || row?.categoryTitle || '';
    return {
        id: row?.id || null,
        title: row?.title || '공지사항',
        type: categoryTitle || (categorySlug === 'event' ? '이벤트' : categorySlug === 'update' ? '업데이트' : categorySlug === 'notice' ? '공지사항' : '기타'),
        content: row?.content_html || row?.contentHtml || row?.content || '',
        createdAt: deliveryDate,
        date: deliveryDate ? new Date(deliveryDate).toLocaleDateString('ko-KR') : '',
        categorySlug: categorySlug || 'notice'
    };
};

const isMissingDbObjectError = (error) => {
    const code = String(error?.code || '');
    const message = String(error?.message || '').toLowerCase();
    return (
        code === '42P01' ||
        code === '42703' ||
        code === 'PGRST202' ||
        code === 'PGRST204' ||
        message.includes('does not exist') ||
        message.includes('could not find the table') ||
        message.includes('relation') ||
        message.includes('schema cache')
    );
};

const stripHtmlTags = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(String(html), 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

const sanitizeHtmlContent = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(String(html), 'text/html');
    const tags = new Set('a p br strong b em i u s strike span div img table thead tbody tfoot tr td th ul ol li blockquote hr pre code h1 h2 h3 h4 h5 h6'.split(' '));
    const attributes = new Set('class title alt width height colspan rowspan'.split(' '));
    doc.body.querySelectorAll('*').forEach((node) => {
        if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml' || !tags.has(node.localName)) {
            node.remove();
            return;
        }
        Array.from(node.attributes).forEach((attr) => {
            const name = attr.name.toLowerCase();
            if ((node.localName === 'a' && name === 'href') || (node.localName === 'img' && name === 'src')) {
                try {
                    const url = new URL(attr.value.replace(/[\u0000-\u0020\u007f]/g, ''), window.location.href);
                    const protocols = node.localName === 'img' ? ['https:', 'http:'] : ['https:', 'http:', 'mailto:', 'tel:'];
                    if (!protocols.includes(url.protocol)) node.removeAttribute(attr.name);
                } catch (_error) { node.removeAttribute(attr.name); }
            } else if (!attributes.has(name)) {
                node.removeAttribute(attr.name);
            }
        });
        if (node.localName === 'a') node.setAttribute('rel', 'noopener noreferrer');
    });
    return doc.body.innerHTML;
};

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const splitFaqAnswerBlocks = (text) => {
    const normalized = String(text || '')
        .replace(/\u00A0/g, ' ')
        .replace(/\r\n?/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();

    if (!normalized) return [];

    const stepMatches = normalized.match(/Step\s*\d+\s*[.:]/gi) || [];
    if (stepMatches.length >= 2) {
        return normalized
            .split(/(?=Step\s*\d+\s*[.:])/gi)
            .map((part) => part.trim())
            .filter(Boolean);
    }

    const numberedMatches = normalized.match(/(?:^|\s)\d+\s*[.)]\s+/g) || [];
    if (numberedMatches.length >= 2) {
        return normalized
            .split(/(?=(?:\d+)\s*[.)]\s+)/g)
            .map((part) => part.trim())
            .filter(Boolean);
    }

    return [normalized];
};

const normalizeFaqAnswerHtml = (html) => {
    const safeHtml = sanitizeHtmlContent(html);
    if (!safeHtml) return '';

    const plainText = stripHtmlTags(safeHtml);
    const blocks = splitFaqAnswerBlocks(plainText);
    const hasComplexMarkup = /<(ul|ol|li|table|thead|tbody|tr|th|td|blockquote|pre|figure|figcaption|img|iframe)\b/i.test(safeHtml);
    if (hasComplexMarkup || blocks.length <= 1) {
        if (/<(p|div|h[1-6]|br)\b/i.test(safeHtml) && blocks.length > 1) {
            return blocks
                .map((line) => {
                    const match = line.match(/^(Step\s*\d+\s*[.:]|(?:\d+)\s*[.)])\s*(.*)$/i);
                    if (match) {
                        const label = escapeHtml(match[1].replace(/\s+/g, ' ').trim());
                        const body = escapeHtml(match[2].trim());
                        return `<p><strong>${label}</strong>${body ? ` ${body}` : ''}</p>`;
                    }
                    return `<p>${escapeHtml(line)}</p>`;
                })
                .join('');
        }
        return safeHtml;
    }

    return blocks
        .map((line) => {
            const match = line.match(/^(Step\s*\d+\s*[.:]|(?:\d+)\s*[.)])\s*(.*)$/i);
            if (match) {
                const label = escapeHtml(match[1].replace(/\s+/g, ' ').trim());
                const body = escapeHtml(match[2].trim());
                return `<p><strong>${label}</strong>${body ? ` ${body}` : ''}</p>`;
            }
            return `<p>${escapeHtml(line)}</p>`;
        })
        .join('');
};

const normalizeFaqCategoryRow = (row) => ({
    id: row?.id || row?.slug || null,
    title: row?.title || row?.name || '기본 카테고리',
    description: row?.description || row?.summary || '',
    sortOrder: Number(row?.sort_order ?? row?.sortOrder ?? 0),
    isActive: (row?.is_active ?? row?.isActive ?? true) !== false
});

const normalizeFaqItemRow = (row) => ({
    id: row?.id || null,
    categoryId: row?.category_id || row?.categoryId || null,
    question: row?.question || row?.title || '자주묻는질문',
    answerHtml: row?.answer_html || row?.answerHtml || row?.content || row?.html || '',
    sortOrder: Number(row?.sort_order ?? row?.sortOrder ?? 0),
    isActive: (row?.is_active ?? row?.isActive ?? true) !== false,
    createdAt: row?.created_at || row?.createdAt || null,
    updatedAt: row?.updated_at || row?.updatedAt || null
});

const getFallbackPolicyDocument = (termType) => {
    const normalizedType = normalizeTermType(termType);
    const meta = TERM_DOC_META[normalizedType];
    return {
        id: null,
        type: normalizedType,
        title: meta.fallbackTitle,
        content: meta.fallbackContent,
        effectiveAt: null
    };
};

async function fetchLatestPolicyDocument(termType) {
    const normalizedType = normalizeTermType(termType);
    const meta = TERM_DOC_META[normalizedType];
    const fallbackDoc = getFallbackPolicyDocument(normalizedType);
    if (!supabase) return { ok: false, row: fallbackDoc, error: new Error('SUPABASE_UNAVAILABLE') };

    const nowIso = new Date().toISOString();

    try {
        const primary = await supabase
            .from('app_terms')
            .select('id,type,title,content,effective_at,is_active,created_at')
            .eq('type', normalizedType)
            .eq('is_active', true)
            .lte('effective_at', nowIso)
            .order('effective_at', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1);

        if (!primary.error && primary.data && primary.data.length > 0) {
            const row = primary.data[0];
            return {
                ok: true,
                row: {
                    id: row.id || null,
                    type: normalizedType,
                    title: row.title || meta.fallbackTitle,
                    content: row.content || fallbackDoc.content,
                    effectiveAt: row.effective_at || row.created_at || null
                }
            };
        }

        const fallback = await supabase
            .from('app_terms')
            .select('id,type,content,created_at')
            .eq('type', normalizedType)
            .order('created_at', { ascending: false })
            .limit(1);

        if (!fallback.error && fallback.data && fallback.data.length > 0) {
            const row = fallback.data[0];
            return {
                ok: true,
                row: {
                    id: row.id || null,
                    type: normalizedType,
                    title: meta.fallbackTitle,
                    content: row.content || fallbackDoc.content,
                    effectiveAt: row.created_at || null
                }
            };
        }

        return { ok: false, row: fallbackDoc, error: primary.error || fallback.error || null };
    } catch (error) {
        return { ok: false, row: fallbackDoc, error };
    }
}

const HERO_LIGHT_START_DELAY = 1.05;
const HERO_LIGHT_CHAR_INTERVAL = 0.08;

function HeroLightLine({ text, startDelay = HERO_LIGHT_START_DELAY }) {
    return (
        e("span", { className: "hero-light-line", "aria-label": text },
            Array.from(text).map((char, idx) => (
                e("span", {
                    key: `${char}-${idx}`,
                    "aria-hidden": "true",
                    className: "hero-light-char",
                    style: { animationDelay: `${startDelay + (idx * HERO_LIGHT_CHAR_INTERVAL)}s` }
                }, char === ' ' ? '\u00A0' : char)
            ))
        )
    );
}

function PolicyModal({ isOpen, type, onClose }) {
    const [isVisible, setIsVisible] = useState(false);
    const normalizedType = normalizeTermType(type);
    const meta = TERM_DOC_META[normalizedType];
    const [loading, setLoading] = useState(false);
    const [doc, setDoc] = useState(() => getFallbackPolicyDocument(normalizedType));

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setLoading(true);
            setDoc(getFallbackPolicyDocument(normalizedType));
        }
    }, [isOpen, normalizedType]);

    useEffect(() => {
        if (!isOpen) return undefined;

        let mounted = true;
        let channel = null;
        let refreshTimer = null;

        const loadDoc = async () => {
            setLoading(true);
            const result = await fetchLatestPolicyDocument(normalizedType);
            if (!mounted) return;
            setDoc(result.row || getFallbackPolicyDocument(normalizedType));
            setLoading(false);
        };

        loadDoc();

        if (supabase) {
            channel = supabase
                .channel(`landing-policy-${normalizedType}-${Date.now()}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'app_terms', filter: `type=eq.${normalizedType}` },
                    () => loadDoc()
                )
                .subscribe();
        }

        refreshTimer = window.setInterval(() => {
            loadDoc();
        }, 30000);

        return () => {
            mounted = false;
            if (refreshTimer) window.clearInterval(refreshTimer);
            if (channel && supabase) supabase.removeChannel(channel);
        };
    }, [isOpen, normalizedType]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    if (!isOpen && !isVisible) return null;

    return (
        e("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12" },
            e("div", { className: `absolute inset-0 bg-brand-dark/70 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`, onClick: handleClose }),
            e("div", { className: `relative w-full max-w-[84rem] max-h-[94vh] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden ${isVisible ? 'animate-modal-pop' : 'opacity-0 translate-y-4'}` },
                e("div", { className: "flex justify-between items-center p-8 border-b border-gray-100 bg-brand-yellow" },
                    e("div", null,
                        e("h2", { className: "text-3xl font-black text-brand-dark" }, doc.title || meta.title),
                        doc.effectiveAt && (
                            e("p", { className: "mt-2 text-sm font-semibold text-brand-dark/45" },
                                "적용 시각: ", new Date(doc.effectiveAt).toLocaleString('ko-KR')
                            )
                        )
                    ),
                    e("button", { onClick: handleClose, className: "w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors text-brand-dark shadow-sm" },
                        e(XIcon, { size: 24 })
                    )
                ),
                e("div", { className: "p-8 md:p-10 overflow-y-auto modal-scroll bg-white flex-1" },
                    e("div", { className: "rounded-[2rem] border border-gray-100 bg-brand-gray/30 p-6 md:p-8" },
                        e("p", { className: "font-sans text-[12px] text-brand-dark/75 leading-6 whitespace-pre-line font-medium" },
                            loading ? '약관 정보를 불러오는 중입니다.' : doc.content
                        )
                    )
                ),
                e("div", { className: "p-6 border-t border-gray-100 bg-white text-center" },
                    e("button", { onClick: handleClose, className: "px-10 py-4 bg-brand-dark text-brand-yellow rounded-full font-bold text-lg hover:bg-black transition-colors" },
                        "확인"
                    )
                )
            )
        )
    );
}

const isHtmlNoticeContent = (html) => /<[^>]+>/i.test(String(html || ''));

const buildNoticeFrameSrcDoc = (html, frameId) => {
    const raw = String(html || '').trim();
    if (!raw) return '';
    const escapedFrameId = String(frameId || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const s = 'script';
    const resetStyle = `<style id="haha-public-notice-reset">html,body{margin:0!important;width:100%!important;min-height:0!important;height:auto!important;background:transparent!important;overflow:visible!important;}body{display:block!important;padding:26px 0 34px!important;box-sizing:border-box!important;font-size:16px!important;line-height:var(--haha-notice-line-height,2.05)!important;letter-spacing:var(--haha-notice-letter-spacing,-.01em)!important;word-spacing:.08em!important;}body,body *{line-height:var(--haha-notice-line-height,2.05)!important;letter-spacing:var(--haha-notice-letter-spacing,-.01em)!important;}body>*:first-child{margin-top:0!important;}body>*:last-child{margin-bottom:0!important;}p,ul,ol{margin-block:.78em!important;}li+li{margin-top:.4em!important;}b,strong{font-weight:800!important;}img,video{max-width:100%!important;height:auto;}.min-h-screen,.h-screen,.page-wrapper,.notice-card{min-height:0!important;height:auto!important;}[style*="100vh"],[style*="min-height:100%"],[style*="min-height: 100%"],[style*="height:100%"],[style*="height: 100%"]{min-height:0!important;height:auto!important;}</style>`;
    const injectResetStyle = (htmlText) => {
        if (/<\/head>/i.test(htmlText)) return htmlText.replace(/<\/head>/i, `${resetStyle}</head>`);
        if (/<body[^>]*>/i.test(htmlText)) return htmlText.replace(/<body([^>]*)>/i, `<body$1>${resetStyle}`);
        return resetStyle + htmlText;
    };
    const heightScript = `<${s}>(function(){function h(){var nodes=Array.prototype.slice.call(document.body?document.body.children:[]).filter(function(node){return node.id!=='haha-public-notice-reset'&&node.tagName!=='SCRIPT'&&node.tagName!=='STYLE';});var bottom=0;nodes.forEach(function(node){var rect=node.getBoundingClientRect();bottom=Math.max(bottom,rect.bottom);});var bodyStyle=document.body?getComputedStyle(document.body):null;var paddingBottom=bodyStyle?parseFloat(bodyStyle.paddingBottom)||0:0;var measured=bottom+paddingBottom;return Math.max(measured||0,nodes.length?0:(document.body?document.body.scrollHeight:0));}function r(){window.parent.postMessage({type:'haha-public-notice-height',frameId:'${escapedFrameId}',height:h()},'*');}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',r);}else{r();}window.addEventListener('load',r);window.addEventListener('resize',r);setTimeout(r,120);setTimeout(r,500);})();</${s}>`;
    if (/^\s*<!DOCTYPE/i.test(raw) || /^\s*<html/i.test(raw)) {
        const normalized = injectResetStyle(raw);
        if (/<\/body>/i.test(normalized)) return normalized.replace(/<\/body>/i, heightScript + '</body>');
        if (/<\/html>/i.test(normalized)) return normalized.replace(/<\/html>/i, heightScript + '</html>');
        return normalized + heightScript;
    }
    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><${s} src="https://cdn.tailwindcss.com"></${s}>${resetStyle}</head><body>${raw}${heightScript}</body></html>`;
};

function NoticeFrame({ content, minHeight = 160 }) {
    const frameRef = useRef(null);
    const frameIdRef = useRef(`notice-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const [height, setHeight] = useState(minHeight);
    const [framePointerEvents, setFramePointerEvents] = useState(() => {
        if (!window.matchMedia) return 'auto';
        return window.matchMedia('(pointer: coarse)').matches ? 'none' : 'auto';
    });
    const srcDoc = useMemo(() => buildNoticeFrameSrcDoc(content, frameIdRef.current), [content]);

    useEffect(() => {
        if (!srcDoc) return undefined;
        const handler = (event) => {
            // This sandbox intentionally has an opaque origin; origin alone is
            // insufficient, so only this component's frame may adjust its height.
            if (event.origin !== 'null' || event.source !== frameRef.current?.contentWindow) return;
            if (event.data?.type !== 'haha-public-notice-height') return;
            if (event.data?.frameId !== frameIdRef.current) return;
            const nextHeight = Number(event.data?.height || 0);
            if (nextHeight > 0) setHeight(Math.min(Math.ceil(nextHeight) + 4, 20000));
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [srcDoc]);

    useEffect(() => {
        if (!window.matchMedia) return undefined;
        const mediaQuery = window.matchMedia('(pointer: coarse)');
        const syncPointerMode = () => {
            setFramePointerEvents(mediaQuery.matches ? 'none' : 'auto');
        };
        syncPointerMode();
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', syncPointerMode);
            return () => mediaQuery.removeEventListener('change', syncPointerMode);
        }
        mediaQuery.addListener(syncPointerMode);
        return () => mediaQuery.removeListener(syncPointerMode);
    }, []);

    if (!srcDoc) return null;
    return e("iframe", {
        ref: frameRef,
        srcDoc,
        sandbox: "allow-scripts allow-popups allow-popups-to-escape-sandbox",
        title: "공지사항 내용",
        scrolling: "no",
        className: "block w-full bg-transparent",
        style: { height: `${height}px`, border: 0, pointerEvents: framePointerEvents }
    });
}

function NoticeModal({ isOpen, notices, categories, onClose }) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [panelTop, setPanelTop] = useState(88);
    const noticeBodyRef = useRef(null);

    useEffect(() => {
        let closeTimer = null;

        if (isOpen) {
            setShouldRender(true);
            window.requestAnimationFrame(() => {
                setIsVisible(true);
            });
        } else {
            setIsVisible(false);
            setExpandedId(null);
            setFilter('all');
            closeTimer = window.setTimeout(() => {
                setShouldRender(false);
            }, 300);
        }

        return () => {
            if (closeTimer) window.clearTimeout(closeTimer);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const syncPanelTop = () => {
            const headerEl = document.getElementById('landing-gnb');
            const nextTop = headerEl?.getBoundingClientRect?.().height || 88;
            setPanelTop(Math.max(64, Math.round(nextTop)));
        };

        syncPanelTop();
        window.addEventListener('resize', syncPanelTop);

        return () => {
            window.removeEventListener('resize', syncPanelTop);
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    if (!shouldRender) return null;

    const getBadgeStyle = (type) => {
        switch (type) {
            case '업데이트':
                return 'bg-sky-100 text-sky-700';
            case '점검':
                return 'bg-rose-100 text-rose-700';
            case '이벤트':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-brand-gray text-brand-dark/70';
        }
    };

    const visibleCategoryMap = new Map();
    (notices || []).forEach((notice) => {
        const slug = String(notice.categorySlug || '').trim().toLowerCase();
        if (!slug || visibleCategoryMap.has(slug)) return;
        visibleCategoryMap.set(slug, {
            id: slug,
            label: notice.type || '기타'
        });
    });
    (categories || []).forEach((category) => {
        const slug = String(category.slug || category.id || '').trim().toLowerCase();
        if (!slug || !visibleCategoryMap.has(slug)) return;
        visibleCategoryMap.set(slug, {
            id: slug,
            label: category.title || visibleCategoryMap.get(slug)?.label || '기타'
        });
    });
    const categoryOptions = [{ id: 'all', label: '전체' }].concat(Array.from(visibleCategoryMap.values()));
    const filteredNotices = filter === 'all'
        ? notices
        : notices.filter((notice) => {
            const slug = String(notice.categorySlug || '').trim().toLowerCase();
            return slug === filter;
        });

    return (
        e("div", {
            className: `fixed inset-x-0 bottom-0 z-40 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`,
            style: { top: `${panelTop}px` }
        },
            e("div", { className: "w-full h-full bg-white border-t border-black/6 shadow-[0_-12px_40px_rgba(26,26,28,0.10)] flex flex-col overflow-hidden" },
                e("div", { className: "px-6 md:px-8 py-4 border-b border-black/6 shrink-0" },
                    e("div", { className: "max-w-6xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between" },
                        e("div", { className: "flex items-center gap-3" },
                            e("div", { className: "w-10 h-10 rounded-[1.15rem] bg-brand-yellow flex items-center justify-center text-brand-dark shadow-sm" },
                                e(MegaphoneIcon, { size: 18 })
                            ),
                            e("h2", { className: "text-[1.35rem] md:text-[1.55rem] font-black text-brand-dark tracking-tight" }, "공지사항")
                        ),
                        e("div", { className: "flex items-center gap-3 md:justify-end" },
                            e("div", { className: "flex flex-wrap gap-2 md:justify-end" },
                                categoryOptions.map((item) => (
                                    e("button", {
                                        key: item.id,
                                        onClick: () => setFilter(item.id),
                                        className: `px-3.5 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition ${filter === item.id ? 'bg-brand-dark text-brand-yellow shadow-[0_10px_24px_rgba(26,26,28,0.16)]' : 'bg-white text-brand-dark/60 border border-black/6 hover:bg-brand-yellow/25 hover:text-brand-dark'}`
                                    }, item.label)
                                ))
                            ),
                            e("button", { onClick: handleClose, className: "w-11 h-11 rounded-full bg-white border border-black/6 flex items-center justify-center hover:bg-white transition-colors text-brand-dark shadow-sm shrink-0" },
                                e(XIcon, { size: 20 })
                            )
                        )
                    )
                ),
                e("div", {
                    ref: noticeBodyRef,
                    className: "relative flex-1 overflow-y-auto px-6 md:px-8 pt-6 md:pt-7 pb-10",
                    style: {
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain',
                        touchAction: 'pan-y'
                    }
                },
                    e("div", { className: "max-w-6xl mx-auto space-y-4" },
                        filteredNotices.length === 0 && (
                            e("div", { className: "text-center py-24 text-brand-dark/40" },
                                e("div", { className: "w-20 h-20 mx-auto mb-5 rounded-[2rem] bg-brand-yellow/45 flex items-center justify-center text-brand-dark/65" },
                                    e(InfoIcon, { size: 40 })
                                ),
                                e("p", null, "해당하는 공지/소식이 없습니다.")
                            )
                        ),
                        filteredNotices.map((notice) => {
                            const isHtmlContent = isHtmlNoticeContent(notice.content);
                            return e("div", {
                                key: notice.id,
                                className: `rounded-[1.45rem] p-5 md:p-6 border bg-white/92 backdrop-blur-sm transition-all duration-300 ${expandedId === notice.id ? 'border-brand-yellow shadow-[0_18px_40px_rgba(26,26,28,0.09)] ring-1 ring-brand-yellow/60' : 'border-black/6 shadow-[0_10px_28px_rgba(26,26,28,0.05)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(26,26,28,0.08)]'}`
                            },
                                e("div", {
                                    className: "flex justify-between items-start gap-4 cursor-pointer",
                                    role: "button",
                                    tabIndex: 0,
                                    onClick: () => setExpandedId(expandedId === notice.id ? null : notice.id),
                                    onKeyDown: (event) => {
                                        if (event.key !== 'Enter' && event.key !== ' ') return;
                                        event.preventDefault();
                                        setExpandedId(expandedId === notice.id ? null : notice.id);
                                    }
                                },
                                    e("div", { className: "flex-1" },
                                        e("div", { className: "flex items-center gap-2 mb-2" },
                                            e("span", { className: `px-2 py-0.5 rounded text-[10px] font-black ${getBadgeStyle(notice.type)}` },
                                                notice.type
                                            ),
                                            e("span", { className: "text-xs text-brand-dark/35 font-medium" }, notice.date)
                                        ),
                                        e("h3", { className: `font-black text-base md:text-[1.18rem] leading-snug tracking-tight ${expandedId === notice.id ? 'text-brand-dark' : 'text-brand-dark/82'}` }, notice.title)
                                    ),
                                    e("div", { className: `transition-transform duration-300 ${expandedId === notice.id ? 'rotate-180' : ''}` },
                                        e(ChevronDownIcon, { size: 20, className: "text-brand-dark/35" })
                                    )
                                ),
                                e("div", {
                                    className: `overflow-hidden transition-all duration-300 ease-in-out ${expandedId === notice.id ? 'max-h-[20000px] opacity-100 mt-5' : 'max-h-0 opacity-0'}`,
                                    style: { touchAction: 'pan-y' }
                                },
                                    e("div", { className: "py-7 md:py-8 border-t border-black/6 text-brand-dark/68 text-sm md:text-[15px] leading-[2.05] whitespace-normal text-left" },
                                        isHtmlContent
                                            ? e(NoticeFrame, { content: notice.content })
                                            : e("div", { dangerouslySetInnerHTML: { __html: escapeHtml(notice.content).replace(/\n/g, '<br/>') } })
                                    )
                                )
                            );
                        })
                    )
                )
            )
        )
    );
}

function StatusToast({ message }) {
    if (!message) return null;

    return (
        e("div", { className: "fixed left-1/2 bottom-8 z-[120] -translate-x-1/2" },
            e("div", { className: "px-5 py-3 rounded-full bg-brand-dark text-brand-yellow text-sm font-bold shadow-[0_16px_36px_rgba(26,26,28,0.24)] border border-black/10 whitespace-nowrap" },
                message
            )
        )
    );
}

function FaqModal({ isOpen, categories = [], faqs = [], featureMessage = '', onClose }) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isVisible, setIsVisible] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [panelTop, setPanelTop] = useState(88);

    useEffect(() => {
        let closeTimer = null;

        if (isOpen) {
            setShouldRender(true);
            window.requestAnimationFrame(() => {
                setIsVisible(true);
            });
        } else {
            setIsVisible(false);
            setExpandedId(null);
            setSearchTerm('');
            setSelectedCategoryId('all');
            closeTimer = window.setTimeout(() => {
                setShouldRender(false);
            }, 300);
        }

        return () => {
            if (closeTimer) window.clearTimeout(closeTimer);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const syncPanelTop = () => {
            const headerEl = document.getElementById('landing-gnb');
            const nextTop = headerEl?.getBoundingClientRect?.().height || 88;
            setPanelTop(Math.max(64, Math.round(nextTop)));
        };

        syncPanelTop();
        window.addEventListener('resize', syncPanelTop);

        return () => {
            window.removeEventListener('resize', syncPanelTop);
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const normalizedCategories = useMemo(() => {
        return (categories || [])
            .map(normalizeFaqCategoryRow)
            .filter((category) => category.isActive !== false)
            .sort((a, b) => a.sortOrder - b.sortOrder || String(a.title).localeCompare(String(b.title), 'ko'));
    }, [categories]);

    const normalizedFaqs = useMemo(() => {
        return (faqs || [])
            .map(normalizeFaqItemRow)
            .filter((item) => item.isActive !== false)
            .sort((a, b) => a.sortOrder - b.sortOrder || new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }, [faqs]);

    const categoryCounts = useMemo(() => {
        const counts = new Map();
        normalizedFaqs.forEach((item) => {
            const key = item.categoryId || 'uncategorized';
            counts.set(key, (counts.get(key) || 0) + 1);
        });
        return counts;
    }, [normalizedFaqs]);

    const categoryOptions = useMemo(() => ([
        { id: 'all', title: '전체', description: '모든 질문' },
        ...normalizedCategories.map((category) => ({
            ...category,
            count: categoryCounts.get(category.id) || 0
        }))
    ]), [normalizedCategories, categoryCounts]);

    useEffect(() => {
        if (!isOpen) return;
        if (selectedCategoryId === 'all') return;
        const categoryExists = normalizedCategories.some((category) => category.id === selectedCategoryId);
        if (!categoryExists) {
            setSelectedCategoryId('all');
        }
    }, [isOpen, normalizedCategories, selectedCategoryId]);

    const filteredFaqs = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return normalizedFaqs.filter((item) => {
            const categoryId = item.categoryId || 'uncategorized';
            if (selectedCategoryId !== 'all' && categoryId !== selectedCategoryId) return false;
            if (!term) return true;
            const categoryTitle = normalizedCategories.find((category) => category.id === item.categoryId)?.title || '기본';
            const searchable = [
                item.question,
                categoryTitle,
                stripHtmlTags(item.answerHtml)
            ].join(' ').toLowerCase();
            return searchable.includes(term);
        });
    }, [normalizedFaqs, normalizedCategories, searchTerm, selectedCategoryId]);

    const activeCategory = selectedCategoryId === 'all'
        ? categoryOptions[0]
        : categoryOptions.find((category) => category.id === selectedCategoryId) || categoryOptions[0];

    if (!shouldRender) return null;

    return (
        e("div", {
            className: `fixed inset-x-0 bottom-0 z-40 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`,
            style: { top: `${panelTop}px` }
        },
            e("div", { className: "w-full h-full bg-[#F7F8FA] border-t border-black/6 shadow-[0_-12px_40px_rgba(26,26,28,0.10)] flex flex-col overflow-hidden" },
                e("div", { className: "px-6 md:px-8 py-4 border-b border-black/6 shrink-0 bg-white/95 backdrop-blur" },
                    e("div", { className: "max-w-6xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between" },
                        e("div", { className: "flex items-center gap-3" },
                            e("div", { className: "w-10 h-10 rounded-[1.15rem] bg-brand-yellow flex items-center justify-center text-brand-dark shadow-sm" },
                                e(SparklesIcon, { size: 18 })
                            ),
                            e("div", null,
                                e("h2", { className: "text-[1.35rem] md:text-[1.55rem] font-black text-brand-dark tracking-tight" }, "자주묻는질문"),
                                e("p", { className: "text-[12px] text-brand-dark/45 font-medium mt-0.5" }, "카테고리별로 빠르게 찾고, 궁금한 것을 검색해보세요.")
                            )
                        ),
                        e("div", { className: "flex items-center gap-3 md:justify-end" },
                            e("div", { className: "hidden md:flex items-center rounded-full border border-black/8 bg-white px-3.5 py-2 text-[12px] font-semibold text-brand-dark/55" },
                                filteredFaqs.length, "건 표시"
                            ),
                            e("button", { onClick: handleClose, className: "w-11 h-11 rounded-full bg-white border border-black/6 flex items-center justify-center hover:bg-white transition-colors text-brand-dark shadow-sm shrink-0" },
                                e(XIcon, { size: 20 })
                            )
                        )
                    )
                ),
                e("div", { className: "relative flex-1 overflow-y-auto px-4 md:px-6 pt-4 md:pt-6 pb-6 md:pb-8" },
                    e("div", { className: "max-w-6xl mx-auto space-y-4 md:space-y-5" },
                        e("div", { className: "rounded-[1.6rem] border border-black/6 bg-white shadow-[0_10px_28px_rgba(26,26,28,0.05)] p-4 md:p-5" },
                            e("div", { className: "flex flex-col gap-3" },
                                e("div", { className: "w-full relative" },
                                    e("input", {
                                        value: searchTerm,
                                        onChange: (event) => setSearchTerm(event.target.value),
                                        placeholder: "질문, 키워드, 내용으로 검색",
                                        className: "w-full h-12 md:h-13 rounded-full border border-black/8 bg-[#F7F8FA] px-4 text-[13px] md:text-[14px] font-medium text-brand-dark outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30"
                                    })
                                ),
                                e("div", { className: "flex flex-wrap items-center gap-2.5 pb-1 lg:pb-0" },
                                    categoryOptions.map((category) => {
                                        const isActive = selectedCategoryId === category.id;
                                        const count = category.id === 'all' ? normalizedFaqs.length : (category.count || 0);
                                        return (
                                            e("button", {
                                                key: category.id,
                                                onClick: () => setSelectedCategoryId(category.id),
                                                className: `shrink-0 inline-flex max-w-full items-center gap-2 rounded-full px-3.5 py-2 text-[11px] md:text-[12px] font-bold transition border ${isActive ? 'bg-brand-dark text-brand-yellow border-brand-dark shadow-[0_10px_24px_rgba(26,26,28,0.14)]' : 'bg-white text-brand-dark/60 border-black/8 hover:bg-brand-yellow/20 hover:text-brand-dark'}`
                                            },
                                                e("span", { className: "max-w-[9rem] md:max-w-[10rem] truncate" }, category.title),
                                                e("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-black ${isActive ? 'bg-brand-yellow text-brand-dark' : 'bg-black/5 text-brand-dark/50'}` }, count)
                                            )
                                        );
                                    })
                                )
                            )
                        ),
                        featureMessage && (
                            e("div", { className: "rounded-[1.6rem] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900 leading-relaxed" },
                                featureMessage
                            )
                        ),
                        e("section", { className: "min-w-0 space-y-3 md:space-y-4" },
                            filteredFaqs.length === 0 ? (
                                e("div", { className: "rounded-[1.8rem] border border-dashed border-black/10 bg-white p-10 md:p-14 text-center text-brand-dark/45" },
                                    e("div", { className: "w-16 h-16 mx-auto mb-4 rounded-[1.4rem] bg-brand-yellow/45 flex items-center justify-center text-brand-dark/70" },
                                        e(InfoIcon, { size: 30 })
                                    ),
                                    e("p", { className: "font-bold text-[16px] md:text-[18px] text-brand-dark" }, "해당하는 질문이 없습니다."),
                                    e("p", { className: "text-[13px] md:text-[14px] mt-2 leading-relaxed" }, "카테고리를 바꾸거나 다른 키워드로 검색해보세요.")
                                )
                            ) : (
                                filteredFaqs.map((faq) => {
                                    const category = normalizedCategories.find((item) => item.id === faq.categoryId);
                                    const isExpanded = expandedId === faq.id;
                                    const contentHtml = normalizeFaqAnswerHtml(faq.answerHtml || '');

                                    return (
                                        e("article", {
                                            key: faq.id,
                                            className: `rounded-[1.6rem] md:rounded-[1.8rem] border bg-white shadow-[0_10px_28px_rgba(26,26,28,0.05)] transition-all duration-300 ${isExpanded ? 'border-brand-yellow ring-1 ring-brand-yellow/60 shadow-[0_18px_40px_rgba(26,26,28,0.09)]' : 'border-black/6 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(26,26,28,0.08)]'}`
                                        },
                                            e("button", {
                                                type: "button",
                                                onClick: () => setExpandedId(isExpanded ? null : faq.id),
                                                className: "w-full text-left p-4 md:p-5 flex items-start justify-between gap-4"
                                            },
                                                e("div", { className: "min-w-0 flex-1" },
                                                    e("div", { className: "flex flex-wrap items-center gap-2 mb-2" },
                                                        e("span", { className: "inline-flex items-center rounded-full bg-brand-yellow/70 px-2.5 py-1 text-[10px] font-black text-brand-dark" },
                                                            category?.title || '기본'
                                                        )
                                                    ),
                                                    e("h3", { className: `font-black text-[16px] md:text-[18px] leading-tight tracking-tight ${isExpanded ? 'text-brand-dark' : 'text-brand-dark/85'}` },
                                                        faq.question
                                                    )
                                                ),
                                                e("div", { className: `shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition ${isExpanded ? 'bg-brand-yellow text-brand-dark rotate-180' : 'bg-black/5 text-brand-dark/35'}` },
                                                    e(ChevronDownIcon, { size: 18 })
                                                )
                                            ),
                                            e("div", { className: `overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}` },
                                                e("div", { className: "px-4 md:px-5 pb-4 md:pb-5" },
                                                    e("div", { className: "rounded-[1.25rem] border border-black/6 bg-[#F7F8FA] px-4 py-4 md:px-5 md:py-5" },
                                                        e("div", {
                                                            className: "space-y-3 text-[13px] md:text-[14px] leading-[1.95] text-brand-dark/75 whitespace-normal [&_p]:m-0 [&_p]:leading-[1.95] [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto [&_table]:w-full [&_table]:block [&_iframe]:max-w-full [&_iframe]:mx-auto [&_iframe]:aspect-video [&_a]:text-blue-600 [&_a]:underline",
                                                            dangerouslySetInnerHTML: { __html: contentHtml || '<p>등록된 답변이 없습니다.</p>' }
                                                        })
                                                    )
                                                )
                                            )
                                        )
                                    );
                                })
                            )
                        )
                    )
                )
            )
        )
    );
}

function Header({ onOpenNotice, onOpenFaq, onCloseNotice, notices, noticeLastCheck, isNoticeOpen, isFaqOpen, isLoggedIn }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const headerCtaLabel = isLoggedIn ? '시작하기' : '로그인';
    const headerCtaUrl = isLoggedIn ? CLASS_START_URL : CLASS_LOGIN_URL;
    const markNoticeChecked = () => {
        try {
            localStorage.setItem(NOTICE_CHECK_KEY, new Date().toISOString());
        } catch (_error) {
            // noop
        }
    };

    useEffect(() => {
        const sectionIds = ['features', 'playlab', 'report'];
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
            const probeY = window.scrollY + 160;
            let current = '';
            sectionIds.forEach((id) => {
                const el = document.getElementById(id);
                if (el && probeY >= el.offsetTop) current = id;
            });
            setActiveSection(current);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    const runAfterOverlayClose = (callback) => {
        if (isNoticeOpen && typeof onCloseNotice === 'function') {
            onCloseNotice();
            window.setTimeout(() => {
                callback();
            }, 180);
            return;
        }

        if (isFaqOpen && typeof onOpenFaq === 'function') {
            onOpenFaq();
            window.setTimeout(() => {
                callback();
            }, 180);
            return;
        }

        callback();
    };

    const getHeaderHeight = () => {
        const headerEl = document.getElementById('landing-gnb');
        return headerEl?.getBoundingClientRect?.().height || 88;
    };

    const handleLogoClick = () => {
        runAfterOverlayClose(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    const handleNavClick = (event, targetId) => {
        event.preventDefault();
        runAfterOverlayClose(() => {
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;
            const top = targetEl.getBoundingClientRect().top + window.scrollY - getHeaderHeight() - 12;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        });
    };

    const handleFaqClick = () => {
        if (isNoticeOpen && typeof onCloseNotice === 'function') {
            onCloseNotice();
            window.setTimeout(() => {
                if (typeof onOpenFaq === 'function') onOpenFaq();
            }, 180);
            return;
        }
        if (typeof onOpenFaq === 'function') onOpenFaq();
    };

    return (
        e("header", { id: "landing-gnb", className: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-brand-yellow py-5 md:py-6'}` },
            e("div", { className: "max-w-7xl mx-auto px-5 md:px-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between" },
                e("div", { className: "flex items-center justify-between gap-3 md:justify-start cursor-pointer", onClick: handleLogoClick },
                    e("div", { className: "flex items-center gap-2 min-w-0" },
                        e("img", { src: "images/hahalab-logo.svg", alt: "HAHA LAB 로고", className: "h-8 md:h-9 w-auto shrink-0" }),
                        e("span", { className: "font-black text-lg md:text-2xl tracking-tight text-brand-dark" }, "HAHA LAB")
                    ),
                    e("button", { onClick: () => window.location.href = headerCtaUrl, className: `md:hidden shrink-0 px-4 py-2.5 rounded-full text-[13px] font-bold transition-all active:scale-95 ${isScrolled ? 'bg-brand-yellow text-brand-dark hover:bg-yellow-400' : 'bg-brand-dark text-brand-yellow hover:bg-black'}` },
                        headerCtaLabel
                    )
                ),
                e("nav", { className: "hidden md:flex items-center gap-8 text-[15px] font-bold" },
                    e("a", {
                        href: "#features",
                        onClick: (event) => handleNavClick(event, 'features'),
                        className: `py-1.5 border-b-2 transition-colors duration-200 ${!isNoticeOpen && activeSection === 'features' ? 'border-brand-dark text-brand-dark' : 'border-transparent text-brand-dark/55 hover:text-brand-dark hover:border-brand-dark/25'}`
                    }, "주요 기능"),
                    e("a", {
                        href: "#playlab",
                        onClick: (event) => handleNavClick(event, 'playlab'),
                        className: `py-1.5 border-b-2 transition-colors duration-200 ${!isNoticeOpen && activeSection === 'playlab' ? 'border-brand-dark text-brand-dark' : 'border-transparent text-brand-dark/55 hover:text-brand-dark hover:border-brand-dark/25'}`
                    }, "플레이랩"),
                    e("a", {
                        href: "#report",
                        onClick: (event) => handleNavClick(event, 'report'),
                        className: `py-1.5 border-b-2 transition-colors duration-200 ${!isNoticeOpen && activeSection === 'report' ? 'border-brand-dark text-brand-dark' : 'border-transparent text-brand-dark/55 hover:text-brand-dark hover:border-brand-dark/25'}`
                    }, "성장 리포트"),
                    e("a", {
                        href: "notice.html",
                        target: "_blank",
                        rel: "noopener",
                        onClick: markNoticeChecked,
                        className: `relative py-1.5 border-b-2 transition-colors duration-200 ${isNoticeOpen ? 'border-brand-dark text-brand-dark' : 'border-transparent text-brand-dark/55 hover:text-brand-dark hover:border-brand-dark/25'}`
                    },
                        "공지사항",
                        (() => {
                            if (!notices || notices.length === 0) return null;
                            const latestNotice = notices[0]?.createdAt ? new Date(notices[0].createdAt).getTime() : 0;
                            const checkedAt = noticeLastCheck ? new Date(noticeLastCheck).getTime() : 0;
                            const hasNew = !checkedAt || latestNotice > checkedAt;
                            return hasNew ? e("span", { className: "absolute top-1 right-[-8px] w-2 h-2 bg-red-500 rounded-full border border-brand-yellow" }) : null;
                        })()
                    ),
                    e("a", {
                        href: "faq.html",
                        target: "_blank",
                        rel: "noopener",
                        className: `py-1.5 border-b-2 transition-colors duration-200 ${isFaqOpen ? 'border-brand-dark text-brand-dark' : 'border-transparent text-brand-dark/55 hover:text-brand-dark hover:border-brand-dark/25'}`
                    }, "자주묻는질문")
                ),
                e("div", { className: "hidden md:flex items-center gap-2 md:gap-3" },
                    e("button", { onClick: () => window.location.href = headerCtaUrl, className: `px-4 md:px-7 py-2.5 md:py-3 rounded-full text-[13px] md:text-[15px] font-bold transition-all active:scale-95 ${isScrolled ? 'bg-brand-yellow text-brand-dark hover:bg-yellow-400' : 'bg-brand-dark text-brand-yellow hover:bg-black'}` },
                        headerCtaLabel
                    )
                ),
                e("div", { className: "md:hidden grid grid-cols-2 gap-2" },
                    e("a", {
                        href: "notice.html",
                        target: "_blank",
                        rel: "noopener",
                        onClick: markNoticeChecked,
                        className: `relative flex items-center justify-center px-3.5 py-2.5 rounded-full text-[12px] font-bold border transition ${isNoticeOpen ? 'bg-brand-dark text-brand-yellow border-brand-dark' : 'bg-white/80 text-brand-dark/75 border-black/8 hover:bg-white'}`
                    },
                        "공지사항",
                        (() => {
                            if (!notices || notices.length === 0) return null;
                            const latestNotice = notices[0]?.createdAt ? new Date(notices[0].createdAt).getTime() : 0;
                            const checkedAt = noticeLastCheck ? new Date(noticeLastCheck).getTime() : 0;
                            const hasNew = !checkedAt || latestNotice > checkedAt;
                            return hasNew ? e("span", { className: "absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" }) : null;
                        })()
                    ),
                    e("a", {
                        href: "faq.html",
                        target: "_blank",
                        rel: "noopener",
                        className: `flex items-center justify-center px-3.5 py-2.5 rounded-full text-[12px] font-bold border transition ${isFaqOpen ? 'bg-brand-dark text-brand-yellow border-brand-dark' : 'bg-white/80 text-brand-dark/75 border-black/8 hover:bg-white'}`
                    }, "FAQ")
                )
            )
        )
    );
}

function Hero() {
    const heroHeadlineLine1 = '가벼운 준비,';
    const heroHeadlineLine2 = '차원이 다른 수업.';
    const heroHeadlineLine2Delay = HERO_LIGHT_START_DELAY + (Array.from(heroHeadlineLine1).length * HERO_LIGHT_CHAR_INTERVAL);

    return (
        e("section", { className: "relative min-h-screen pt-36 pb-20 md:pt-36 md:pb-24 bg-brand-yellow flex items-center justify-center overflow-hidden" },
            e("div", { className: "relative z-20 text-center px-5 md:px-6 max-w-5xl mx-auto" },
                e("div", { className: "inline-flex items-center gap-2 bg-white/40 px-4 md:px-5 py-1.5 md:py-2 rounded-full font-bold text-[13px] md:text-base text-brand-dark mb-6 md:mb-8 animate-fade-in-up" },
                    e(SparklesIcon, { size: 18 }),
                    "선생님을 위한 가장 완벽한 스마트 솔루션"
                ),
                e("h1", { className: "text-[2.95rem] sm:text-5xl md:text-[5.5rem] font-black text-brand-dark mb-6 md:mb-8 leading-[1.05] md:leading-[1.15] tracking-tight animate-fade-in-up delay-100" },
                    e(HeroLightLine, { text: heroHeadlineLine1 }), e("br", null),
                    e(HeroLightLine, { text: heroHeadlineLine2, startDelay: heroHeadlineLine2Delay })
                ),
                e("p", { className: "text-[15px] md:text-lg text-brand-dark/80 mb-10 md:mb-14 animate-fade-in-up delay-200 font-light leading-relaxed max-w-2xl mx-auto" },
                    "수업과 교구 준비는 ", e("strong", { className: "font-black text-brand-dark" }, "HAHA LAB"), "에 맡기세요.", e("br", { className: "hidden md:block" }),
                    "선생님은 오직 아이들과의 눈맞춤에만 집중할 수 있습니다."
                ),
                e("button", { onClick: () => window.location.href = CLASS_START_URL, className: "opacity-0 animate-fade-in-up delay-300 w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 bg-brand-dark text-brand-yellow rounded-full font-black text-lg md:text-xl hover:bg-black transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1" },
                    "시작하기"
                )
            )
        )
    );
}

function Features() {
    return (
        e("section", { id: "features", className: "py-20 md:py-32 bg-brand-gray relative" },
            e("div", { className: "max-w-7xl mx-auto px-6" },
                e("div", { className: "text-center mb-14 md:mb-20 opacity-0 animate-fade-in-up" },
                    e("h2", { className: "text-3xl md:text-5xl font-black text-brand-dark mb-5 md:mb-6" }, "수업의 질을 높이는", e("br", null), "세 가지 핵심 변화"),
                    e("p", { className: "text-base md:text-lg text-brand-dark/60 font-medium" }, "단순한 업무 경감을 넘어, 완벽한 세션을 완성하는 도구들을 만나보세요.")
                ),
                e("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8" },
                    e("div", { className: "bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 opacity-0 animate-fade-in-up delay-100 group" },
                        e("div", { className: "w-14 h-14 md:w-16 md:h-16 bg-brand-yellow rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform" },
                            e(CalendarIcon, { size: 32, className: "text-brand-dark" })
                        ),
                        e("h3", { className: "text-xl md:text-2xl font-black text-brand-dark mb-4" }, "빈틈없는 스케줄링"),
                        e("p", { className: "text-brand-dark/70 leading-relaxed font-medium" },
                            "직관적인 캘린더 인터페이스. 드래그 한 번으로 일정 조율이 끝나며, 다음 수업 준비에 집중할 시간을 벌어줍니다."
                        )
                    ),
                    e("div", { className: "bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 opacity-0 animate-fade-in-up delay-200 group" },
                        e("div", { className: "w-14 h-14 md:w-16 md:h-16 bg-brand-yellow rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform" },
                            e(Brain, { size: 32, className: "text-brand-dark" })
                        ),
                        e("h3", { className: "text-xl md:text-2xl font-black text-brand-dark mb-4" }, "몰입도 높은 플레이랩"),
                        e("p", { className: "text-brand-dark/70 leading-relaxed font-medium" },
                            "지루할 틈 없는 맞춤형 인지수업 게임. 아이들은 놀이처럼 즐기고, 선생님은 자연스럽게 수업을 이끌 수 있습니다."
                        )
                    ),
                    e("div", { className: "bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 opacity-0 animate-fade-in-up delay-300 group" },
                        e("div", { className: "w-14 h-14 md:w-16 md:h-16 bg-brand-yellow rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform" },
                            e(BarChart2, { size: 32, className: "text-brand-dark" })
                        ),
                        e("h3", { className: "text-xl md:text-2xl font-black text-brand-dark mb-4" }, "신뢰도 100% 리포트"),
                        e("p", { className: "text-brand-dark/70 leading-relaxed font-medium" },
                            "수업 데이터가 자동으로 정리되어 학부모 상담 시 가장 확실하고 전문적인 지표로 활용됩니다."
                        )
                    )
                )
            )
        )
    );
}

function PlayLabHighlight() {
    const checkSvg = () => e("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" },
        e("polyline", { points: "20 6 9 17 4 12" })
    );

    return (
        e("section", { id: "playlab", className: "py-20 md:py-32 bg-white" },
            e("div", { className: "max-w-7xl mx-auto px-6" },
                e("div", { className: "flex flex-col md:flex-row items-center gap-12 md:gap-24" },
                    e("div", { className: "w-full md:w-1/2 opacity-0 animate-fade-in-up" },
                        e("div", { className: "inline-block px-4 py-1.5 rounded-full bg-brand-yellow/20 text-brand-dark font-bold text-sm mb-5 md:mb-6" },
                            "PLAY LAB"
                        ),
                        e("h2", { className: "text-3xl md:text-5xl font-black text-brand-dark mb-6 md:mb-8 leading-tight" },
                            "아이는 즐겁게,", e("br", null), "선생님은 편안하게."
                        ),
                        e("p", { className: "text-base md:text-lg text-brand-dark/70 leading-relaxed mb-8 md:mb-10 font-medium" },
                            "임상 기반으로 설계된 전문 인지수업 솔루션입니다. 까다로운 교구 준비 없이도 기억력, 주의집중력, 시지각 등 세분화된 영역의 맞춤형 수업이 즉시 가능합니다."
                        ),
                        e("ul", { className: "space-y-4 md:space-y-5 text-brand-dark font-bold text-base md:text-lg" },
                            e("li", { className: "flex items-center gap-4" },
                                e("div", { className: "w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center" }, checkSvg()),
                                "실시간 난이도 자동 조절"
                            ),
                            e("li", { className: "flex items-center gap-4" },
                                e("div", { className: "w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center" }, checkSvg()),
                                "수업 결과 자동 데이터화"
                            ),
                            e("li", { className: "flex items-center gap-4" },
                                e("div", { className: "w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center" }, checkSvg()),
                                "직관적인 배리어프리 인터페이스"
                            )
                        )
                    ),
                    e("div", { className: "w-full md:w-1/2 opacity-0 animate-fade-in-up delay-200" },
                        e("div", { className: "aspect-square bg-brand-yellow rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 relative overflow-hidden shadow-2xl" },
                            e("div", { className: "h-full w-full flex flex-col items-center justify-center gap-10 -translate-y-2" },
                                e("div", { className: "scale-[0.82] md:scale-100" },
                                    e(Brain, { size: 156, className: "playlab-brain-pulse text-brand-dark opacity-90" })
                                ),
                                e("p", { className: "text-2xl md:text-3xl font-black text-brand-dark tracking-[0.22em] bg-white/40 backdrop-blur-md py-3 md:py-4 px-6 md:px-8 rounded-full inline-block" }, "스마트 수업 시작")
                            )
                        )
                    )
                )
            )
        )
    );
}

function FreeAccessSection() {
    return (
        e("section", { id: "free-access", className: "py-20 lg:py-14 bg-[#fff9db] relative overflow-hidden" },
            e("div", { className: "absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-yellow/45 via-brand-yellow/20 to-transparent" }),
            e("div", { className: "absolute -top-14 right-0 h-56 w-56 rounded-full bg-brand-yellow/40 blur-3xl" }),
            e("div", { className: "absolute bottom-10 left-0 h-64 w-64 rounded-full bg-black/5 blur-3xl" }),
            e("div", { className: "max-w-7xl mx-auto px-5 md:px-6 relative z-10" },
                e("div", { className: "text-center mb-10 lg:mb-8 opacity-0 animate-fade-in-up" },
                    e("div", { className: "inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-black text-brand-dark shadow-sm mb-4" },
                        e(SparklesIcon, { size: 16 }),
                        "도입 부담 없이 바로 사용"
                    ),
                    e("h2", { className: "text-3xl md:text-4xl lg:text-[2.7rem] font-black text-brand-dark mb-4 leading-[1.08]" },
                        "하하랩은 현재", e("br", null), "무료로 제공합니다"
                    ),
                    e("p", { className: "max-w-3xl mx-auto text-sm md:text-base leading-relaxed text-brand-dark/65 font-medium" },
                        "교사와 센터는 콘텐츠, 수업 기록, 리포트, 학생 등록 기능을 비용 부담 없이 사용할 수 있습니다."
                    )
                ),
                e("div", { className: "max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 opacity-0 animate-fade-in-up delay-200" },
                    [
                        ['학생 등록', '현재는 학생과 예약자를 무료로 등록할 수 있습니다.'],
                        ['콘텐츠 이용', '카드랩, 플레이랩, 재활랩과 리포트 기능을 계속 사용할 수 있습니다.'],
                        ['향후 정책', '추후 학생별 등록권이 도입되더라도 별도 안내 후 적용합니다.']
                    ].map(([title, desc]) => (
                        e("div", { key: title, className: "rounded-[1.7rem] border border-black/5 bg-white/80 backdrop-blur px-4 py-4 shadow-[0_14px_34px_rgba(17,24,39,0.06)]" },
                            e("p", { className: "text-[11px] font-black tracking-[0.14em] text-brand-dark/55 mb-2" }, title),
                            e("p", { className: "text-[13px] leading-relaxed font-medium text-brand-dark/72" }, desc)
                        )
                    ))
                )
            )
        )
    );
}

function ReportHighlight() {
    const graphRef = React.useRef(null);
    const switchTimerRef = React.useRef(null);
    const [isGraphVisible, setIsGraphVisible] = React.useState(false);
    const [activeGraph, setActiveGraph] = React.useState('trend');
    const graphRotateMs = 5200;

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) {
                setIsGraphVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.25 });

        if (graphRef.current) {
            observer.observe(graphRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const clearGraphTimer = () => {
        if (!switchTimerRef.current) return;
        window.clearInterval(switchTimerRef.current);
        switchTimerRef.current = null;
    };

    const startGraphTimer = () => {
        clearGraphTimer();
        switchTimerRef.current = window.setInterval(() => {
            setActiveGraph((prev) => (prev === 'trend' ? 'radar' : 'trend'));
        }, graphRotateMs);
    };

    const handleGraphDotClick = (targetGraph) => {
        setActiveGraph(targetGraph);
        if (isGraphVisible) {
            startGraphTimer();
        }
    };

    useEffect(() => {
        if (!isGraphVisible) {
            clearGraphTimer();
            return;
        }
        setActiveGraph('trend');
        startGraphTimer();
        return () => clearGraphTimer();
    }, [isGraphVisible]);

    const radarCenterX = 325;
    const radarCenterY = 160;
    const radarRadius = 120;
    const radarAxes = [
        { label: '처리 속도', angle: -90, value: 48 },
        { label: '정확도', angle: -18, value: 86 },
        { label: '안정성(IIV)', angle: 54, value: 45 },
        { label: '지속 주의력', angle: 126, value: 92 },
        { label: '인지 효율성', angle: 198, value: 82 },
    ];

    const polarToCartesian = (angleDeg, radius) => {
        const rad = (angleDeg * Math.PI) / 180;
        return {
            x: radarCenterX + Math.cos(rad) * radius,
            y: radarCenterY + Math.sin(rad) * radius,
        };
    };

    const radarRings = [0.2, 0.4, 0.6, 0.8, 1].map((scale) =>
        radarAxes
            .map((axis) => {
                const point = polarToCartesian(axis.angle, radarRadius * scale);
                return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
            })
            .join(' ')
    );

    const radarOuterPoints = radarAxes.map((axis) => polarToCartesian(axis.angle, radarRadius));
    const radarDataPoints = radarAxes.map((axis) => polarToCartesian(axis.angle, radarRadius * (axis.value / 100)));
    const radarProfilePath = `${radarDataPoints
        .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
        .join(' ')} Z`;
    const radarProfilePolygon = radarDataPoints.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
    const radarLabelPoints = radarAxes.map((axis) => {
        const point = polarToCartesian(axis.angle, radarRadius + 38);
        const isRight = axis.angle > -35 && axis.angle < 35;
        const isLeft = axis.angle > 145 || axis.angle < -145;
        return {
            ...point,
            label: axis.label,
            textAnchor: isRight ? 'start' : isLeft ? 'end' : 'middle',
        };
    });

    const reportCheckSvg = () => e("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" },
        e("polyline", { points: "20 6 9 17 4 12" })
    );

    return (
        e("section", { id: "report", className: "py-20 md:py-32 bg-brand-dark text-white" },
            e("div", { className: "max-w-7xl mx-auto px-5 md:px-6" },
                e("div", { className: "flex flex-col-reverse md:flex-row items-center gap-12 md:gap-24" },
                    e("div", { className: "w-full md:w-1/2 opacity-0 animate-fade-in-up delay-200" },
                        e("div", { className: "bg-white rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 shadow-2xl relative text-brand-dark" },
                            e("div", { className: "flex items-center justify-between gap-3 mb-5 md:mb-6" },
                                e("div", { className: "flex items-center gap-2 min-w-0" },
                                    e("h4", { className: "font-black text-lg sm:text-2xl leading-tight" }, "성장 추이 그래프")
                                ),
                                e("div", { className: "shrink-0 bg-brand-yellow px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[11px] md:text-sm font-black shadow-sm" }, "향상됨 \u2191")
                            ),

                            /* Rotating chart area */
                            e("div", { ref: graphRef, className: "relative w-full aspect-[5/3] mb-8 overflow-visible" },
                                /* Trend chart SVG */
                                e("svg", {
                                    viewBox: "0 0 650 350",
                                    className: `absolute inset-0 w-full h-full font-sans chart-layer ${isGraphVisible ? (activeGraph === 'trend' ? 'is-visible' : 'is-hidden') : 'chart-waiting'} ${isGraphVisible && activeGraph === 'trend' ? 'animate-draw' : ''}`
                                },
                                    e("text", { x: "325", y: "25", textAnchor: "middle", className: "text-[16px] font-black fill-slate-500" }, "성장 추이 그래프"),

                                    /* Grid */
                                    e("g", { stroke: "#e2e8f0", strokeWidth: "1" },
                                        e("line", { x1: "70", y1: "50", x2: "580", y2: "50" }),
                                        e("line", { x1: "70", y1: "92", x2: "580", y2: "92" }),
                                        e("line", { x1: "70", y1: "134", x2: "580", y2: "134" }),
                                        e("line", { x1: "70", y1: "176", x2: "580", y2: "176" }),
                                        e("line", { x1: "70", y1: "218", x2: "580", y2: "218" }),
                                        e("line", { x1: "70", y1: "260", x2: "580", y2: "260" }),
                                        e("line", { x1: "70", y1: "50", x2: "70", y2: "260" }),
                                        e("line", { x1: "240", y1: "50", x2: "240", y2: "260" }),
                                        e("line", { x1: "410", y1: "50", x2: "410", y2: "260" }),
                                        e("line", { x1: "580", y1: "50", x2: "580", y2: "260" })
                                    ),

                                    /* Y Axis Left */
                                    e("g", { className: "text-[12px] fill-slate-500 font-medium", textAnchor: "end" },
                                        e("text", { x: "60", y: "264" }, "570"),
                                        e("text", { x: "60", y: "222" }, "590"),
                                        e("text", { x: "60", y: "180" }, "610"),
                                        e("text", { x: "60", y: "138" }, "630"),
                                        e("text", { x: "60", y: "96" }, "650"),
                                        e("text", { x: "60", y: "54" }, "670")
                                    ),
                                    e("text", { transform: "rotate(-90)", x: "-155", y: "20", textAnchor: "middle", className: "text-[13px] fill-slate-600 font-bold" }, "반응시간 (ms)"),

                                    /* Y Axis Right */
                                    e("g", { className: "text-[12px] fill-slate-500 font-medium", textAnchor: "start" },
                                        e("text", { x: "590", y: "264" }, "80"),
                                        e("text", { x: "590", y: "222" }, "82"),
                                        e("text", { x: "590", y: "180" }, "84"),
                                        e("text", { x: "590", y: "138" }, "86"),
                                        e("text", { x: "590", y: "96" }, "88"),
                                        e("text", { x: "590", y: "54" }, "90")
                                    ),
                                    e("text", { transform: "rotate(90)", x: "155", y: "-625", textAnchor: "middle", className: "text-[13px] fill-slate-600 font-bold" }, "점수 (%)"),

                                    /* X Axis */
                                    e("g", { className: "text-[13px] fill-slate-600 font-bold", textAnchor: "middle" },
                                        e("text", { x: "70", y: "285" }, "2025-09"),
                                        e("text", { x: "240", y: "285" }, "2025-10"),
                                        e("text", { x: "410", y: "285" }, "2025-11"),
                                        e("text", { x: "580", y: "285" }, "2025-12")
                                    ),

                                    /* Lines */
                                    e("path", { d: "M 70 68.9 L 240 138.2 L 410 228.5 L 580 257.9", fill: "none", stroke: "#fb7185", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round", className: "path-red" }),
                                    e("path", { d: "M 70 249.5 L 240 260.0 L 410 192.8 L 580 125.6", fill: "none", stroke: "#60a5fa", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round", className: "path-blue" }),
                                    e("path", { d: "M 70 159.2 L 240 146.6 L 410 100.4 L 580 60.5", fill: "none", stroke: "#5eead4", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round", className: "path-green" }),

                                    /* Points */
                                    e("g", { fill: "white", stroke: "#fb7185", strokeWidth: "2.5", className: "point-red" },
                                        e("circle", { cx: "70", cy: "68.9", r: "4.5" }),
                                        e("circle", { cx: "240", cy: "138.2", r: "4.5" }),
                                        e("circle", { cx: "410", cy: "228.5", r: "4.5" }),
                                        e("circle", { cx: "580", cy: "257.9", r: "4.5" })
                                    ),
                                    e("g", { fill: "white", stroke: "#60a5fa", strokeWidth: "2.5", className: "point-blue" },
                                        e("circle", { cx: "70", cy: "249.5", r: "4.5" }),
                                        e("circle", { cx: "240", cy: "260.0", r: "4.5" }),
                                        e("circle", { cx: "410", cy: "192.8", r: "4.5" }),
                                        e("circle", { cx: "580", cy: "125.6", r: "4.5" })
                                    ),
                                    e("g", { fill: "white", stroke: "#5eead4", strokeWidth: "2.5", className: "point-green" },
                                        e("circle", { cx: "70", cy: "159.2", r: "4.5" }),
                                        e("circle", { cx: "240", cy: "146.6", r: "4.5" }),
                                        e("circle", { cx: "410", cy: "100.4", r: "4.5" }),
                                        e("circle", { cx: "580", cy: "60.5", r: "4.5" })
                                    ),

                                    /* Legend */
                                    e("g", { transform: "translate(105, 320)" },
                                        e("rect", { x: "0", y: "-12", width: "36", height: "14", fill: "white", stroke: "#fb7185", strokeWidth: "4", rx: "2" }),
                                        e("text", { x: "45", y: "0", className: "text-[13px] fill-slate-700 font-bold" }, "평균 반응시간 (ms)"),
                                        e("rect", { x: "175", y: "-12", width: "36", height: "14", fill: "white", stroke: "#60a5fa", strokeWidth: "4", rx: "2" }),
                                        e("text", { x: "220", y: "0", className: "text-[13px] fill-slate-700 font-bold" }, "정확도 (%)"),
                                        e("rect", { x: "305", y: "-12", width: "36", height: "14", fill: "white", stroke: "#5eead4", strokeWidth: "4", rx: "2" }),
                                        e("text", { x: "350", y: "0", className: "text-[13px] fill-slate-700 font-bold" }, "지속 주의력 (%)")
                                    )
                                ),

                                /* Radar chart SVG */
                                e("svg", {
                                    viewBox: "0 0 650 350",
                                    className: `absolute inset-0 w-full h-full font-sans chart-layer ${isGraphVisible ? (activeGraph === 'radar' ? 'is-visible' : 'is-hidden') : 'chart-waiting'} ${isGraphVisible && activeGraph === 'radar' ? 'animate-radar' : ''}`
                                },
                                    e("g", { stroke: "#d7dde8", strokeWidth: "1.5", fill: "none" },
                                        radarRings.map((ringPoints, index) => (
                                            e("polygon", { key: `radar-ring-${index}`, points: ringPoints })
                                        )),
                                        radarOuterPoints.map((point, index) => (
                                            e("line", { key: `radar-axis-${index}`, x1: radarCenterX, y1: radarCenterY, x2: point.x.toFixed(1), y2: point.y.toFixed(1) })
                                        ))
                                    ),
                                    e("g", { className: "text-[11px] fill-slate-500 font-bold" },
                                        e("text", { x: radarCenterX, y: "137", textAnchor: "middle" }, "20"),
                                        e("text", { x: radarCenterX, y: "113", textAnchor: "middle" }, "40"),
                                        e("text", { x: radarCenterX, y: "89", textAnchor: "middle" }, "60"),
                                        e("text", { x: radarCenterX, y: "65", textAnchor: "middle" }, "80"),
                                        e("text", { x: radarCenterX, y: "41", textAnchor: "middle" }, "100")
                                    ),
                                    e("g", { className: "text-[13px] fill-slate-700 font-bold" },
                                        radarLabelPoints.map((point, index) => (
                                            e("text", { key: `radar-label-${index}`, x: point.x.toFixed(1), y: point.y.toFixed(1), textAnchor: point.textAnchor },
                                                point.label
                                            )
                                        ))
                                    ),
                                    e("polygon", { points: radarProfilePolygon, fill: "#6366f1", fillOpacity: "0.22", className: "radar-profile-fill" }),
                                    e("path", { d: radarProfilePath, fill: "none", stroke: "#6366f1", strokeWidth: "5", strokeLinecap: "round", strokeLinejoin: "round", className: "radar-profile-line" }),
                                    e("g", { fill: "white", stroke: "#6366f1", strokeWidth: "2.5", className: "radar-profile-point" },
                                        radarDataPoints.map((point, index) => (
                                            e("circle", { key: `radar-point-${index}`, cx: point.x.toFixed(1), cy: point.y.toFixed(1), r: "5" })
                                        ))
                                    ),
                                    e("g", { transform: "translate(214, 320)" },
                                        e("rect", { x: "0", y: "-12", width: "56", height: "16", fill: "white", stroke: "#6366f1", strokeWidth: "4", rx: "2" }),
                                        e("text", { x: "66", y: "1", className: "text-[13px] fill-slate-700 font-bold" }, "최근 인지 성능 프로파일")
                                    )
                                )
                            ),

                            e("div", { className: "flex items-center justify-center gap-2 mb-5 md:mb-6" },
                                e("button", {
                                    type: "button",
                                    onClick: () => handleGraphDotClick('trend'),
                                    "aria-label": "성장 추이 그래프 보기",
                                    className: `h-2.5 w-2.5 rounded-full transition-all ${activeGraph === 'trend' ? 'bg-indigo-500 scale-110' : 'bg-slate-300 hover:bg-slate-400'}`
                                }),
                                e("button", {
                                    type: "button",
                                    onClick: () => handleGraphDotClick('radar'),
                                    "aria-label": "방사형 그래프 보기",
                                    className: `h-2.5 w-2.5 rounded-full transition-all ${activeGraph === 'radar' ? 'bg-indigo-500 scale-110' : 'bg-slate-300 hover:bg-slate-400'}`
                                })
                            ),

                            e("div", { className: "flex flex-col sm:flex-row items-start gap-4 md:gap-5 bg-brand-gray p-5 md:p-6 rounded-[2rem] md:rounded-3xl" },
                                e("div", { className: "bg-white p-2.5 md:p-3 rounded-xl shadow-sm" },
                                    e(HistoryIcon, { size: 28, className: "text-brand-dark" })
                                ),
                                e("div", null,
                                    e("p", { className: "text-base md:text-lg font-black text-brand-dark mb-1" }, "정확도 및 지속 주의력 동반 상승"),
                                    e("p", { className: "text-sm md:text-base text-brand-dark/60 font-medium leading-relaxed" }, "과거 세션 대비 정확도와 지속 주의력 지표에서 모두 뚜렷한 개선을 보였습니다.")
                                )
                            )
                        )
                    ),

                    e("div", { className: "w-full md:w-1/2 opacity-0 animate-fade-in-up" },
                        e("div", { className: "inline-block px-4 py-1.5 rounded-full bg-white/10 text-brand-yellow font-bold text-sm mb-5 md:mb-6" },
                            "SMART REPORT"
                        ),
                        e("h2", { className: "text-3xl md:text-5xl font-black mb-6 md:mb-8 leading-tight" },
                            "눈으로 증명하는", e("br", null), "가장 확실한 변화."
                        ),
                        e("p", { className: "text-base md:text-lg text-white/70 leading-relaxed mb-8 md:mb-10 font-medium" },
                            "수업이 끝나는 즉시 분석된 데이터가 실시간 리포트로 완성됩니다. 과거의 기록과 현재의 성취를 명확하게 비교하여, 학부모 상담 시 센터의 전문성을 증명하세요."
                        ),
                        e("ul", { className: "space-y-4 md:space-y-5 text-white font-bold text-base md:text-lg" },
                            e("li", { className: "flex items-center gap-4" },
                                e("div", { className: "w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-brand-yellow" }, reportCheckSvg()),
                                "수업 직후 9대 인지 지표 추출"
                            ),
                            e("li", { className: "flex items-center gap-4" },
                                e("div", { className: "w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-brand-yellow" }, reportCheckSvg()),
                                "과거와 현재의 직관적인 추이 비교"
                            ),
                            e("li", { className: "flex items-center gap-4" },
                                e("div", { className: "w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-brand-yellow" }, reportCheckSvg()),
                                "학부모 상담에 최적화된 시각화 리포트"
                            )
                        )
                    )
                )
            )
        )
    );
}

function CTA() {
    return (
        e("section", { className: "py-24 md:py-40 bg-brand-yellow text-center relative overflow-hidden" },
            e("div", { className: "max-w-3xl mx-auto px-5 md:px-6 relative z-10" },
                e("h2", { className: "text-4xl sm:text-[2.85rem] md:text-6xl font-black text-brand-dark mb-8 md:mb-10 leading-tight" },
                    "센터의 수업 퀄리티가", e("br", null), "달라집니다."
                ),
                e("button", { onClick: () => window.location.href = CLASS_START_URL, className: "w-full sm:w-auto px-8 md:px-14 py-4 md:py-6 bg-brand-dark text-brand-yellow rounded-full font-black text-lg md:text-2xl hover:bg-black transition-all transform hover:-translate-y-1 shadow-xl" },
                    "지금 바로 시작하기"
                )
            )
        )
    );
}

function CountUpNumber({ value, prefix = '', suffix = '' }) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        const desktopCountUpQuery = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
        if (!window.matchMedia || !window.matchMedia(desktopCountUpQuery).matches) {
            setDisplayValue(value);
            return undefined;
        }

        const target = Number(value) || 0;
        const start = target > 80 ? Math.floor(target * 0.68) : Math.max(0, target - 18);
        const duration = 1150;
        const startAt = window.performance?.now?.() || Date.now();
        let frameId = 0;

        const tick = (now) => {
            const elapsed = now - startAt;
            const progress = Math.min(1, elapsed / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(start + ((target - start) * eased)));
            if (progress < 1) frameId = window.requestAnimationFrame(tick);
        };

        setDisplayValue(start);
        frameId = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(frameId);
    }, [value]);

    return e("span", null, `${prefix}${Number(displayValue).toLocaleString('ko-KR')}${suffix}`);
}

function usePublicContentStats() {
    const [stats, setStats] = useState(() => readCachedPublicContentStats() || PUBLIC_CONTENT_STATS_FALLBACK);

    useEffect(() => {
        let isMounted = true;
        let midnightTimer = null;

        const refresh = async () => {
            const nextStats = await fetchPublicContentStats();
            if (!isMounted) return;
            writeCachedPublicContentStats(nextStats);
            setStats(nextStats);
        };

        const scheduleMidnightRefresh = () => {
            midnightTimer = window.setTimeout(async () => {
                await refresh();
                if (isMounted) scheduleMidnightRefresh();
            }, getMsUntilNextKstMidnight());
        };

        refresh();
        scheduleMidnightRefresh();

        return () => {
            isMounted = false;
            if (midnightTimer) window.clearTimeout(midnightTimer);
        };
    }, []);

    return stats;
}

function FloatingContentCta({ isHidden }) {
    const stats = usePublicContentStats();
    const formatNumber = (value) => Number(value).toLocaleString('ko-KR');
    const hiddenClass = isHidden ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0';

    return (
        e("aside", {
            className: `pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 transition-all duration-300 md:bottom-6 ${hiddenClass}`,
            "aria-label": "공개 콘텐츠 바로가기"
        },
            e("div", { className: "pointer-events-auto mx-auto flex w-full max-w-[620px] flex-col gap-2 rounded-[2rem] border border-black/10 bg-white/95 p-2 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur md:flex-row" },
                e("a", {
                    href: "cards.html",
                    className: "group flex flex-1 items-center justify-between gap-3 rounded-[1.25rem] bg-brand-yellow px-4 py-3 text-brand-dark transition hover:bg-yellow-300 md:px-5",
                    "aria-label": `업데이트 중인 카드 ${formatNumber(stats.cardCount)}장과 모션 카드 ${formatNumber(stats.motionCardCount)}장 보기`
                },
                    e("span", { className: "flex items-center gap-1.5 leading-tight" },
                        e("span", { className: "text-[11px] font-black tracking-[0.12em] text-brand-dark/55" }, "카드 목록"),
                        e("span", { className: "rounded-full bg-white/50 px-1.5 py-0.5 text-[10px] font-black tracking-normal text-brand-dark/65" }, "ing")
                    ),
                    e("strong", { className: "text-sm font-black md:text-base" },
                        e(CountUpNumber, { value: stats.cardCount, suffix: "장" }),
                        " + 모션 ",
                        e(CountUpNumber, { value: stats.motionCardCount, suffix: "장" })
                    )
                ),
                e("a", {
                    href: "learning.html",
                    className: "group flex flex-1 items-center justify-between gap-3 rounded-[1.25rem] bg-brand-dark px-4 py-3 text-brand-yellow transition hover:bg-black md:px-5",
                    "aria-label": `업데이트 중인 학습 총 ${formatNumber(stats.learningCount)}개 보기`
                },
                    e("span", { className: "flex items-center gap-1.5 leading-tight" },
                        e("span", { className: "text-[11px] font-black tracking-[0.12em] text-brand-yellow/70" }, "학습 목록"),
                        e("span", { className: "rounded-full bg-brand-yellow/15 px-1.5 py-0.5 text-[10px] font-black tracking-normal text-brand-yellow/80" }, "ing")
                    ),
                    e("strong", { className: "text-sm font-black md:text-base" },
                        e(CountUpNumber, { value: stats.learningCount, prefix: "총 ", suffix: "개" })
                    )
                )
            )
        )
    );
}

function Footer({ onOpenPolicy }) {
    return (
        e("footer", { className: "bg-white py-12 pb-32 md:py-16 md:pb-36 border-t border-gray-100" },
            e("div", { className: "max-w-7xl mx-auto px-5 md:px-6" },
                e("div", { className: "relative flex flex-col gap-8 text-[12px] font-normal md:flex-row md:items-center md:justify-between" },
                    e("div", { className: "flex flex-col items-center gap-1.5 text-center md:items-start md:text-left text-brand-dark" },
                        e("div", { className: "flex items-center justify-center md:justify-start gap-2" },
                            e("img", { src: "images/hahalab-logo.svg", alt: "HAHA LAB 로고", className: "h-6 w-auto" }),
                            e("span", { className: "font-bold text-sm tracking-tight" }, "HAHA LAB")
                        ),
                        e("p", { className: "leading-5 text-brand-dark/65" }, "대표 | 현명규"),
                        e("p", { className: "leading-5 text-brand-dark/65" }, "사업자등록번호 625-31-01817")
                    ),
                    e("div", { className: "flex items-center justify-center text-brand-dark/45 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2" },
                        e("p", null, "\u00A9 2026 HAHA LAB Corp.")
                    ),
                    e("div", { className: "flex items-center justify-center gap-4 text-brand-dark/55 md:justify-end" },
                        e("a", { href: "https://thehahalab.com/terms.html", target: "_blank", rel: "noopener noreferrer", className: "h-8 flex items-center hover:text-brand-dark transition-colors" }, "이용약관"),
                        e("a", { href: "https://thehahalab.com/privacy.html", target: "_blank", rel: "noopener noreferrer", className: "h-8 flex items-center hover:text-brand-dark transition-colors" }, "개인정보처리방침")
                    )
                )
            )
        )
    );
}

function App() {
    const [activePolicy, setActivePolicy] = useState(null);
    const [isNoticeOpen, setIsNoticeOpen] = useState(false);
    const [isFaqOpen, setIsFaqOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [notices, setNotices] = useState([]);
    const [noticeCategories, setNoticeCategories] = useState([]);
    const [faqCategories, setFaqCategories] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [faqFeatureMessage, setFaqFeatureMessage] = useState('');
    const [noticeLastCheck, setNoticeLastCheck] = useState(() => localStorage.getItem(NOTICE_CHECK_KEY) || '');
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        let observer = null;
        const desktopWidth = 1025;

        const collectTargets = () => {
            return Array.from(document.querySelectorAll(
                'main h1, main h2, main h3, main p, main li'
            ));
        };

        const applyReveal = () => {
            const targets = collectTargets();
            targets.forEach((el, idx) => {
                el.classList.add('desktop-scroll-reveal');
                el.dataset.revealOrder = String(idx % 6);
            });

            if (window.innerWidth < desktopWidth) {
                if (observer) {
                    observer.disconnect();
                    observer = null;
                }
                targets.forEach((el) => {
                    el.classList.add('is-visible');
                    el.style.transitionDelay = '0ms';
                });
                return;
            }

            if (observer) observer.disconnect();
            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const order = Number(entry.target.dataset.revealOrder || 0);
                    entry.target.style.transitionDelay = `${order * 45}ms`;
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

            targets.forEach((el) => observer.observe(el));
        };

        applyReveal();
        const onResize = () => applyReveal();
        window.addEventListener('resize', onResize);

        return () => {
            if (observer) observer.disconnect();
            window.removeEventListener('resize', onResize);
        };
    }, []);

    useEffect(() => {
        if (activePolicy || isNoticeOpen || isFaqOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [activePolicy, isNoticeOpen, isFaqOpen]);

    useEffect(() => {
        if (!toastMessage) return undefined;
        const timer = window.setTimeout(() => {
            setToastMessage('');
        }, 1800);
        return () => window.clearTimeout(timer);
    }, [toastMessage]);

    useEffect(() => {
        let mounted = true;

        const fetchNotices = async () => {
            if (!supabase) return;
            try {
                const [categoryResult, messageResult] = await Promise.all([
                    supabase
                        .from('app_message_categories')
                        .select('id,slug,title,description,sort_order,is_active')
                        .eq('is_active', true)
                        .order('sort_order', { ascending: true }),
                    supabase
                        .from('app_messages')
                        .select('*')
                        .in('delivery_scope', ['public', 'homepage'])
                        .eq('is_hidden', false)
                        .order('scheduled_at', { ascending: false })
                        .order('created_at', { ascending: false })
                ]);

                if (!mounted) return;

                if (categoryResult.error && !isMissingDbObjectError(categoryResult.error)) {
                    console.warn('[Landing] message category load failed:', categoryResult.error);
                }

                if (messageResult.error) {
                    if (!isMissingDbObjectError(messageResult.error)) {
                        console.warn('[Landing] public message load failed:', messageResult.error);
                    }
                    setNoticeCategories([]);
                    setNotices([]);
                    return;
                }

                setNoticeCategories((categoryResult.data || []).map(normalizeMessageCategoryRow));
                setNotices((messageResult.data || []).map(normalizeNoticeRow));
            } catch (_) {
                if (mounted) {
                    setNoticeCategories([]);
                    setNotices([]);
                }
            }
        };

        fetchNotices();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        let authSubscription = null;

        const syncSessionState = async () => {
            if (!supabase?.auth) {
                if (mounted) setIsLoggedIn(false);
                return;
            }
            try {
                const { data } = await supabase.auth.getSession();
                if (!mounted) return;
                setIsLoggedIn(Boolean(data?.session));
            } catch (_error) {
                if (mounted) setIsLoggedIn(false);
            }
        };

        syncSessionState();

        if (supabase?.auth?.onAuthStateChange) {
            const authListener = supabase.auth.onAuthStateChange((_event, session) => {
                if (!mounted) return;
                setIsLoggedIn(Boolean(session));
            });
            authSubscription = authListener?.data?.subscription || null;
        }

        return () => {
            mounted = false;
            if (authSubscription?.unsubscribe) authSubscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchFaqData = async () => {
            if (!supabase) {
                if (mounted) {
                    setFaqCategories([]);
                    setFaqs([]);
                    setFaqFeatureMessage('Supabase 연결이 없어 자주묻는질문을 불러올 수 없습니다.');
                }
                return;
            }

            try {
                const [categoryResult, itemResult] = await Promise.all([
                    supabase
                        .from(FAQ_CATEGORY_TABLE)
                        .select('id,title,description,sort_order,is_active')
                        .eq('is_active', true)
                        .order('sort_order', { ascending: true }),
                    supabase
                        .from(FAQ_ITEM_TABLE)
                        .select('id,category_id,question,answer_html,sort_order,is_active,created_at,updated_at')
                        .eq('is_active', true)
                        .order('sort_order', { ascending: true })
                        .order('created_at', { ascending: false })
                ]);

                if (!mounted) return;

                if (categoryResult.error) {
                    if (isMissingDbObjectError(categoryResult.error)) {
                        setFaqFeatureMessage('자주묻는질문 카테고리 테이블이 아직 준비되지 않았습니다. 관리자 SQL 패치 후 자동으로 노출됩니다.');
                    } else {
                        setFaqFeatureMessage('자주묻는질문 카테고리를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
                    }
                    setFaqCategories([]);
                } else {
                    setFaqCategories((categoryResult.data || []).map(normalizeFaqCategoryRow));
                }

                if (itemResult.error) {
                    if (isMissingDbObjectError(itemResult.error)) {
                        setFaqFeatureMessage((prev) => prev || '자주묻는질문 데이터 테이블이 아직 준비되지 않았습니다. 관리자 SQL 패치 후 자동으로 노출됩니다.');
                    } else {
                        setFaqFeatureMessage((prev) => prev || '자주묻는질문을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
                    }
                    setFaqs([]);
                } else {
                    setFaqs((itemResult.data || []).map(normalizeFaqItemRow));
                    if (mounted && !categoryResult.error && (itemResult.data || []).length > 0) {
                        setFaqFeatureMessage('');
                    }
                }

                if (!categoryResult.error && !itemResult.error && (itemResult.data || []).length === 0) {
                    setFaqFeatureMessage('등록된 자주묻는질문이 없습니다.');
                }
            } catch (error) {
                if (!mounted) return;
                setFaqCategories([]);
                setFaqs([]);
                setFaqFeatureMessage('자주묻는질문을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
            }
        };

        fetchFaqData();

        return () => {
            mounted = false;
        };
    }, []);

    const handleOpenNotice = () => {
        setIsFaqOpen(false);
        if (isNoticeOpen) {
            setIsNoticeOpen(false);
            return;
        }

        const nowIso = new Date().toISOString();
        localStorage.setItem(NOTICE_CHECK_KEY, nowIso);
        setNoticeLastCheck(nowIso);
        setIsNoticeOpen(true);
    };

    const handleOpenFaq = () => {
        setIsNoticeOpen(false);
        setIsFaqOpen((prev) => !prev);
    };

    return (
        e("div", { className: "min-h-screen flex flex-col selection:bg-brand-dark selection:text-brand-yellow" },
            e(Header, { onOpenNotice: handleOpenNotice, onOpenFaq: handleOpenFaq, onCloseNotice: () => setIsNoticeOpen(false), notices: notices, noticeLastCheck: noticeLastCheck, isNoticeOpen: isNoticeOpen, isFaqOpen: isFaqOpen, isLoggedIn: isLoggedIn }),
            e("main", { className: "flex-1 snap-scroll-main" },
                e(Hero, null),
                e(Features, null),
                e(PlayLabHighlight, null),
                e(ReportHighlight, null),
                e(CTA, null)
            ),
            e(Footer, { onOpenPolicy: setActivePolicy }),
            e(PolicyModal, {
                isOpen: activePolicy !== null,
                type: activePolicy,
                onClose: () => setActivePolicy(null)
            }),
            e(FloatingContentCta, { isHidden: activePolicy !== null || isNoticeOpen || isFaqOpen }),
            e(NoticeModal, {
                isOpen: isNoticeOpen,
                notices: notices,
                categories: noticeCategories,
                onClose: () => setIsNoticeOpen(false)
            }),
            e(FaqModal, {
                isOpen: isFaqOpen,
                categories: faqCategories,
                faqs: faqs,
                featureMessage: faqFeatureMessage,
                onClose: () => setIsFaqOpen(false)
            }),
            e(StatusToast, { message: toastMessage })
        )
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App, null));
})();
