(function () {
    'use strict';

    const DEFAULT_SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
    const DEFAULT_SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
    const STORAGE_USER_KEY = 'haha_lab_session';
    const STORAGE_PAGE_KEY = 'haha_lab_page_state';
    const CARD_SHELL_CURRICULUM_KEY = 'card-shell-quiz';
    const CARD_SHELL_STAGE_KEY = 'card-shell-stage';
    const CARD_SHELL_STAGE_ORDER = 1;
    const DEFAULT_DESCRIPTION = '그림을 보고 카드 이름과 특징을 함께 이야기해 보세요.';
    const CARD_DESCRIPTION_OVERRIDES = {
        '병아리': '노란 솜털이 있고 삐약삐약 울어요. 크면 닭이 돼요.',
        '닭': '날개가 있지만 멀리 날지는 못하고 꼬꼬댁 울어요. 알을 낳아요.',
        '부엉이': '밤에 눈을 크게 뜨고 활동해요. 나무 위에서 조용히 지켜봐요.',
        '공작새': '몸이 크고 꼬리 깃털을 부채처럼 활짝 펼쳐요. 파란색과 초록색 깃털이 반짝여요.',
        '펭귄': '차가운 곳에서 살고 뒤뚱뒤뚱 걸어요. 수영을 아주 잘해요.',
        '앵무새': '알록달록 깃털이 예쁘고 사람 말을 따라 하기도 해요.',
        '독수리': '큰 날개로 높이 날아오르고 멀리 있는 것도 잘 봐요.',
        '까마귀': '검은 깃털을 가진 새예요. 영리해서 도구를 쓰기도 해요.',
        '참새': '작고 갈색 깃털을 가진 새예요. 짹짹 소리를 내며 빠르게 날아다녀요.',
        '백조': '목이 길고 흰 깃털이 고운 새예요. 물 위를 천천히 떠다녀요.',
        '비둘기': '도시에서도 자주 볼 수 있는 새예요. 회색 몸으로 콩콩 걸어 다녀요.',
        '거위': '몸이 큰 새예요. 물가에서 살고 꽥꽥 소리를 내요.',
        '까치': '검은색과 흰색 깃털이 섞인 새예요. 긴 꼬리를 흔들며 날아다녀요.',
        '학': '다리가 길고 몸이 큰 새예요. 물가에서 천천히 걸으며 먹이를 찾아요.',
        '포도': '작은 알이 송이로 모여 있고 달콤해요. 보라색이나 초록색이 있어요.',
        '치마': '치마는 허리 아래에 입는 옷이에요. 주로 여자들이 입고 걸으면 옷자락이 살랑살랑 움직여요.',
        '한복': '한복은 설날이나 추석 같은 명절에 입는 한국 전통 옷이에요. 저고리와 치마(또는 바지)로 입어요.',
        '브로콜리': '초록 나무처럼 생긴 채소예요. 데쳐 먹으면 부드럽고 맛있어요.',
        '대파': '길고 초록색 줄기가 있어요. 국이나 볶음에 넣으면 향이 좋아져요.',
        '깻잎': '향이 진한 초록 잎채소예요. 밥과 고기를 싸 먹으면 맛있어요.',
        '양파': '겹겹이 층이 있는 채소예요. 익히면 달콤해지고 생으로 먹으면 매워요.',
        '버섯': '비가 온 뒤 잘 자라는 식재료예요. 말랑하고 향이 좋아요.',
        '낚시터': '낚싯줄을 던져 물고기를 기다리는 곳이에요. 물가에서 조심해야 해요.',
        '레미콘차': '큰 통이 빙글빙글 돌아가며 시멘트를 섞어 공사장으로 옮겨요.',
        '마우스': '손으로 움직여 컴퓨터 화면의 화살표를 옮기는 도구예요.',
        '삽': '흙이나 모래를 퍼 올릴 때 쓰는 도구예요. 공사나 정원에서 많이 써요.',
        '열기구': '큰 풍선에 뜨거운 공기를 넣어 하늘로 둥실 떠올라요.',
        '로켓': '강한 힘으로 하늘 높이 올라가 우주로 가는 탈것이에요.'
    };
    const DEFAULT_IMAGE_BASE_URL = '';
    const DEFAULT_CARD_SOUND_MANIFEST_URL = '../sound/card/manifest.json';
    const DEFAULT_CARD_SOUND_BASE_URL = '../sound/card/';
    const EFFECT_SOUND_VOLUME = 0.7;
    const AUDIO_FILES = {
        select: '../sound/select.mp3',
        success: '../sound/correct.mp3',
        wrong: '../sound/error.mp3',
        complete: '../sound/happy_victory.mp3'
    };
    const OFFLINE_ATTEMPT_QUEUE_KEY = 'hahalab_cardlab_quiz_attempt_queue_v1';
    const CATEGORY_ASSET_CACHE_TTL_MS = 1000 * 60 * 4;
    const PRELOAD_BATCH_RADIUS = 1;
    const SELECTION_BACKGROUNDS = [
        'images/bg/s-space-bg.webp'
    ];
    const QUIZ_BACKGROUNDS = [
        'images/bg/city-bg.webp',
        'images/bg/sea-bg.webp',
        'images/bg/animal-bg.webp'
    ];

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
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

    function normalizeAssetType(value) {
        const normalized = normalizeToken(value);
        if (normalized === 'photo' || normalized === '사진' || normalized === '실사') return 'photo';
        if (normalized === 'illust' || normalized === 'illustration' || normalized === '일러스트') return 'illust';
        return normalized || 'unknown';
    }

    function getAssetTypeLabel(type) {
        return type === 'photo' ? '실사' : type === 'illust' ? '일러스트' : '카드';
    }

    function readStoredJson(storage, key) {
        try {
            const raw = storage.getItem(key);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch (_error) {
            return null;
        }
    }

    let verifiedAttemptOwner = null;
    let attemptFlushPromise = null;
    const attemptInFlightKeys = new Set();
    let observedAttemptAuthClient = null;

    function currentAttemptOwner() {
        try {
            const getter = window.getAuthenticatedReportOwner || (window.parent && window.parent !== window && window.parent.getAuthenticatedReportOwner);
            if (typeof getter === 'function') return getter.call(window.parent && window.parent !== window ? window.parent : window);
        } catch (_error) { return null; }
        return verifiedAttemptOwner && verifiedAttemptOwner.expiresAt > Date.now() ? verifiedAttemptOwner : null;
    }

    async function verifyAttemptOwner(client) {
        const current = currentAttemptOwner();
        if (current) return current;
        try {
            if (observedAttemptAuthClient !== client && client.auth?.onAuthStateChange) {
                observedAttemptAuthClient = client;
                client.auth.onAuthStateChange(function () { verifiedAttemptOwner = null; });
            }
            const user = await client.auth.getUser();
            if (user.error || !user.data?.user?.id) return null;
            const [profileResult, active] = await Promise.all([client.rpc('get_my_teacher_profile'), client.rpc('security_session_active')]);
            const profile = Array.isArray(profileResult.data) ? profileResult.data[0] : profileResult.data;
            if (profileResult.error || active.error || active.data !== true || !profile?.teacher_id || !['normal', 'active'].includes(profile.status)) return null;
            verifiedAttemptOwner = { authUserId: user.data.user.id, teacherId: String(profile.teacher_id), expiresAt: Date.now() + 30000 };
            return verifiedAttemptOwner;
        } catch (_error) { verifiedAttemptOwner = null; return null; }
    }

    function readAllQueuedQuizAttempts() {
        const raw = localStorage.getItem(OFFLINE_ATTEMPT_QUEUE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) throw new Error('CARDLAB_PENDING_STORAGE_INVALID');
        return parsed;
    }

    function attemptBelongsToOwner(item, owner, context) {
        return Boolean(item?.runId && item.payload && owner?.authUserId && owner?.teacherId && context?.clientId
            && String(context.teacherId) === String(owner.teacherId)
            && String(item.payload.p_teacher_id) === String(owner.teacherId)
            && String(item.payload.p_client_id) === String(context.clientId));
    }

    function readQueuedQuizAttempts() {
        try { const owner = currentAttemptOwner(); const context = getStoredLabSessionContext();
            return readAllQueuedQuizAttempts().filter(function (item) { return attemptBelongsToOwner(item, owner, context); });
        } catch (_error) { return []; }
    }

    function writeQueuedQuizAttempts(queue) {
        try {
            const raw = JSON.stringify(queue);
            localStorage.setItem(OFFLINE_ATTEMPT_QUEUE_KEY, raw);
            return localStorage.getItem(OFFLINE_ATTEMPT_QUEUE_KEY) === raw;
        } catch (_error) { return false; }
    }

    function attemptJobKey(item) { return JSON.stringify([item?.runId, item?.payload]); }

    function sameAttemptJob(left, right) {
        return left?.runId === right?.runId && JSON.stringify(left?.payload) === JSON.stringify(right?.payload);
    }

    function hasConflictingAttempt(snapshot, queue) {
        return queue.some(function (item) { return item?.runId === snapshot?.runId
            && String(item.payload?.p_teacher_id) === String(snapshot.payload?.p_teacher_id)
            && String(item.payload?.p_client_id) === String(snapshot.payload?.p_client_id)
            && !sameAttemptJob(item, snapshot); });
    }

    function queueQuizAttempt(snapshot) {
        if (!snapshot?.runId || !snapshot.payload) return false;
        try {
            const queue = readAllQueuedQuizAttempts();
            // A pending canonical payload is immutable until its own RPC ACK.
            if (queue.some(function (item) { return sameAttemptJob(item, snapshot); })) return true;
            queue.push({ runId: snapshot.runId, reason: snapshot.reason || 'queued', payload: snapshot.payload, queuedAt: new Date().toISOString() });
            return writeQueuedQuizAttempts(queue);
        } catch (_error) { return false; }
    }

    function removeQueuedQuizAttempt(snapshot, owner) {
        try {
            const context = getStoredLabSessionContext();
            if (!attemptBelongsToOwner(snapshot, owner, context)) return false;
            const latest = readAllQueuedQuizAttempts();
            if (!latest.some(function (item) { return sameAttemptJob(item, snapshot); }) || hasConflictingAttempt(snapshot, latest)) return false;
            return writeQueuedQuizAttempts(latest.filter(function (item) { return !sameAttemptJob(item, snapshot); }));
        } catch (_error) { return false; }
    }

    function flushQueuedQuizAttempts(supabaseClient) {
        if (attemptFlushPromise) return attemptFlushPromise;
        attemptFlushPromise = (async function () {
            if (!supabaseClient || (typeof navigator !== 'undefined' && navigator.onLine === false)) return { flushed: 0, remaining: readQueuedQuizAttempts().length };
            const owner = await verifyAttemptOwner(supabaseClient);
            if (!owner) return { flushed: 0, remaining: 0 };
            const queue = readQueuedQuizAttempts();
            let flushed = 0;
            for (const item of queue) {
                const requestKey = attemptJobKey(item);
                if (attemptInFlightKeys.has(requestKey)) continue;
                attemptInFlightKeys.add(requestKey);
                try {
                    if (hasConflictingAttempt(item, readAllQueuedQuizAttempts())) continue;
                    const now = currentAttemptOwner();
                    if (!now || now.authUserId !== owner.authUserId || !attemptBelongsToOwner(item, now, getStoredLabSessionContext())) break;
                    const result = await supabaseClient.rpc('record_cardlab_learning_attempt', item.payload);
                    // Existing RPC RETURNS void: transport success is its only ACK.
                    if (!result || result.error || result.data != null) throw new Error('CARDLAB_ATTEMPT_ACK_MISMATCH');
                    const after = currentAttemptOwner();
                    if (!after || after.authUserId !== owner.authUserId || !attemptBelongsToOwner(item, after, getStoredLabSessionContext())) break;
                    if (removeQueuedQuizAttempt(item, after)) flushed += 1;
                } catch (_error) { /* Preserve the exact pending original for retry. */ }
                finally { attemptInFlightKeys.delete(requestKey); }
            }
            return { flushed: flushed, remaining: readQueuedQuizAttempts().length };
        })().finally(function () { attemptFlushPromise = null; });
        return attemptFlushPromise;
    }

    function getCardDifficultyScore(card) {
        const name = String(card && (card.nameKo || card.nameEn) || '').trim();
        const description = String(card && card.descriptionKo || '').trim();
        const category = normalizeToken(card && card.category);
        const nameScore = Array.from(name).length * 2;
        const descriptionScore = Math.min(Math.ceil(description.length / 34), 5);
        const abstractCategoryBonus = category === 'electronics' || category === 'object' || category === 'public-place' ? 2 : 0;
        return nameScore + descriptionScore + abstractCategoryBonus;
    }

    function buildProgressiveQuizBatches(cards, cardsPerRound) {
        const sorted = (Array.isArray(cards) ? cards.slice() : []).sort(function (a, b) {
            const difficultyDelta = getCardDifficultyScore(a) - getCardDifficultyScore(b);
            if (difficultyDelta) return difficultyDelta;
            return String(a.nameKo || a.nameEn || '').localeCompare(String(b.nameKo || b.nameEn || ''), 'ko');
        });
        return chunkAssets(sorted, cardsPerRound);
    }

    function shuffleList(items) {
        const next = Array.isArray(items) ? items.slice() : [];
        for (let index = next.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            const current = next[index];
            next[index] = next[swapIndex];
            next[swapIndex] = current;
        }
        return next;
    }

    function getKoreanWordLetters(value) {
        return Array.from(String(value || '').trim().replace(/\s+/g, '')).filter(function (char) {
            return /[가-힣]/.test(char);
        });
    }

    function isLetterQuizCandidate(card) {
        const letters = getKoreanWordLetters(card && card.nameKo);
        return Boolean(card && card.id && card.nameKo && letters.length >= 2 && letters.length <= 4 && letters.length === Array.from(String(card.nameKo).replace(/\s+/g, '')).length);
    }

    function buildLetterChoiceOptions(card, poolCards) {
        const answerLetters = getKoreanWordLetters(card && card.nameKo);
        const options = answerLetters.map(function (letter, index) {
            return { id: 'answer-' + index + '-' + letter, letter: letter, isAnswer: true };
        });
        const used = new Set(answerLetters.map(normalizeToken));
        const distractors = [];
        (Array.isArray(poolCards) ? poolCards : []).forEach(function (item) {
            getKoreanWordLetters(item && item.nameKo).forEach(function (letter) {
                const key = normalizeToken(letter);
                if (!key || used.has(key) || distractors.includes(letter)) return;
                distractors.push(letter);
            });
        });
        ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하'].forEach(function (letter) {
            const key = normalizeToken(letter);
            if (!used.has(key) && !distractors.includes(letter)) distractors.push(letter);
        });
        while (options.length < 4 && distractors.length) {
            const letter = distractors.shift();
            options.push({ id: 'distractor-' + options.length + '-' + letter, letter: letter, isAnswer: false });
        }
        return shuffleList(options).slice(0, 4);
    }

    function buildLetterQuizBatches(cards, questionCount, shouldRandomize) {
        const candidates = (Array.isArray(cards) ? cards : []).filter(isLetterQuizCandidate).sort(function (a, b) {
            const lengthDelta = getKoreanWordLetters(a.nameKo).length - getKoreanWordLetters(b.nameKo).length;
            if (lengthDelta) return lengthDelta;
            return String(a.nameKo || '').localeCompare(String(b.nameKo || ''), 'ko');
        });
        const pool = shouldRandomize ? shuffleList(candidates) : candidates;
        const selected = pool.slice(0, Math.max(1, Math.min(Number(questionCount) || 10, pool.length)));
        return selected.map(function (card) {
            return [{
                ...card,
                answerLetters: getKoreanWordLetters(card.nameKo),
                letterOptions: buildLetterChoiceOptions(card, candidates)
            }];
        });
    }

    function preloadImageUrl(url) {
        const src = String(url || '').trim();
        if (!src) return;
        const image = new Image();
        image.decoding = 'async';
        image.src = src;
    }

    function getStoredLabSessionContext() {
        const launch = window.HahaLabLearningHarness?.readLaunchContext?.();
        if (launch?.teacherId) return { teacherId: launch.teacherId, clientId: launch.clientId || '', clientName: launch.clientName || '', sessionKind: launch.kind || '', currentSession: launch };
        const storedUser = readStoredJson(localStorage, STORAGE_USER_KEY)
            || readStoredJson(sessionStorage, STORAGE_USER_KEY)
            || {};
        const storedPage = readStoredJson(sessionStorage, STORAGE_PAGE_KEY)
            || readStoredJson(localStorage, STORAGE_PAGE_KEY)
            || {};
        const currentSession = storedPage && typeof storedPage.currentSession === 'object'
            ? storedPage.currentSession
            : {};
        const resolvedClient = currentSession.client && typeof currentSession.client === 'object'
            ? currentSession.client
            : {};
        const teacherId = String(
            currentSession.teacherId
            || currentSession.teacher_id
            || storedUser.teacherId
            || storedUser.teacher_id
            || ''
        ).trim();
        const clientId = String(
            currentSession.clientId
            || currentSession.client_id
            || resolvedClient.id
            || ''
        ).trim();
        const clientName = String(
            currentSession.clientName
            || currentSession.client_name
            || resolvedClient.name
            || ''
        ).trim();
        return {
            teacherId: teacherId,
            clientId: clientId,
            clientName: clientName,
            sessionKind: String(currentSession.sessionKind || currentSession.session_kind || '').trim(),
            currentSession: currentSession
        };
    }

    function normalizeSoundPath(value) {
        const text = String(value || '').trim();
        if (!text) return '';
        if (/^(https?:)?\/\//i.test(text) || /^file:/i.test(text) || /^data:/i.test(text) || /^blob:/i.test(text)) return text;
        return text.replace(/^\/+/, '');
    }

    function isMeaningfulText(value) {
        const text = String(value || '').trim();
        return Boolean(text && text !== DEFAULT_DESCRIPTION);
    }

    function hasHangul(value) {
        return /[가-힣]/.test(String(value || ''));
    }

    function getTopicParticle(word) {
        const text = String(word || '').trim();
        if (!text) return '은';
        const lastChar = text.charCodeAt(text.length - 1);
        if (lastChar < 0xac00 || lastChar > 0xd7a3) return '은';
        return ((lastChar - 0xac00) % 28) === 0 ? '는' : '은';
    }

    function getFallbackCardDescription(asset) {
        const name = String((asset && asset.nameKo) || (asset && asset.nameEn) || '').trim();
        const category = normalizeToken(asset && asset.category);
        const override = CARD_DESCRIPTION_OVERRIDES[name];
        if (override) return override;
        const subject = name || '이 카드';
        const particle = getTopicParticle(subject);
        if (category === 'animal' || category === 'bird' || category === 'sea-animal' || category === 'insect') {
            return subject + particle + ' 살아 있는 동물이에요. 눈과 귀로 주변을 살피고 움직이며 살아가요.';
        }
        if (category === 'fruit' || category === 'vegetable' || category === 'food') {
            return subject + particle + ' 먹을 수 있는 음식이에요. 씹어서 먹으면 몸에 힘을 주고 에너지를 채워 줘요.';
        }
        if (category === 'clothing') {
            return subject + particle + ' 몸에 입는 옷이에요. 날씨와 상황에 맞게 입으면 움직이기 편하고 몸을 지켜줘요.';
        }
        if (category === 'electronics' || category === 'object' || category === 'tool') {
            return subject + particle + ' 손으로 쓰는 물건이에요. 필요한 순간에 편리하게 도와줘요.';
        }
        if (category === 'vehicle' || category === 'conveyance' || category === 'craft') {
            return subject + particle + ' 이동할 때 타는 탈것이에요. 사람이나 짐을 옮기도록 도와줘요.';
        }
        if (category === 'public-place' || category === 'livingspace' || category === 'recreation') {
            return subject + particle + ' 사람들이 이용하거나 방문하는 장소예요. 쉬거나 놀거나 필요한 일을 하러 가요.';
        }
        return subject + particle + ' 카드예요. 카드 이름과 특징을 함께 이야기해 보세요.';
    }

    function getCardDisplayDescription(asset) {
        const existing = String(asset && asset.descriptionKo || '').trim();
        if (isMeaningfulText(existing)) return existing;
        return getFallbackCardDescription(asset);
    }

    function showMeaningToast(word, meaning, context = {}) {
        const resolvedMeaning = window.CardlabMeaningResolver && typeof window.CardlabMeaningResolver.resolve === 'function'
            ? window.CardlabMeaningResolver.resolve(word, context)
            : '';
        if (window.CardlabMeaningToast && typeof window.CardlabMeaningToast.show === 'function') {
            window.CardlabMeaningToast.show({ word, meaning: resolvedMeaning || meaning });
        }
    }

    function resolveSoundUrl(value, baseDir) {
        const normalized = normalizeSoundPath(value);
        if (!normalized) return '';
        if (/^(https?:)?\/\//i.test(normalized) || /^file:/i.test(normalized) || /^data:/i.test(normalized) || /^blob:/i.test(normalized)) {
            return normalized;
        }
        const folder = String(baseDir || '').trim();
        if (folder) {
            try {
                const baseUrl = new URL(folder.endsWith('/') ? folder : folder + '/', window.location.href);
                return new URL(normalized, baseUrl).href;
            } catch (_error) {
                // Fall back to browser-relative resolution below.
            }
        }
        if (window.location.protocol === 'file:') {
            const path = normalized.replace(/^\/+/, '');
            if (folder) {
                return new URL(path, folder.endsWith('/') ? folder : folder + '/').href;
            }
            return new URL(path, window.location.href).href;
        }
        return normalized;
    }

    function getCardSoundManifestUrl() {
        return window.location.protocol === 'file:'
            ? DEFAULT_CARD_SOUND_MANIFEST_URL
            : '/sound/card/manifest.json';
    }

    function getDefaultCardSoundBaseUrl() {
        return window.location.protocol === 'file:'
            ? new URL(DEFAULT_CARD_SOUND_BASE_URL, window.location.href).href
            : '/sound/card/';
    }

    function normalizeCategoryOption(option) {
        const queryCategories = Array.isArray(option.queryCategories) && option.queryCategories.length
            ? option.queryCategories.map(function (value) {
                return String(value || '').trim();
            }).filter(Boolean)
            : [String(option.id || '').trim()].filter(Boolean);
        const requiredWords = Array.isArray(option.requiredWords)
            ? option.requiredWords.map(function (value) {
                return String(value || '').trim();
            }).filter(Boolean)
            : [];
        return {
            id: String(option.id || '').trim(),
            label: String(option.label || '').trim(),
            subtitle: String(option.subtitle || option.description || '').trim(),
            coverImage: String(option.coverImage || '').trim(),
            accent: String(option.accent || '').trim(),
            questionCountLabel: String(option.questionCountLabel || '').trim(),
            queryCategories: queryCategories,
            requiredWords: requiredWords
        };
    }

    function getManifestCategoryAssets() {
        const manifest = window.CARDLAB_WEBP_MANIFEST;
        const items = Array.isArray(manifest)
            ? manifest
            : Array.isArray(manifest && manifest.assets)
                ? manifest.assets
                : Array.isArray(manifest && manifest.items)
                    ? manifest.items
                    : [];
        return items;
    }

    function getCategoryOptions(config) {
        const provided = Array.isArray(config.categoryOptions)
            ? config.categoryOptions.map(normalizeCategoryOption).filter(Boolean)
            : [];
        if (config.categoryOptionsOnly) {
            return provided;
        }
        const palette = ['#7cdb9a', '#7fdbff', '#74c8ff', '#f7c84b', '#ff8fa3', '#84d76d', '#ffb84d', '#69d4ff', '#82c1ff', '#a891ff', '#ffb17b', '#85d8ff', '#ff9ecf', '#7fd3b7', '#f4c75d', '#b39bff'];
        const excludedIds = new Set(['state']);
        const coverImageByCategory = new Map();
        const manifestItems = getManifestCategoryAssets();

        manifestItems.forEach(function (item) {
            const id = String(item && item.category || '').trim();
            if (!id || excludedIds.has(id) || coverImageByCategory.has(id)) return;
            const coverImage = String(item && item.file_path || item && item.filePath || item && item.image_url || item && item.imageUrl || '').trim();
            if (coverImage) {
                coverImageByCategory.set(id, coverImage);
            }
        });

        const baseOptions = provided.filter(function (option) {
            return option.id !== 'all' && !excludedIds.has(option.id);
        }).map(function (option) {
            return normalizeCategoryOption({
                ...option,
                coverImage: coverImageByCategory.get(option.id) || option.coverImage
            });
        });

        const derived = [];
        const seen = new Set(baseOptions.map(function (option) {
            return option.id;
        }));

        manifestItems.forEach(function (item, index) {
            const id = String(item && item.category || '').trim();
            if (!id || id === 'all' || excludedIds.has(id) || seen.has(id)) return;
            const label = String(item && item.category_ko || item && item.categoryKo || id).trim() || id;
            const coverImage = coverImageByCategory.get(id) || String(item && item.file_path || item && item.filePath || item && item.image_url || item && item.imageUrl || '').trim();
            derived.push(normalizeCategoryOption({
                id: id,
                label: label + ' 카드 퀴즈',
                queryCategories: [id],
                coverImage: coverImage,
                accent: palette[derived.length % palette.length]
            }));
            seen.add(id);
        });

        const allQueryCategories = baseOptions.concat(derived).map(function (option) {
            return option.id;
        }).filter(function (id) {
            return id && id !== 'all' && !excludedIds.has(id);
        });
        const allCoverImage = baseOptions[0] && baseOptions[0].coverImage
            ? baseOptions[0].coverImage
            : coverImageByCategory.get(allQueryCategories[0]) || '';
        const providedAll = provided.find(function (option) {
            return option.id === 'all';
        }) || null;

        return baseOptions.concat(derived).concat([
            normalizeCategoryOption({
                ...(providedAll || {
                    id: 'all',
                    label: '종합 카드 퀴즈',
                    accent: '#f4c75d'
                }),
                queryCategories: allQueryCategories,
                coverImage: allCoverImage || (providedAll && providedAll.coverImage) || ''
            })
        ]);
    }

    function getSelectedCategoryDefinition(config, categoryId) {
        const normalizedId = String(categoryId || '').trim();
        return getCategoryOptions(config).find(function (item) {
            return item.id === normalizedId;
        }) || null;
    }

    function getCategoryQueryIds(categoryDefinition) {
        if (!categoryDefinition) return [];
        return Array.isArray(categoryDefinition.queryCategories) && categoryDefinition.queryCategories.length
            ? categoryDefinition.queryCategories
            : [categoryDefinition.id].filter(Boolean);
    }

    function getRequiredWordSet(categoryDefinition) {
        const words = Array.isArray(categoryDefinition && categoryDefinition.requiredWords)
            ? categoryDefinition.requiredWords
            : [];
        return new Set(words.map(function (word) {
            return normalizeToken(word);
        }).filter(Boolean));
    }

    function filterAssetsByRequiredWords(assets, categoryDefinition) {
        const requiredWords = getRequiredWordSet(categoryDefinition);
        if (!requiredWords.size) return Array.isArray(assets) ? assets : [];
        return (Array.isArray(assets) ? assets : []).filter(function (item) {
            return requiredWords.has(normalizeToken(item && item.nameKo));
        });
    }

    function getCategoryStepTitle(categoryDefinition, fallbackTitle) {
        if (!categoryDefinition) return fallbackTitle;
        return String(categoryDefinition.label || fallbackTitle || '').trim() || fallbackTitle;
    }

    function maskCardName(value) {
        return String(value || '').replace(/\S/g, '?');
    }

    function goToPreviousLearning() {
        leaveFullscreen();
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

    async function enterFullscreen() {
        return false;
    }

    async function leaveFullscreen() {
        return false;
    }

    function setShellBackground(imagePath) {
        if (!document.body || !document.body.style) return;
        if (document.body.classList.contains('cardlab-essential-word-spell-page')) {
            document.body.style.removeProperty('--shell-page-bg');
            return;
        }
        if (document.body.classList.contains('cardlab-quiz-layered-page')) {
            document.body.style.setProperty('--shell-page-bg', "url('/images/playlab/layers/cardlab-quiz-layer-bg.png')");
            return;
        }
        document.body.style.setProperty('--shell-page-bg', "url('" + imagePath + "')");
    }

    function pickRandomBackground(list) {
        return list[Math.floor(Math.random() * list.length)] || list[0] || '';
    }

    function pickRandomSelectionBackground() {
        return pickRandomBackground(SELECTION_BACKGROUNDS);
    }

    function pickRandomQuizBackground() {
        return pickRandomBackground(QUIZ_BACKGROUNDS);
    }

    function openConfirmModal(elements, state, mode, stopAudio) {
        if (!elements.confirmModal) return;
        if (typeof stopAudio === 'function') stopAudio();
        state.pendingExit = true;
        state.pendingExitAction = mode === 'exit' ? 'exit' : 'category';
        if (elements.confirmModalTitle && elements.confirmModalDesc && elements.confirmModalOk) {
            if (state.pendingExitAction === 'exit') {
                elements.confirmModalTitle.textContent = '학습 종료';
                elements.confirmModalDesc.textContent = '현재 학습을 끝내고 이전 페이지로 돌아갈까요?';
                elements.confirmModalOk.textContent = '학습 종료';
            } else {
                elements.confirmModalTitle.textContent = '카테고리 선택';
                elements.confirmModalDesc.textContent = '현재 학습을 끝내고 카테고리 목록으로 돌아갈까요?';
                elements.confirmModalOk.textContent = '카테고리 선택';
            }
        }
        elements.confirmModal.classList.add('is-active');
        elements.confirmModal.setAttribute('aria-hidden', 'false');
    }

    function closeConfirmModal(elements, state) {
        if (!elements.confirmModal) return;
        state.pendingExit = false;
        state.pendingExitAction = '';
        elements.confirmModal.classList.remove('is-active');
        elements.confirmModal.setAttribute('aria-hidden', 'true');
    }

    function buildImageCandidates(asset, imageBaseUrl) {
        const direct = String(asset.imageUrl || asset.url || '').trim();
        const filePath = String(asset.filePath || '').trim();
        const fileName = String(asset.fileName || '').trim();
        const category = String(asset.category || '').trim();
        const sourceDir = String(asset.sourceDir || '').trim();
        const candidates = [];
        const push = (value) => {
            const next = String(value || '').trim();
            if (!next || candidates.includes(next)) return;
            candidates.push(next);
        };
        const withBase = function (path) {
            const cleaned = String(path || '').trim().replace(/^\/+/, '');
            if (!cleaned) return '';
            return imageBaseUrl ? `${imageBaseUrl}${cleaned}` : cleaned;
        };
        const pushPathFallbacks = function (path) {
            const normalized = String(path || '').trim().replace(/^\/+/, '');
            if (!normalized || /^https?:\/\//i.test(normalized)) return;
            const withoutBig = normalized.replace(/(^|\/)category\/big\//i, '$1category/');
            const withoutDuplicateSuffix = normalized.replace(/ 2(\.[a-z0-9]+)$/i, '$1');
            const withoutBoth = withoutBig.replace(/ 2(\.[a-z0-9]+)$/i, '$1');
            [withoutBig, withoutDuplicateSuffix, withoutBoth].forEach(function (candidate) {
                if (candidate && candidate !== normalized) push(withBase(candidate));
            });
        };

        if (direct) push(direct);
        pushPathFallbacks(direct);

        if (filePath) {
            if (/^https?:\/\//i.test(filePath)) {
                push(filePath);
            } else {
                const normalizedFilePath = filePath.replace(/^\/+/, '');
                const pathLooksGood = /\/category\//i.test(normalizedFilePath) || /\/big\//i.test(normalizedFilePath);
                if (pathLooksGood) {
                    push(withBase(normalizedFilePath));
                }
                if (fileName) {
                    if (category) {
                        push(withBase(`images/category/big/${fileName}`));
                        push(withBase(`images/category/${fileName}`));
                    }
                    if (/\/category\/big\//i.test(sourceDir)) {
                        push(withBase(`images/category/big/${fileName}`));
                    } else if (/\/category\//i.test(sourceDir)) {
                        push(withBase(`images/category/${fileName}`));
                    }
                    push(withBase(`images/${fileName}`));
                }
                push(withBase(normalizedFilePath));
                pushPathFallbacks(normalizedFilePath);
            }
        }

        if (fileName) {
            if (imageBaseUrl) {
                if (category) push(`${imageBaseUrl}images/${category}/${fileName}`);
                push(`${imageBaseUrl}images/${fileName}`);
            } else {
                if (category) push(`images/${category}/${fileName}`);
                push(`images/${fileName}`);
            }
        }

        return candidates;
    }

    function getCategoryCoverCandidates(coverImage) {
        const raw = String(coverImage || '').trim();
        if (!raw) return [];
        const candidates = [];
        const push = function (value) {
            const next = String(value || '').trim();
            if (!next || candidates.includes(next)) return;
            candidates.push(next);
        };
        push(raw);
        if (!/^https?:\/\//i.test(raw)) {
            const withoutBig = raw.replace(/(^|\/)category\/big\//i, '$1category/');
            const withoutDuplicateSuffix = raw.replace(/ 2(\.[a-z0-9]+)$/i, '$1');
            const withoutBoth = withoutBig.replace(/ 2(\.[a-z0-9]+)$/i, '$1');
            [withoutBig, withoutDuplicateSuffix, withoutBoth].forEach(push);
        }
        return candidates.map(function (candidate) {
            return encodeURI(candidate);
        });
    }

    function normalizeAsset(row, imageBaseUrl) {
        const assetType = normalizeAssetType(row.asset_type || row.assetType || row.asset_type_ko || row.assetTypeKo);
        const imageUrlCandidates = buildImageCandidates({
            imageUrl: row.image_url || row.imageUrl,
            url: row.url,
            filePath: row.file_path || row.filePath,
            fileName: row.file_name || row.fileName,
            category: row.category,
            sourceDir: row.source_dir || row.sourceDir
        }, imageBaseUrl);
        return {
            id: String(row.id || '').trim(),
            category: String(row.category || '').trim(),
            categoryKo: String(row.category_ko || row.categoryKo || '').trim(),
            assetType,
            assetTypeLabel: String(row.asset_type_ko || row.assetTypeKo || '').trim() || getAssetTypeLabel(assetType),
            nameKo: String(row.name_ko || row.nameKo || row.name_ko_auto || row.nameKoAuto || '').trim(),
            nameEn: String(row.name_en || row.nameEn || '').trim(),
            descriptionKo: String(row.description_ko || row.descriptionKo || '').trim(),
            nameSoundPath: normalizeSoundPath(row.name_sound_path || row.nameSoundPath || row.name_sound_url || row.nameSoundUrl || ''),
            descriptionSoundPath: normalizeSoundPath(row.description_sound_path || row.descriptionSoundPath || row.description_sound_url || row.descriptionSoundUrl || ''),
            fileName: String(row.file_name || row.fileName || '').trim(),
            filePath: String(row.file_path || row.filePath || '').trim(),
            sourceDir: String(row.source_dir || row.sourceDir || '').trim(),
            sortOrder: Number(row.sort_order || row.sortOrder || 999) || 999,
            imageUrlCandidates: imageUrlCandidates,
            imageUrl: imageUrlCandidates[0] || ''
        };
    }

    function getAssetDedupeKey(asset) {
        const category = normalizeToken(asset && asset.category);
        const assetType = normalizeAssetType(asset && asset.assetType);
        const filePath = normalizeToken(asset && asset.filePath);
        const fileName = normalizeToken(asset && asset.fileName);
        const name = normalizeToken((asset && (asset.nameKo || asset.nameEn)) || '');
        return [category, assetType, filePath || fileName || name].join('|');
    }

    function getAssetPreferenceScore(asset) {
        const filePath = String(asset && asset.filePath || '').trim();
        const sourceDir = String(asset && asset.sourceDir || '').trim();
        const fileName = String(asset && asset.fileName || '').trim();
        let score = 0;

        if (/\/big\//i.test(filePath) || /\/big\//i.test(sourceDir)) score += 40;
        else if (/\/category\//i.test(filePath) || /\/category\//i.test(sourceDir)) score += 20;
        if (/\s2\./.test(fileName) || /\(1\)/.test(fileName)) score -= 5;
        if (!filePath) score -= 20;
        return score;
    }

    function dedupeAssets(list) {
        const map = new Map();
        Array.isArray(list) && list.forEach(function (asset) {
            if (!asset || !asset.id || !asset.nameKo) return;
            const key = getAssetDedupeKey(asset);
            if (!key || key === '||') return;
            const existing = map.get(key);
            if (!existing || getAssetPreferenceScore(asset) > getAssetPreferenceScore(existing)) {
                map.set(key, asset);
            }
        });
        return Array.from(map.values()).sort(function (a, b) {
            const orderA = Number(a.sortOrder || 999);
            const orderB = Number(b.sortOrder || 999);
            if (orderA !== orderB) return orderA - orderB;
            const nameA = String(a.nameKo || a.nameEn || '').localeCompare(String(b.nameKo || b.nameEn || ''), 'ko');
            if (nameA !== 0) return nameA;
            return String(a.fileName || '').localeCompare(String(b.fileName || ''));
        });
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
        const localNameKo = String(localAsset.nameKo || '').trim();
        const remoteDescription = String(remoteAsset.descriptionKo || '').trim();
        const remoteNameKo = String(remoteAsset.nameKo || '').trim();
        return {
            ...remoteAsset,
            ...localAsset,
            category: localAsset.category || remoteAsset.category,
            categoryKo: localAsset.categoryKo || remoteAsset.categoryKo,
            assetType: localAsset.assetType || remoteAsset.assetType,
            assetTypeLabel: localAsset.assetTypeLabel || remoteAsset.assetTypeLabel,
            nameKo: localNameKo || remoteNameKo,
            nameEn: localAsset.nameEn || remoteAsset.nameEn,
            descriptionKo: isMeaningfulText(localDescription) ? localDescription : remoteDescription,
            nameSoundPath: localAsset.nameSoundPath || remoteAsset.nameSoundPath,
            descriptionSoundPath: localAsset.descriptionSoundPath || remoteAsset.descriptionSoundPath,
            imageUrlCandidates: Array.isArray(localAsset.imageUrlCandidates) && localAsset.imageUrlCandidates.length
                ? localAsset.imageUrlCandidates
                : remoteAsset.imageUrlCandidates,
            imageUrl: localAsset.imageUrl || remoteAsset.imageUrl,
            fileName: localAsset.fileName || remoteAsset.fileName,
            filePath: localAsset.filePath || remoteAsset.filePath,
            sourceDir: localAsset.sourceDir || remoteAsset.sourceDir,
            sortOrder: localAsset.sortOrder || remoteAsset.sortOrder
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

    function getSelectedTypeDescription(config, typeId) {
        const type = Array.isArray(config.typeOptions)
            ? config.typeOptions.find(function (item) {
                return item && item.id === typeId;
            })
            : null;
        return String(type && type.description || '').trim();
    }

    function attachImageFallbacks(container) {
        if (!container) return;
        Array.prototype.slice.call(container.querySelectorAll('img[data-image-candidates]')).forEach(function (img) {
            if (!img || img.dataset.fallbackBound === '1') return;
            img.dataset.fallbackBound = '1';
            img.addEventListener('load', function () {
                img.classList.remove('is-image-missing');
                const holder = img.closest('.intro-category-media, .intro-option-media, .quiz-card-media');
                if (holder) holder.classList.remove('is-image-missing');
            });
            img.addEventListener('error', function () {
                const candidates = String(img.getAttribute('data-image-candidates') || '')
                    .split('||')
                    .map(function (value) {
                        return String(value || '').trim();
                    })
                    .filter(Boolean);
                let index = Number(img.dataset.imageFallbackIndex || '0');
                if (Number.isNaN(index)) index = 0;
                if (index >= candidates.length - 1) {
                    img.classList.add('is-image-missing');
                    const holder = img.closest('.intro-category-media, .intro-option-media, .quiz-card-media');
                    if (holder) holder.classList.add('is-image-missing');
                    img.removeAttribute('src');
                    return;
                }
                index += 1;
                img.dataset.imageFallbackIndex = String(index);
                img.src = candidates[index];
            });
        });
    }

    function chunkAssets(list, size) {
        const groups = [];
        for (let index = 0; index < list.length; index += size) {
            groups.push(list.slice(index, index + size));
        }
        return groups;
    }

    function createAudioManager() {
        const cache = new Map();
        let enabled = true;

        function stopAll() {
            cache.forEach(function (audio) {
                try {
                    audio.pause();
                    audio.currentTime = 0;
                } catch (_error) {
                    // ignore
                }
            });
        }

        function play(type) {
            if (!enabled || !AUDIO_FILES[type]) return;
            stopAll();
            let audio = cache.get(type);
            if (!audio) {
                audio = new Audio(AUDIO_FILES[type]);
                audio.preload = 'auto';
                cache.set(type, audio);
            }
            try {
                audio.currentTime = 0;
                if (type === 'success') {
                    audio.volume = EFFECT_SOUND_VOLUME;
                }
                audio.play().catch(function () {
                    enabled = false;
                });
            } catch (_error) {
                enabled = false;
            }
        }

        return { play: play, stopAll: stopAll };
    }

    function createNarrationManager() {
        let activeAudio = null;
        let resolveActive = null;
        let playToken = 0;

        function stop() {
            playToken += 1;
            if (activeAudio) {
                try {
                    activeAudio.pause();
                    activeAudio.currentTime = 0;
                } catch (_error) {
                    // ignore
                }
            }
            if (resolveActive) {
                resolveActive(false);
            }
            activeAudio = null;
            resolveActive = null;
        }

        function playUrl(url, shouldStop) {
            const resolvedUrl = resolveSoundUrl(url);
            if (!resolvedUrl) return Promise.resolve(false);

            if (shouldStop !== false) {
                stop();
            }
            const token = playToken;

            return new Promise(function (resolve) {
                const audio = new Audio(resolvedUrl);
                activeAudio = audio;
                resolveActive = resolve;
                audio.preload = 'auto';

                const finish = function (success) {
                    if (token !== playToken) {
                        resolve(false);
                        return;
                    }
                    if (activeAudio === audio) {
                        activeAudio = null;
                    }
                    resolveActive = null;
                    resolve(Boolean(success));
                };

                audio.addEventListener('ended', function () {
                    finish(true);
                }, { once: true });

                audio.addEventListener('error', function () {
                    finish(false);
                }, { once: true });

                audio.play().catch(function () {
                    finish(false);
                });
            });
        }

        async function playSequence(paths) {
            const list = Array.isArray(paths) ? paths.map(normalizeSoundPath).filter(Boolean) : [];
            if (!list.length) return false;

            stop();
            const token = playToken;
            for (let index = 0; index < list.length; index += 1) {
                if (token !== playToken) return false;
                const played = await playUrl(list[index], false);
                if (!played || token !== playToken) return false;
                if (index < list.length - 1) {
                    await new Promise(function (resolve) {
                        window.setTimeout(resolve, 120);
                    });
                }
            }
            return true;
        }

        async function playGoogleTts(text, apiKey) {
            const key = String(apiKey || '').trim();
            const spokenText = String(text || '').trim();
            if (!key || !spokenText) return false;

            stop();
            try {
                const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + encodeURIComponent(key), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        input: { text: spokenText },
                        voice: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-A' },
                        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.92, pitch: 0 }
                    })
                });
                if (!response.ok) return false;
                const data = await response.json();
                const audioContent = String(data && data.audioContent || '').trim();
                if (!audioContent) return false;
                return playUrl('data:audio/mp3;base64,' + audioContent, false);
            } catch (_error) {
                return false;
            }
        }

        return { stop: stop, playUrl: playUrl, playSequence: playSequence, playGoogleTts: playGoogleTts };
    }

    function createSupabaseClient(config) {
        if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
        return window.supabase.createClient(
            String(config.supabaseUrl || DEFAULT_SUPABASE_URL).trim(),
            String(config.supabaseKey || DEFAULT_SUPABASE_KEY).trim()
        );
    }

    function getPageConfig(input) {
        const cardsPerRound = clamp(Number(input.cardsPerRound || 3) || 3, 3, 3);
        const categoryOptions = Array.isArray(input.categoryOptions) && input.categoryOptions.length
            ? input.categoryOptions.map(normalizeCategoryOption)
            : [
                normalizeCategoryOption({ id: 'animal', label: '동물 카드 퀴즈', queryCategories: ['animal'], coverImage: 'images/category/big/animal-lion-illust.webp', accent: '#7cdb9a' }),
                normalizeCategoryOption({ id: 'bird', label: '조류 카드 퀴즈', queryCategories: ['bird'], coverImage: 'images/category/big/bird-crane-illust.webp', accent: '#7fdbff' }),
                normalizeCategoryOption({ id: 'sea-animal', label: '해양동물 카드 퀴즈', queryCategories: ['sea-animal'], coverImage: 'images/category/big/sea-animal-shrimp-illust.webp', accent: '#74c8ff' }),
                normalizeCategoryOption({ id: 'insect', label: '곤충 카드 퀴즈', queryCategories: ['insect'], coverImage: 'images/category/big/insect-bee-illust.webp', accent: '#f7c84b' }),
                normalizeCategoryOption({ id: 'fruit', label: '과일 카드 퀴즈', queryCategories: ['fruit'], coverImage: 'images/category/big/fruit-mandarin-illust.webp', accent: '#ff8fa3' }),
                normalizeCategoryOption({ id: 'vegetable', label: '채소 카드 퀴즈', queryCategories: ['vegetable'], coverImage: 'images/category/big/vegetable-cucumber-illust.webp', accent: '#84d76d' }),
                normalizeCategoryOption({ id: 'food', label: '음식 카드 퀴즈', queryCategories: ['food'], coverImage: 'images/category/big/food-hamburger-illust.webp', accent: '#ffb84d' }),
                normalizeCategoryOption({ id: 'play', label: '놀이 카드 퀴즈', queryCategories: ['play'], coverImage: 'images/category/play-swing-illust.webp', accent: '#f6c65b' }),
                normalizeCategoryOption({ id: 'conveyance', label: '탈것 카드 퀴즈', queryCategories: ['conveyance'], coverImage: 'images/category/conveyance-scooter-illust.webp', accent: '#69d4ff' }),
                normalizeCategoryOption({ id: 'vehicle', label: '차량 카드 퀴즈', queryCategories: ['vehicle'], coverImage: 'images/category/vehicle-car-illust.webp', accent: '#82c1ff' }),
                normalizeCategoryOption({ id: 'electronics', label: '가전·전자기기 카드 퀴즈', queryCategories: ['electronics'], coverImage: 'images/category/electronics-television-illust.webp', accent: '#a891ff' }),
                normalizeCategoryOption({ id: 'object', label: '생활용품 카드 퀴즈', queryCategories: ['object'], coverImage: 'images/category/object-clock-illust.webp', accent: '#ffb17b' }),
                normalizeCategoryOption({ id: 'school-supplies', label: '학용품 카드 퀴즈', queryCategories: ['school-supplies'], coverImage: 'images/category/big/school-supplies-pencil-case-illust.webp', accent: '#85d8ff' }),
                normalizeCategoryOption({ id: 'clothing', label: '의복 및 악세사리 카드 퀴즈', queryCategories: ['clothing'], coverImage: 'images/category/big/clothing-coat-illust.webp', accent: '#ff9ecf' }),
                normalizeCategoryOption({ id: 'public-place', label: '장소 카드 퀴즈', queryCategories: ['public-place'], coverImage: 'images/category/big/public-place-post-office-illust.webp', accent: '#7fd3b7' }),
                normalizeCategoryOption({ id: 'all', label: '종합 카드 퀴즈', queryCategories: ['animal', 'bird', 'sea-animal', 'insect', 'fruit', 'vegetable', 'food', 'play', 'conveyance', 'vehicle', 'craft', 'electronics', 'object', 'school-supplies', 'clothing', 'livingspace', 'public-place', 'recreation'], coverImage: 'images/category/big/craft-balloon-illust.webp', accent: '#f4c75d' })
            ];
        return {
            title: String(input.title || '카드 퀴즈').trim(),
            subtitle: String(input.subtitle || '카테고리를 선택해 시작해 보세요.').trim(),
            description: String(input.description || '원하는 카드 모드를 눌러 바로 시작해 보세요.').trim(),
            categoryIntroBadge: String(input.categoryIntroBadge || '').trim(),
            categoryIntroTitle: String(input.categoryIntroTitle || '').trim(),
            categoryIntroSubtitle: String(input.categoryIntroSubtitle || '').trim(),
            categoryOptionsOnly: Boolean(input.categoryOptionsOnly),
            skipTypeSelection: Boolean(input.skipTypeSelection),
            hideSyncStatus: Boolean(input.hideSyncStatus),
            autoAdvanceOnLetterComplete: Boolean(input.autoAdvanceOnLetterComplete),
            autoAdvanceDelayMs: Math.max(350, Math.min(2500, Number(input.autoAdvanceDelayMs) || 900)),
            randomizeLetterQuestions: Boolean(input.randomizeLetterQuestions),
            curriculumKey: String(input.curriculumKey || CARD_SHELL_CURRICULUM_KEY).trim(),
            stageKey: String(input.stageKey || CARD_SHELL_STAGE_KEY).trim(),
            stageOrder: Math.max(1, Math.round(Number(input.stageOrder) || CARD_SHELL_STAGE_ORDER)),
            reportTitle: String(input.reportTitle || '').trim(),
            reportSummary: String(input.reportSummary || '').trim(),
            pageTitle: String(input.pageTitle || 'CardLab: 카드 퀴즈').trim(),
            gameId: String(input.gameId || 'cardlab-quiz-animal-001').trim(),
            cardsPerRound: cardsPerRound,
            quizMode: String(input.quizMode || 'card').trim(),
            quizQuestionCount: Math.max(1, Math.min(24, Number(input.quizQuestionCount) || 10)),
            imageBaseUrl: String(input.imageBaseUrl || DEFAULT_IMAGE_BASE_URL).trim(),
            cloudinaryCloudName: String(input.cloudinaryCloudName || '').trim(),
            cloudinaryFetchTransform: String(input.cloudinaryFetchTransform || 'f_auto,q_auto,c_limit,w_640,dpr_auto').trim(),
            soundManifestUrl: String(input.soundManifestUrl || '').trim(),
            soundBaseUrl: String(input.soundBaseUrl || '').trim(),
            googleTtsApiKey: String(input.googleTtsApiKey || '').trim(),
            categoryOptions: categoryOptions,
            typeOptions: Array.isArray(input.typeOptions) && input.typeOptions.length
                ? input.typeOptions.map(function (item) {
                    return {
                        id: normalizeAssetType(item.id),
                        label: String(item.label || getAssetTypeLabel(item.id)).trim(),
                        description: String(item.description || '').trim()
                    };
                })
                : [
                    { id: 'photo', label: '실사', description: '실제 사진 카드로 동물을 알아보는 연습이에요.' },
                    { id: 'illust', label: '일러스트', description: '친근한 그림 카드로 이름을 말해보는 연습이에요.' }
                ],
            supabaseUrl: String(input.supabaseUrl || DEFAULT_SUPABASE_URL).trim(),
            supabaseKey: String(input.supabaseKey || DEFAULT_SUPABASE_KEY).trim()
        };
    }

    function createCardQuizPage(rawConfig) {
        const config = getPageConfig(rawConfig || {});
        const supabase = createSupabaseClient(config);
        const audio = createAudioManager();
        const narration = createNarrationManager();
        const cardSoundManifestUrl = String(config.soundManifestUrl || '').trim() || getCardSoundManifestUrl();
        const configuredSoundBaseUrl = String(config.soundBaseUrl || '').trim();
        let cardSoundBaseUrl = configuredSoundBaseUrl
            ? new URL(configuredSoundBaseUrl, window.location.href).href
            : getDefaultCardSoundBaseUrl();

        const elements = {
            introScreen: document.getElementById('introScreen'),
            introPanel: document.getElementById('introPanel'),
            quizScreen: document.getElementById('quizScreen'),
            emptyScreen: document.getElementById('emptyScreen'),
            completeScreen: document.getElementById('completeScreen'),
            introBadge: document.getElementById('introBadge'),
            introTitle: document.getElementById('introTitle'),
            introSubtitle: document.getElementById('introSubtitle'),
            introDescription: document.getElementById('introDescription'),
            introOptions: document.getElementById('introOptions'),
            introStatus: document.getElementById('introStatus') || document.getElementById('introDescription'),
            introBackButton: document.getElementById('introBackButton'),
            shellTitle: document.getElementById('shellTitle'),
            shellStageLabel: document.getElementById('shellStageLabel'),
            helpButton: document.getElementById('helpButton'),
            stageTitle: document.getElementById('stageTitle'),
            stageDescription: document.getElementById('stageDescription'),
            progressChip: document.getElementById('progressChip'),
            rewardPanel: document.getElementById('rewardPanel'),
            rewardLevel: document.getElementById('rewardLevel'),
            rewardMessage: document.getElementById('rewardMessage'),
            rewardStars: document.getElementById('rewardStars'),
            rewardGate: document.getElementById('rewardGate'),
            syncStatus: document.getElementById('syncStatus'),
            track: document.getElementById('quizTrack'),
            infoTitle: document.getElementById('infoTitle'),
            infoDescription: document.getElementById('infoDescription'),
            infoSpeakerButton: document.getElementById('infoSpeakerButton'),
            prevButton: document.getElementById('prevBatchButton'),
            nextButton: document.getElementById('nextBatchButton'),
            homeButtons: Array.prototype.slice.call(document.querySelectorAll('[data-action="home"]')),
            exitButtons: Array.prototype.slice.call(document.querySelectorAll('[data-action="exit"]')),
            retryButton: document.getElementById('retryButton'),
            completeHomeButton: document.getElementById('completeHomeButton'),
            emptyHomeButton: document.getElementById('emptyHomeButton'),
            completeTitle: document.getElementById('completeTitle'),
            completeDescription: document.getElementById('completeDescription'),
            completeResultScore: document.getElementById('completeResultScore'),
            completeResultAccuracy: document.getElementById('completeResultAccuracy'),
            completeResultWrongCount: document.getElementById('completeResultWrongCount'),
            completeResultDuration: document.getElementById('completeResultDuration'),
            emptyDescription: document.getElementById('emptyDescription'),
            confirmModal: document.getElementById('confirmModal'),
            confirmModalTitle: document.getElementById('confirmModalTitle'),
            confirmModalDesc: document.getElementById('confirmModalDesc'),
            confirmModalOk: document.getElementById('confirmModalOk'),
            confirmModalCancel: document.getElementById('confirmModalCancel'),
            headerCategoryButton: document.querySelector('[data-action="change-category"]')
        };

        const state = {
            introStep: 'categories',
            selectedCategoryId: '',
            selectedCategory: null,
            loadedCategoryKey: '',
            loadingCategoryId: '',
            quizBackground: '',
            loadErrorText: '',
            assetsByType: { photo: [], illust: [] },
            selectedType: '',
            batches: [],
            currentBatchIndex: 0,
            selectedByBatch: {},
            viewedByBatch: {},
            letterProgressByBatch: {},
            wrongAttemptsByBatch: {},
            quizRunId: '',
            quizStartedAt: '',
            savedRunIds: {},
            isLoading: false,
            autoAdvanceTimer: 0,
            nextPromptTimer: 0,
            completed: false,
            pendingExit: false,
            pendingExitAction: ''
        };
        const cardSoundLookup = new Map();
        const cardDescriptionSoundLookup = new Map();
        const cardAssetManifest = [];
        const categoryAssetCache = new Map();
        let quizToastTimer = 0;
        let cardSoundManifestLoaded = false;
        let cardSoundManifestPromise = null;
        let cardAssetManifestLoaded = false;

        function stopAllAudio() {
            narration.stop();
            audio.stopAll();
        }

        function updateSyncStatus(message) {
            if (!elements.syncStatus) return;
            if (config.hideSyncStatus) {
                elements.syncStatus.textContent = '';
                elements.syncStatus.classList.add('shell-hidden');
                elements.syncStatus.classList.remove('is-offline', 'is-pending');
                return;
            }
            const queuedCount = readQueuedQuizAttempts().length;
            const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
            const text = String(message || '').trim()
                || (isOffline ? '오프라인 저장 중' : queuedCount ? '저장 대기 ' + queuedCount + '건' : '');
            elements.syncStatus.textContent = text;
            elements.syncStatus.classList.toggle('shell-hidden', !text);
            elements.syncStatus.classList.toggle('is-offline', isOffline);
            elements.syncStatus.classList.toggle('is-pending', Boolean(queuedCount && !isOffline));
        }

        function showCommonQuestionFeedback(kind) {
            const normalizedKind = kind === 'wrong' ? 'wrong' : 'correct';
            if (window.HahaFeedbackOverlay && typeof window.HahaFeedbackOverlay.showQuestionComplete === 'function') {
                window.HahaFeedbackOverlay.showQuestionComplete(normalizedKind, { sound: true });
                return;
            }
            audio.play(normalizedKind === 'wrong' ? 'wrong' : 'success');
        }

        function isLetterWordQuizMode() {
            return config.quizMode === 'letter-word';
        }

        async function syncQueuedQuizAttempts() {
            const status = await flushQueuedQuizAttempts(supabase);
            if (status.flushed) {
                updateSyncStatus(status.remaining ? '저장 대기 ' + status.remaining + '건' : '저장 완료');
                window.setTimeout(function () {
                    updateSyncStatus();
                }, 1800);
                return;
            }
            updateSyncStatus();
        }

        function normalizeSoundLookupText(value) {
            return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
        }

        function getCardSoundPathForText(text) {
            const key = normalizeSoundLookupText(text);
            return key ? (cardSoundLookup.get(key) || '') : '';
        }

        function getCardDescriptionSoundPathForText(text) {
            const key = normalizeSoundLookupText(text);
            return key ? (cardDescriptionSoundLookup.get(key) || '') : '';
        }

        function setSoundLookup(map, value, filePath) {
            const normalizedText = normalizeSoundLookupText(value);
            if (normalizedText && filePath) {
                map.set(normalizedText, filePath);
            }
        }

        function addCardSoundManifestItem(item) {
            if (!item) return;
            const filePath = String(item.filePath || item.file_path || '').trim();
            if (!filePath) return;
            const kind = String(item.kind || '').trim().toLowerCase();
            const textKeys = [item.normalizedText, item.text];
            const nameKeys = [item.name_ko, item.nameKo, item.word, item.label, item.title];
            const descriptionKeys = [item.description_ko, item.descriptionKo];
            const lookupValues = kind === 'name'
                ? textKeys.concat(nameKeys)
                : kind === 'description'
                    ? textKeys.concat(descriptionKeys)
                    : textKeys.concat(nameKeys, descriptionKeys);
            lookupValues.forEach(function (value) {
                setSoundLookup(cardSoundLookup, value, filePath);
            });
            if (kind === 'description') {
                textKeys.concat(descriptionKeys, nameKeys).forEach(function (value) {
                    setSoundLookup(cardDescriptionSoundLookup, value, filePath);
                });
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
            items.forEach(function (item) {
                addCardSoundManifestItem(item);
            });
            cardSoundManifestLoaded = true;
            return true;
        }

        async function loadCardSoundManifest() {
            if (cardSoundManifestLoaded) return;
            if (cardSoundManifestPromise) return cardSoundManifestPromise;
            if (loadEmbeddedCardSoundManifest()) return;
            cardSoundManifestPromise = (async function () {
                try {
                    const resolvedManifestUrl = new URL(cardSoundManifestUrl, window.location.href).href;
                    const response = await fetch(resolvedManifestUrl, { cache: 'no-store' });
                    if (!response.ok) return;
                    const manifest = await response.json();
                    const items = Array.isArray(manifest && manifest.items)
                        ? manifest.items
                        : Array.isArray(manifest && manifest.assets)
                            ? manifest.assets
                            : [];
                    cardSoundBaseUrl = configuredSoundBaseUrl
                        ? new URL(configuredSoundBaseUrl, window.location.href).href
                        : new URL('.', resolvedManifestUrl).href;
                    items.forEach(function (item) {
                        addCardSoundManifestItem(item);
                    });
                } catch (_error) {
                    // ignore manifest loading failures; DB paths still work
                } finally {
                    cardSoundManifestLoaded = true;
                    cardSoundManifestPromise = null;
                }
            })();
            return cardSoundManifestPromise;
        }

        async function loadCardAssetManifest() {
            if (cardAssetManifestLoaded) return cardAssetManifest;
            const embeddedManifest = window.CARDLAB_WEBP_MANIFEST;
            const embeddedItems = Array.isArray(embeddedManifest)
                ? embeddedManifest
                : Array.isArray(embeddedManifest && embeddedManifest.items)
                    ? embeddedManifest.items
                    : Array.isArray(embeddedManifest && embeddedManifest.assets)
                        ? embeddedManifest.assets
                    : [];
            if (embeddedItems.length) {
                cardAssetManifest.length = 0;
                embeddedItems.forEach(function (row) {
                    cardAssetManifest.push(normalizeAsset(row, config.imageBaseUrl));
                });
                const dedupedEmbedded = dedupeAssets(cardAssetManifest);
                cardAssetManifest.length = 0;
                dedupedEmbedded.forEach(function (item) {
                    cardAssetManifest.push(item);
                });
                cardAssetManifestLoaded = true;
                return cardAssetManifest;
            }
            try {
                const response = await fetch('webp-manifest.json', { cache: 'no-store' });
                if (!response.ok) return cardAssetManifest;
                const manifest = await response.json();
                const items = Array.isArray(manifest && manifest.items)
                    ? manifest.items
                    : Array.isArray(manifest && manifest.assets)
                        ? manifest.assets
                        : [];
                cardAssetManifest.length = 0;
                items.forEach(function (row) {
                    cardAssetManifest.push(normalizeAsset(row, config.imageBaseUrl));
                });
                const dedupedFetched = dedupeAssets(cardAssetManifest);
                cardAssetManifest.length = 0;
                dedupedFetched.forEach(function (item) {
                    cardAssetManifest.push(item);
                });
            } catch (_error) {
                // ignore local manifest load failures
            } finally {
                cardAssetManifestLoaded = true;
            }
            return cardAssetManifest;
        }

        function getCardNarrationPath(card, key) {
            const rawPath = String(card && card[key] ? card[key] : '').trim();
            if (rawPath) return rawPath;
            if (key === 'nameSoundPath') {
                return getCardSoundPathForText(card && card.nameKo);
            }
            if (key === 'descriptionSoundPath') {
                return getCardDescriptionSoundPathForText(card && card.descriptionKo)
                    || getCardDescriptionSoundPathForText(card && card.nameKo)
                    || getCardSoundPathForText(card && card.descriptionKo);
            }
            return '';
        }

        async function playCardNarration(card, includeDescription) {
            stopAllAudio();
            await loadCardSoundManifest();

            const spokenText = includeDescription
                ? [String(card && card.nameKo || '').trim(), String(card && card.descriptionKo || '').trim()].filter(Boolean).join('. ')
                : String(card && card.nameKo || '').trim();
            const namePath = getCardNarrationPath(card, 'nameSoundPath');
            const descriptionPath = getCardNarrationPath(card, 'descriptionSoundPath');
            const soundBaseUrl = cardSoundBaseUrl || getDefaultCardSoundBaseUrl();

            const tryPlayPaths = async function (paths) {
                const resolvedPaths = Array.isArray(paths)
                    ? paths.map(function (path) {
                        return resolveSoundUrl(path, soundBaseUrl);
                    }).filter(Boolean)
                    : [];
                if (!resolvedPaths.length) return false;
                return narration.playSequence(resolvedPaths);
            };

            const tryPlayLookup = async function (text) {
                const localPath = getCardSoundPathForText(text);
                if (!localPath) return false;
                return tryPlayPaths([localPath]);
            };

            if (includeDescription) {
                if (namePath && descriptionPath && await tryPlayPaths([namePath, descriptionPath])) return true;
                if (descriptionPath && await tryPlayPaths([descriptionPath])) return true;
                if (await tryPlayLookup(card && card.descriptionKo)) return true;
                if (await tryPlayLookup(spokenText)) return true;
            } else if (namePath) {
                if (await tryPlayPaths([namePath])) return true;
                if (await tryPlayLookup(spokenText)) return true;
            } else if (await tryPlayLookup(card && card.nameKo)) {
                return true;
            }
            if (config.googleTtsApiKey && spokenText) {
                const playedTts = await narration.playGoogleTts(spokenText, config.googleTtsApiKey);
                if (playedTts) return true;
            }
            if (includeDescription) {
                if (await tryPlayPaths([namePath, descriptionPath])) return true;
            } else if (await tryPlayPaths([namePath])) {
                return true;
            }
            return false;
        }

        function clearTimer() {
            stopAllAudio();
            if (state.autoAdvanceTimer) {
                window.clearTimeout(state.autoAdvanceTimer);
                state.autoAdvanceTimer = 0;
            }
            if (state.nextPromptTimer) {
                window.clearTimeout(state.nextPromptTimer);
                state.nextPromptTimer = 0;
            }
            if (elements.nextButton) {
                elements.nextButton.classList.remove('is-throbbing');
            }
        }

        function showScreen(screenName) {
            const screens = {
                intro: elements.introScreen,
                quiz: elements.quizScreen,
                empty: elements.emptyScreen,
                complete: elements.completeScreen
            };
            Object.keys(screens).forEach(function (key) {
                const node = screens[key];
                if (!node) return;
                node.classList.toggle('is-active', key === screenName);
            });
            if (elements.shellStageLabel) {
                elements.shellStageLabel.classList.toggle('shell-hidden', screenName === 'intro');
            }
        }

        function getSelectedCategoryLabel() {
            return getCategoryStepTitle(state.selectedCategory, config.title);
        }

        function getModeCount(type) {
            return Array.isArray(state.assetsByType[type]) ? state.assetsByType[type].length : 0;
        }

        function getOptimizedImageUrl(url) {
            const source = String(url || '').trim();
            if (!source || !config.cloudinaryCloudName) return source;
            let resolved = '';
            try {
                resolved = new URL(source, window.location.href).href;
            } catch (_error) {
                return source;
            }
            if (!/^https?:\/\//i.test(resolved) || /\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(resolved)) {
                return source;
            }
            const transform = encodeURIComponent(config.cloudinaryFetchTransform || 'f_auto,q_auto,c_limit,w_640,dpr_auto')
                .replace(/%2C/gi, ',')
                .replace(/%2F/gi, '/');
            return 'https://res.cloudinary.com/' + encodeURIComponent(config.cloudinaryCloudName) + '/image/fetch/' + transform + '/' + encodeURIComponent(resolved);
        }

        function getOptimizedImageCandidates(card) {
            const rawCandidates = Array.isArray(card && card.imageUrlCandidates) && card.imageUrlCandidates.length
                ? card.imageUrlCandidates
                : [card && card.imageUrl].filter(Boolean);
            const optimized = rawCandidates.map(getOptimizedImageUrl).filter(Boolean);
            return optimized.length ? optimized : rawCandidates;
        }

        function preloadNearbyBatchImages() {
            const firstIndex = Math.max(0, state.currentBatchIndex - PRELOAD_BATCH_RADIUS);
            const lastIndex = Math.min(state.batches.length - 1, state.currentBatchIndex + PRELOAD_BATCH_RADIUS);
            for (let batchIndex = firstIndex; batchIndex <= lastIndex; batchIndex += 1) {
                (state.batches[batchIndex] || []).forEach(function (card) {
                    const imageCandidates = getOptimizedImageCandidates(card);
                    preloadImageUrl(imageCandidates[0] || '');
                });
            }
        }

        function getIntroDescription() {
            if (state.loadErrorText) {
                return state.loadErrorText;
            }
            if (state.introStep === 'categories') {
                return '';
            }
            if (state.isLoading) {
                return '카드를 불러오는 중이에요.';
            }
            if (state.selectedCategory) {
                return '원하는 카드 모드를 눌러 바로 시작해 보세요.';
            }
            return '카테고리를 선택해 시작해 보세요.';
        }

        function updateIntroState() {
            if (elements.helpButton) {
                elements.helpButton.classList.toggle('shell-hidden', state.introStep !== 'categories');
            }
            if (elements.headerCategoryButton) {
                elements.headerCategoryButton.classList.toggle('shell-hidden', state.introStep === 'categories');
            }
            if (elements.homeButtons) {
                elements.homeButtons.forEach(function (button) {
                    button.textContent = state.introStep === 'categories' ? '종료' : '카테고리 선택';
                });
            }
            if (elements.introBackButton) {
                elements.introBackButton.classList.toggle('shell-hidden', state.introStep === 'categories');
            }
            if (elements.introPanel) {
                elements.introPanel.classList.toggle('is-types', state.introStep !== 'categories');
                elements.introPanel.classList.toggle('is-category-list', state.introStep === 'categories');
            }

            if (state.introStep === 'categories') {
                if (elements.shellTitle) {
                    elements.shellTitle.textContent = '';
                    elements.shellTitle.classList.add('shell-hidden');
                }
                if (elements.shellStageLabel) {
                    elements.shellStageLabel.textContent = '';
                    elements.shellStageLabel.classList.add('shell-hidden');
                }
                if (elements.introBadge) {
                    elements.introBadge.textContent = config.categoryIntroBadge || '';
                    elements.introBadge.classList.toggle('shell-hidden', !config.categoryIntroBadge);
                }
                elements.introTitle.textContent = config.categoryIntroTitle || '';
                elements.introTitle.classList.toggle('shell-hidden', !config.categoryIntroTitle);
                elements.introSubtitle.textContent = config.categoryIntroSubtitle || '';
                elements.introSubtitle.classList.toggle('shell-hidden', !config.categoryIntroSubtitle);
                elements.introDescription.textContent = '';
                elements.introDescription.classList.add('shell-hidden');
                return;
            }

            const categoryLabel = getSelectedCategoryLabel();
            if (elements.shellTitle) {
                elements.shellTitle.textContent = categoryLabel;
                elements.shellTitle.classList.add('shell-hidden');
            }
            if (elements.introBadge) {
                elements.introBadge.textContent = '';
                elements.introBadge.classList.add('shell-hidden');
            }
            elements.introTitle.textContent = categoryLabel;
            elements.introTitle.classList.remove('shell-hidden');
            elements.introSubtitle.textContent = '';
            elements.introSubtitle.classList.add('shell-hidden');
            elements.introDescription.textContent = getIntroDescription();
            elements.introDescription.classList.remove('shell-hidden');
        }

        function renderIntroOptions() {
            if (state.introStep === 'categories') {
                elements.introOptions.className = 'intro-options intro-category-grid';
                elements.introOptions.innerHTML = getCategoryOptions(config).map(function (category) {
                    const disabled = state.isLoading;
                    const coverCandidates = getCategoryCoverCandidates(category.coverImage);
                    const coverMarkup = coverCandidates[0]
                        ? '    <img class="intro-category-image" src="' + escapeHtml(coverCandidates[0]) + '" alt="' + escapeHtml(String(category.label || '카드 퀴즈')) + '"' + (coverCandidates.length > 1 ? ' data-image-candidates="' + escapeHtml(coverCandidates.join('||')) + '"' : '') + ' data-image-fallback-index="0" loading="eager" decoding="async">'
                        : '';
                    const tintStyle = category.accent ? ' style="--category-accent:' + escapeHtml(category.accent) + ';"' : '';
                    const labelText = String(category.label || '').trim();
                    const wordCount = Array.isArray(category.requiredWords) ? category.requiredWords.length : 0;
                    const chipText = category.questionCountLabel || (wordCount ? String(wordCount) + '개 단어' : 'GO');
                    return '' +
                        '<button type="button" class="intro-category-card" data-category-id="' + escapeHtml(category.id) + '"' + (disabled ? ' disabled' : '') + '>' +
                        '  <div class="intro-category-media">' +
                        coverMarkup +
                        '  </div>' +
                        '  <div class="intro-category-shade"' + tintStyle + '></div>' +
                        '  <div class="intro-category-copy">' +
                        '    <div class="intro-category-label">' + escapeHtml(labelText) + '</div>' +
                        '    <div class="intro-category-chip">' + escapeHtml(chipText) + '</div>' +
                        '  </div>' +
                        '</button>';
                }).join('');

                Array.prototype.slice.call(elements.introOptions.querySelectorAll('[data-category-id]')).forEach(function (button) {
                    button.addEventListener('click', function () {
                        const categoryId = String(button.getAttribute('data-category-id') || '').trim();
                        selectCategory(categoryId);
                    });
                });

                attachImageFallbacks(elements.introOptions);
                window.requestAnimationFrame(updateCategoryLabelLayout);
                updateIntroState();
                return;
            }

            elements.introOptions.className = 'intro-options intro-options-inline intro-type-grid';
            elements.introOptions.innerHTML = config.typeOptions.map(function (option) {
                const count = getModeCount(option.id);
                const disabled = count < config.cardsPerRound;
                const previewAsset = getTypePreviewAsset(option.id);
                const previewUrl = previewAsset && previewAsset.imageUrl ? encodeURI(getOptimizedImageUrl(previewAsset.imageUrl)) : '';
                const previewName = previewAsset && previewAsset.nameKo ? previewAsset.nameKo : option.label;
                const tone = getTypeChoiceTone(option.id);
                return '' +
                    '<button type="button" class="intro-option-card intro-option-card-' + escapeHtml(option.id) + '" data-type="' + escapeHtml(option.id) + '" style="--type-accent:' + escapeHtml(tone.accent) + ';--type-shadow:' + escapeHtml(tone.shadow) + ';"' + (disabled ? ' disabled' : '') + '>' +
                    '  <div class="intro-option-media">' +
                    '    <div class="intro-option-burst"></div>' +
                    (previewUrl ? '    <img class="intro-option-image" src="' + escapeHtml(previewUrl) + '" alt="' + escapeHtml(previewName + ' ' + option.label) + '" loading="eager">' : '') +
                    '    <div class="intro-option-badge">' + escapeHtml(tone.badge) + '</div>' +
                    '  </div>' +
                    '  <div class="intro-option-top">' +
                    '    <div class="intro-option-name">' + escapeHtml(option.label) + '</div>' +
                    '    <div class="intro-option-desc">' + escapeHtml(option.description || '') + '</div>' +
                    '    <div class="intro-option-count">' + escapeHtml(String(count)) + '장 준비</div>' +
                    '  </div>' +
                    '</button>';
            }).join('');

                Array.prototype.slice.call(elements.introOptions.querySelectorAll('[data-type]')).forEach(function (button) {
                    button.addEventListener('click', function () {
                        const type = normalizeAssetType(button.getAttribute('data-type'));
                        if (getModeCount(type) < config.cardsPerRound) return;
                        stopAllAudio();
                        state.selectedType = type;
                        audio.play('select');
                        startQuiz();
                    });
                });

            updateIntroState();
        }

        function updateCategoryLabelLayout() {
            if (!elements.introOptions || state.introStep !== 'categories') return;
            Array.prototype.slice.call(elements.introOptions.querySelectorAll('.intro-category-label')).forEach(function (labelEl) {
                labelEl.style.fontSize = '';
            });
        }

        function getTypePreviewAsset(type) {
            const list = Array.isArray(state.assetsByType[type]) ? state.assetsByType[type] : [];
            return list.find(function (asset) {
                return asset && asset.imageUrl;
            }) || list[0] || null;
        }

        function getTypeChoiceTone(type) {
            return type === 'photo'
                ? { accent: '#21b7e8', shadow: '#1683bf', badge: 'REAL' }
                : { accent: '#ff7cb6', shadow: '#c84b8e', badge: 'ART' };
        }

        function applyLoadedCategoryAssets(assets, queryKey) {
            const list = Array.isArray(assets) ? assets : [];
            state.assetsByType.photo = list.filter(function (item) {
                return item.assetType === 'photo';
            });
            state.assetsByType.illust = list.filter(function (item) {
                return item.assetType === 'illust';
            });
            state.loadedCategoryKey = queryKey || state.loadedCategoryKey;
            state.loadErrorText = '';
            if (!(config.skipTypeSelection && state.selectedType)) {
                renderIntroOptions();
            }
        }

        async function loadCategoryAssets(categoryDefinition) {
            if (!categoryDefinition) return false;
            state.isLoading = true;
            state.loadingCategoryId = categoryDefinition.id;
            elements.introDescription.textContent = '카드를 불러오는 중이에요.';

            const queryIds = getCategoryQueryIds(categoryDefinition);
            const queryKey = categoryDefinition.id + ':' + queryIds.join(',');
            const cached = categoryAssetCache.get(queryKey);
            if (cached && Date.now() - cached.createdAt < CATEGORY_ASSET_CACHE_TTL_MS) {
                applyLoadedCategoryAssets(cached.assets, queryKey);
                state.isLoading = false;
                state.loadingCategoryId = '';
                updateIntroState();
                return cached.assets;
            }
            const localAssets = await loadCardAssetManifest();
            const localMatches = filterAssetsByRequiredWords(dedupeAssets(Array.isArray(localAssets) ? localAssets.filter(function (item) {
                if (!item || !item.id || !item.nameKo) return false;
                if (item.assetType !== 'photo' && item.assetType !== 'illust') return false;
                return queryIds.includes(item.category);
            }) : []), categoryDefinition);
            if (localMatches.length && state.loadingCategoryId === categoryDefinition.id && state.selectedCategoryId === categoryDefinition.id) {
                applyLoadedCategoryAssets(localMatches, queryKey);
            }
            if (localMatches.length && getRequiredWordSet(categoryDefinition).size) {
                categoryAssetCache.set(queryKey, { assets: localMatches, createdAt: Date.now() });
                return localMatches;
            }
            let remoteMatches = [];

            try {
                if (supabase) {
                    let query = supabase
                        .from('playlab_webp_assets')
                        .select('id,category,category_ko,asset_type,asset_type_ko,name_ko,name_en,name_ko_auto,description_ko,file_name,file_path,is_public,is_approved,is_active,is_source_only,is_big_folder');

                    if (queryIds.length > 1) {
                        query = query.in('category', queryIds);
                    } else if (queryIds.length === 1) {
                        query = query.eq('category', queryIds[0]);
                    }

                    const result = await query.order('asset_type', { ascending: true }).order('name_ko', { ascending: true });

                    if (result.error) throw result.error;

                    const visibleRows = (result.data || []).filter(function (row) {
                        return row
                            && row.is_public !== false
                            && row.is_approved !== false
                            && row.is_active !== false
                            && row.is_source_only !== true
                            && row.is_big_folder !== true;
                    });
                    remoteMatches = filterAssetsByRequiredWords(dedupeAssets(visibleRows.map(function (row) {
                        return normalizeAsset(row, config.imageBaseUrl);
                    }).filter(function (item) {
                        return item.id && item.nameKo && (item.assetType === 'photo' || item.assetType === 'illust');
                    })), categoryDefinition);
                }
                const mergedAssets = dedupeAssets(mergeAssetCollections(localMatches, remoteMatches));

                const shouldApply = state.loadingCategoryId === categoryDefinition.id && state.selectedCategoryId === categoryDefinition.id;
                if (mergedAssets.length) {
                    categoryAssetCache.set(queryKey, { assets: mergedAssets, createdAt: Date.now() });
                    if (shouldApply) applyLoadedCategoryAssets(mergedAssets, queryKey);
                } else if (localMatches.length) {
                    if (shouldApply) {
                        categoryAssetCache.set(queryKey, { assets: localMatches, createdAt: Date.now() });
                        applyLoadedCategoryAssets(localMatches, queryKey);
                    }
                    return localMatches;
                }
                return mergedAssets;
            } catch (error) {
                console.error('[CardLabQuiz] asset load failed:', error);
                if (localMatches.length) {
                    const shouldApplyFallback = state.loadingCategoryId === categoryDefinition.id && state.selectedCategoryId === categoryDefinition.id;
                    if (shouldApplyFallback) {
                        categoryAssetCache.set(queryKey, { assets: localMatches, createdAt: Date.now() });
                        applyLoadedCategoryAssets(localMatches, queryKey);
                    }
                    return localMatches;
                }
                state.loadErrorText = '카드 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
                state.assetsByType.photo = [];
                state.assetsByType.illust = [];
                return [];
            } finally {
                if (state.loadingCategoryId === categoryDefinition.id) {
                    state.isLoading = false;
                    state.loadingCategoryId = '';
                    updateIntroState();
                }
            }
        }

        function selectCategory(categoryId) {
            const category = getSelectedCategoryDefinition(config, categoryId);
            if (!category) return;

            clearTimer();
            state.introStep = 'types';
            state.selectedCategoryId = category.id;
            state.selectedCategory = category;
            state.selectedType = '';
            state.loadErrorText = '';
            state.quizBackground = '';
            setShellBackground(pickRandomSelectionBackground());
            state.batches = [];
            state.currentBatchIndex = 0;
            state.selectedByBatch = {};
            state.viewedByBatch = {};
            state.completed = false;
            const shouldSkipTypeSelection = config.skipTypeSelection && config.typeOptions.length === 1;
            if (shouldSkipTypeSelection) {
                state.selectedType = config.typeOptions[0].id;
            }
            audio.play('select');
            if (!shouldSkipTypeSelection) {
                renderIntroOptions();
            }
            loadCategoryAssets(category).then(function () {
                if (shouldSkipTypeSelection && state.introStep === 'types' && state.selectedCategoryId === category.id) {
                    startQuiz();
                    return;
                }
                if (state.introStep === 'types' && state.selectedCategoryId === category.id) {
                    renderIntroOptions();
                }
            });
        }

        function backToCategories() {
            clearTimer();
            state.introStep = 'categories';
            state.selectedCategoryId = '';
            state.selectedCategory = null;
            state.selectedType = '';
            state.isLoading = false;
            state.loadingCategoryId = '';
            state.quizBackground = '';
            state.loadErrorText = '';
            state.assetsByType.photo = [];
            state.assetsByType.illust = [];
            state.batches = [];
            state.currentBatchIndex = 0;
            state.selectedByBatch = {};
            state.viewedByBatch = {};
            state.completed = false;
            setShellBackground(pickRandomSelectionBackground());
            showScreen('intro');
            renderIntroOptions();
            updateIntroState();
            updateFooter();
        }

        function getCurrentBatch() {
            return state.batches[state.currentBatchIndex] || [];
        }

        function getViewedSet(index) {
            if (!state.viewedByBatch[index]) state.viewedByBatch[index] = {};
            return state.viewedByBatch[index];
        }

        function getSelectedCard() {
            const currentBatch = getCurrentBatch();
            const selectedId = state.selectedByBatch[state.currentBatchIndex] || '';
            return currentBatch.find(function (card) {
                return card.id === selectedId;
            }) || null;
        }

        function isCurrentBatchComplete() {
            const currentBatch = getCurrentBatch();
            const viewedSet = getViewedSet(state.currentBatchIndex);
            return currentBatch.length > 0 && currentBatch.every(function (card) {
                return Boolean(viewedSet[card.id]);
            });
        }

        function ensureQuizToast() {
            let toast = document.getElementById('cardlabQuizToast');
            if (toast) return toast;
            toast = document.createElement('div');
            toast.id = 'cardlabQuizToast';
            toast.className = 'cardlab-quiz-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            toast.innerHTML = '<div class="cardlab-quiz-toast-card"><div class="cardlab-quiz-toast-message"></div><button type="button" class="cardlab-quiz-toast-close" aria-label="힌트 닫기">×</button></div>';
            const closeButton = toast.querySelector('.cardlab-quiz-toast-close');
            if (closeButton) {
                closeButton.addEventListener('click', hideQuizToast);
            }
            document.body.appendChild(toast);
            return toast;
        }

        function hideQuizToast() {
            if (quizToastTimer) {
                window.clearTimeout(quizToastTimer);
                quizToastTimer = 0;
            }
            const toast = document.getElementById('cardlabQuizToast');
            if (toast) toast.classList.remove('is-visible');
        }

        function showQuizToast(message, options) {
            const isPersistent = Boolean(options && options.persistent);
            const toast = ensureQuizToast();
            const messageNode = toast.querySelector('.cardlab-quiz-toast-message') || toast.querySelector('.cardlab-quiz-toast-card');
            if (messageNode) messageNode.textContent = message || '';
            toast.classList.toggle('is-persistent', isPersistent);
            toast.classList.add('is-visible');
            if (quizToastTimer) window.clearTimeout(quizToastTimer);
            if (!isPersistent) {
                quizToastTimer = window.setTimeout(function () {
                    quizToastTimer = 0;
                    toast.classList.remove('is-visible');
                }, 2200);
            }
        }

        function getViewedCount() {
            return state.batches.reduce(function (sum, batch, batchIndex) {
                const viewedSet = getViewedSet(batchIndex);
                return sum + batch.filter(function (card) {
                    return Boolean(viewedSet[card.id]);
                }).length;
            }, 0);
        }

        function getCurrentBatchViewedCount() {
            const currentBatch = getCurrentBatch();
            const viewedSet = getViewedSet(state.currentBatchIndex);
            return currentBatch.filter(function (card) {
                return Boolean(viewedSet[card.id]);
            }).length;
        }

        function getCurrentHintText() {
            const currentBatch = getCurrentBatch();
            const viewedSet = getViewedSet(state.currentBatchIndex);
            const firstUnviewed = currentBatch.find(function (card) {
                return !viewedSet[card.id];
            });
            if (!firstUnviewed) return '모든 별을 모았어요. 다음 미션으로 넘어갈 수 있어요.';
            const name = String(firstUnviewed.nameKo || firstUnviewed.nameEn || '').trim();
            const firstLetter = Array.from(name)[0] || '';
            const categoryLabel = getSelectedCategoryLabel();
            if (firstLetter) {
                return categoryLabel + ' 카드예요. 이름 첫 글자는 "' + firstLetter + '"이에요.';
            }
            return categoryLabel + ' 카드의 모양과 색을 천천히 살펴보세요.';
        }

        function beginQuizRun() {
            state.quizRunId = (config.gameId || 'cardlab-quiz') + '-' + Date.now();
            state.quizStartedAt = new Date().toISOString();
        }

        function formatQuizDuration(seconds) {
            const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
            const minutes = Math.floor(safeSeconds / 60);
            const restSeconds = safeSeconds % 60;
            if (minutes <= 0) return restSeconds + '초';
            if (restSeconds <= 0) return minutes + '분';
            return minutes + '분 ' + restSeconds + '초';
        }

        function buildQuizAttemptSummary(options) {
            const forceCompleted = Boolean(options && options.forceCompleted);
            const flatCards = state.batches.flat().filter(Boolean);
            const totalQuestions = flatCards.length;
            const viewedById = {};
            Object.keys(state.viewedByBatch || {}).forEach(function (batchIndex) {
                const viewedSet = state.viewedByBatch[batchIndex] || {};
                Object.keys(viewedSet).forEach(function (cardId) {
                    if (viewedSet[cardId]) viewedById[cardId] = true;
                });
            });
            const viewedCount = flatCards.filter(function (card) {
                return Boolean(viewedById[card.id]);
            }).length;
            const completed = forceCompleted || state.completed === true;
            const unresolvedCards = flatCards.filter(function (card) {
                return !viewedById[card.id];
            });
            const wrongAttemptsById = {};
            if (isLetterWordQuizMode()) {
                Object.keys(state.wrongAttemptsByBatch || {}).forEach(function (batchIndex) {
                    const attempts = Number(state.wrongAttemptsByBatch[batchIndex]) || 0;
                    const card = (state.batches[batchIndex] || [])[0];
                    if (card && attempts > 0) wrongAttemptsById[card.id] = attempts;
                });
            }
            const wrongSolvedCards = flatCards.filter(function (card) {
                return Boolean(viewedById[card.id]) && (Number(wrongAttemptsById[card.id]) || 0) > 0;
            });
            const wrongCards = isLetterWordQuizMode()
                ? wrongSolvedCards.concat(unresolvedCards)
                : unresolvedCards;
            const wrongCount = isLetterWordQuizMode()
                ? wrongCards.length
                : (completed ? 0 : unresolvedCards.length);
            const correctCount = isLetterWordQuizMode()
                ? Math.max(viewedCount - wrongSolvedCards.length, 0)
                : viewedCount;
            const score = Math.max(0, Math.min(100, Math.round(correctCount / Math.max(totalQuestions, 1) * 100)));
            const durationSeconds = state.quizStartedAt
                ? Math.max(1, Math.round((Date.now() - new Date(state.quizStartedAt).getTime()) / 1000))
                : 0;
            return {
                flatCards: flatCards,
                totalQuestions: totalQuestions,
                viewedById: viewedById,
                viewedCount: viewedCount,
                completed: completed,
                unresolvedCards: unresolvedCards,
                wrongAttemptsById: wrongAttemptsById,
                wrongCards: wrongCards,
                wrongCount: wrongCount,
                correctCount: correctCount,
                score: score,
                durationSeconds: durationSeconds
            };
        }

        function updateCompleteResult() {
            const summary = buildQuizAttemptSummary({ forceCompleted: state.completed });
            if (elements.completeResultScore) {
                elements.completeResultScore.textContent = summary.correctCount + ' / ' + summary.totalQuestions;
            }
            if (elements.completeResultAccuracy) {
                elements.completeResultAccuracy.textContent = summary.score + '%';
            }
            if (elements.completeResultWrongCount) {
                elements.completeResultWrongCount.textContent = summary.wrongCount + '개';
            }
            if (elements.completeResultDuration) {
                elements.completeResultDuration.textContent = formatQuizDuration(summary.durationSeconds);
            }
        }

        function buildCardQuizAttemptPayload(options) {
            const reason = options && options.reason ? String(options.reason).trim() : 'completed';
            const forceCompleted = Boolean(options && options.forceCompleted);
            const sessionContext = getStoredLabSessionContext();
            const clientId = String(sessionContext.clientId || '').trim();
            const teacherId = String(sessionContext.teacherId || '').trim();
            const summary = buildQuizAttemptSummary({ forceCompleted: forceCompleted });
            if (!state.quizRunId || !state.quizStartedAt || !summary.totalQuestions || !clientId || !teacherId) {
                return null;
            }
            const savedKey = state.savedRunIds[state.quizRunId];
            if (savedKey && savedKey !== 'queued') {
                return null;
            }
            const categoryLabel = getSelectedCategoryLabel();
            const assetTypeLabel = getAssetTypeLabel(state.selectedType || 'card');
            const stageTitle = config.reportTitle
                ? [config.reportTitle, categoryLabel].filter(Boolean).join(' · ')
                : [categoryLabel, assetTypeLabel].filter(Boolean).join(' · ') || config.title;
            return {
                runId: state.quizRunId,
                reason: reason,
                payload: {
                    p_client_id: clientId,
                    p_teacher_id: teacherId,
                    p_curriculum_key: config.curriculumKey || CARD_SHELL_CURRICULUM_KEY,
                    p_stage_key: config.stageKey || CARD_SHELL_STAGE_KEY,
                    p_stage_order: config.stageOrder || CARD_SHELL_STAGE_ORDER,
                    p_stage_title: stageTitle,
                    p_total_questions: summary.totalQuestions,
                    p_correct_count: summary.correctCount,
                    p_wrong_count: summary.wrongCount,
                    p_score: summary.score,
                    p_cleared: summary.completed && summary.viewedCount >= summary.totalQuestions,
                    p_duration_seconds: summary.durationSeconds,
                    p_wrong_asset_ids: summary.wrongCards.map(function (card) {
                        return String(card.id || '').trim();
                    }).filter(Boolean),
                    p_wrong_words: summary.wrongCards.map(function (card) {
                        return String(card.nameKo || card.nameEn || '').trim();
                    }).filter(Boolean),
                    p_question_snapshot: summary.flatCards.map(function (card) {
                        return {
                            assetId: String(card.id || '').trim(),
                            word: String(card.nameKo || card.nameEn || '').trim(),
                            difficultyScore: 1,
                            tokens: [
                                String(card.category || '').trim(),
                                String(card.assetType || '').trim(),
                                reason
                            ].filter(Boolean)
                        };
                    }),
                    p_result_snapshot: summary.flatCards.map(function (card) {
                        const viewed = Boolean(summary.viewedById[card.id]);
                        const wrongAttempts = Number(summary.wrongAttemptsById[card.id]) || (viewed ? 0 : 1);
                        return {
                            assetId: String(card.id || '').trim(),
                            word: String(card.nameKo || card.nameEn || '').trim(),
                            solved: viewed,
                            wrongAttempts: wrongAttempts,
                            score: viewed && !wrongAttempts ? 100 : 0
                        };
                    })
                }
            };
        }

        async function persistActiveQuizSession(options) {
            const persistOptions = options || {};
            const snapshot = buildCardQuizAttemptPayload(persistOptions);
            if (!snapshot) return false;
            if (persistOptions.queueOnly || !supabase || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
                const queued = queueQuizAttempt(snapshot);
                state.savedRunIds[snapshot.runId] = queued ? 'queued' : '';
                updateSyncStatus(queued ? '' : '기록 저장 대기: 이 화면을 유지해 주세요.');
                return false;
            }
            const requestKey = attemptJobKey(snapshot);
            if (attemptInFlightKeys.has(requestKey)) return false;
            attemptInFlightKeys.add(requestKey);
            try {
                state.savedRunIds[snapshot.runId] = 'saving';
                const owner = await verifyAttemptOwner(supabase);
                if (!attemptBelongsToOwner(snapshot, owner, getStoredLabSessionContext())) throw new Error('CARDLAB_ATTEMPT_OWNER_REQUIRED');
                if (hasConflictingAttempt(snapshot, readAllQueuedQuizAttempts())) throw new Error('CARDLAB_ATTEMPT_CONFLICT_PENDING');
                if (!queueQuizAttempt(snapshot)) throw new Error('CARDLAB_ATTEMPT_DURABILITY_REQUIRED');
                const result = await supabase.rpc('record_cardlab_learning_attempt', snapshot.payload);
                if (!result || result.error || result.data != null) throw new Error('CARDLAB_ATTEMPT_ACK_MISMATCH');
                const after = currentAttemptOwner();
                if (!after || after.authUserId !== owner.authUserId || !attemptBelongsToOwner(snapshot, after, getStoredLabSessionContext())) throw new Error('CARDLAB_ATTEMPT_OWNER_CHANGED');
                state.savedRunIds[snapshot.runId] = snapshot.reason || 'completed';
                removeQueuedQuizAttempt(snapshot, currentAttemptOwner());
                updateSyncStatus();
                void syncQueuedQuizAttempts();
                return true;
            } catch (error) {
                const queued = queueQuizAttempt(snapshot);
                state.savedRunIds[snapshot.runId] = queued ? 'queued' : '';
                updateSyncStatus(queued ? '' : '기록 저장 대기: 이 화면을 유지해 주세요.');
                console.error('[CardLabQuiz] save failed:', error);
                return false;
            } finally { attemptInFlightKeys.delete(requestKey); }
        }

        function updateFooter() {
            return;
        }

        function updateTopbar() {
            const currentRound = state.currentBatchIndex + 1;
            const totalRounds = state.batches.length;
            const categoryLabel = getSelectedCategoryLabel();
            const typeDescription = getSelectedTypeDescription(config, state.selectedType);
            if (elements.shellTitle) {
                elements.shellTitle.textContent = '';
                elements.shellTitle.classList.add('shell-hidden');
            }
            elements.stageTitle.textContent = isLetterWordQuizMode() ? categoryLabel : categoryLabel + ' ' + getAssetTypeLabel(state.selectedType || 'photo');
            elements.stageDescription.textContent = isLetterWordQuizMode()
                ? '그림을 보고 낱말 글자를 차례대로 눌러 보세요.'
                : typeDescription || '그림을 보고 카드 이름과 특징을 함께 이야기해 보세요.';
            elements.shellStageLabel.textContent = totalRounds ? '문항 ' + currentRound + ' / ' + totalRounds : '문항 준비중';
            elements.progressChip.textContent = isLetterWordQuizMode()
                ? '정답 ' + getViewedCount() + ' / ' + (state.batches.flat().length || 0)
                : '확인한 카드 ' + getViewedCount() + ' / ' + (state.batches.flat().length || 0);
        }

        function updateRewardPanel() {
            if (!elements.rewardPanel) return;
            const currentRound = state.currentBatchIndex + 1;
            const totalRounds = state.batches.length;
            const currentBatch = getCurrentBatch();
            const viewedCount = getCurrentBatchViewedCount();
            const batchComplete = isCurrentBatchComplete();
            const totalCards = state.batches.flat().length || 0;
            const totalViewed = getViewedCount();
            elements.rewardLevel.textContent = (isLetterWordQuizMode() ? '문항 ' : '미션 ') + currentRound + ' / ' + Math.max(totalRounds, 1);
            elements.rewardMessage.textContent = batchComplete
                ? (isLetterWordQuizMode() ? '단어 완성. 다음 문제로 넘어갈 수 있어요.' : '별 ' + viewedCount + '개 완성. 다음 미션이 열렸어요.')
                : '';
            elements.rewardMessage.classList.toggle('shell-hidden', !batchComplete);
            elements.rewardGate.textContent = batchComplete ? '다음 문항 오픈' : '다음 문항 잠김';
            elements.rewardGate.classList.toggle('is-open', batchComplete);
            elements.rewardPanel.classList.toggle('is-complete', batchComplete);
            elements.rewardPanel.style.setProperty('--quiz-progress-percent', totalCards ? Math.round(totalViewed / totalCards * 100) + '%' : '0%');
            elements.rewardStars.innerHTML = currentBatch.map(function (_card, index) {
                const earned = index < viewedCount;
                return '<span class="quiz-reward-star' + (earned ? ' is-earned' : '') + '" aria-hidden="true">★</span>';
            }).join('');
        }

        function updateInfoPanel() {
            const selected = getSelectedCard();
            const panel = elements.infoTitle && elements.infoTitle.closest ? elements.infoTitle.closest('.quiz-info-panel') : null;
            if (selected) {
                if (panel) {
                    panel.classList.add('is-answer');
                    panel.classList.remove('is-hint');
                }
                elements.infoTitle.textContent = selected.nameKo;
                elements.infoDescription.textContent = getCardDisplayDescription(selected);
                if (elements.infoSpeakerButton) {
                    const canSpeak = Boolean(
                        selected.nameSoundPath ||
                        selected.descriptionSoundPath ||
                        selected.nameKo ||
                        selected.descriptionKo ||
                        (config.googleTtsApiKey && selected.nameKo)
                    );
                    elements.infoSpeakerButton.disabled = !canSpeak;
                    elements.infoSpeakerButton.classList.remove('shell-hidden');
                }
                return;
            }

            if (state.completed) {
                if (panel) {
                    panel.classList.add('is-answer');
                    panel.classList.remove('is-hint');
                }
                elements.infoTitle.textContent = '학습 완료';
                elements.infoDescription.textContent = '모든 카드를 살펴봤어요. 다시 시작해서 다른 순서로 연습해 볼 수도 있어요.';
                if (elements.infoSpeakerButton) {
                    elements.infoSpeakerButton.disabled = true;
                    elements.infoSpeakerButton.classList.add('shell-hidden');
                }
                return;
            }

            if (panel) {
                panel.classList.remove('is-answer');
                panel.classList.remove('is-hint');
            }
            elements.infoTitle.textContent = '카드를 눌러 보세요';
            elements.infoDescription.textContent = '카드를 한 장 누르면 카드 이름과 설명이 나타나요.';
            if (elements.infoSpeakerButton) {
                elements.infoSpeakerButton.disabled = true;
                elements.infoSpeakerButton.classList.add('shell-hidden');
            }
        }

        function updateNavigation() {
            const batchComplete = isCurrentBatchComplete();
            elements.prevButton.disabled = state.currentBatchIndex <= 0;
            elements.nextButton.disabled = false;
            elements.nextButton.setAttribute('aria-disabled', 'false');
            elements.nextButton.classList.toggle('is-ready', batchComplete);
            elements.nextButton.classList.toggle('is-locked', !batchComplete);

            if (!batchComplete) {
                if (state.nextPromptTimer) {
                    window.clearTimeout(state.nextPromptTimer);
                    state.nextPromptTimer = 0;
                }
                elements.nextButton.classList.remove('is-throbbing');
                return;
            }

            if (state.nextPromptTimer || elements.nextButton.classList.contains('is-throbbing')) {
                return;
            }

            const batchIndex = state.currentBatchIndex;
            state.nextPromptTimer = window.setTimeout(function () {
                state.nextPromptTimer = 0;
                if (state.currentBatchIndex !== batchIndex || !isCurrentBatchComplete()) return;
                elements.nextButton.classList.add('is-throbbing');
            }, 3000);
        }

        function highlightUnviewedCards() {
            const viewedSet = getViewedSet(state.currentBatchIndex);
            Array.prototype.slice.call(elements.track.querySelectorAll('[data-batch-index="' + String(state.currentBatchIndex) + '"]')).forEach(function (button) {
                const cardId = String(button.getAttribute('data-card-id') || '').trim();
                const shouldHint = cardId && !viewedSet[cardId];
                button.classList.toggle('is-hint-target', shouldHint);
            });
            window.setTimeout(function () {
                Array.prototype.slice.call(elements.track.querySelectorAll('.is-hint-target')).forEach(function (button) {
                    button.classList.remove('is-hint-target');
                });
            }, 1200);
        }

        function renderTrack() {
            if (isLetterWordQuizMode()) {
                renderLetterWordTrack();
                return;
            }
            const totalViewed = getViewedCount();
            const totalCards = state.batches.flat().length;
            const categoryLabel = getSelectedCategoryLabel();
            elements.track.innerHTML = state.batches.map(function (batch, batchIndex) {
                const viewedSet = getViewedSet(batchIndex);
                const selectedId = state.selectedByBatch[batchIndex] || '';
                return '' +
                    '<div class="quiz-slide">' +
                    batch.map(function (card, cardIndex) {
                        const globalIndex = batchIndex * config.cardsPerRound + cardIndex + 1;
                        const isSelected = selectedId === card.id;
                        const isViewed = Boolean(viewedSet[card.id]);
                        const imageCandidates = getOptimizedImageCandidates(card);
                        const firstImage = imageCandidates[0] || '';
                        const imagePriority = Math.abs(batchIndex - state.currentBatchIndex) <= PRELOAD_BATCH_RADIUS ? 'eager' : 'lazy';
                        return '' +
                            '<button type="button" class="quiz-card' + (isSelected ? ' is-selected' : '') + (isViewed ? ' is-viewed' : '') + '" data-card-id="' + escapeHtml(card.id) + '" data-batch-index="' + batchIndex + '">' +
                            '  <span class="quiz-card-badge' + (isViewed ? ' is-done' : '') + '">' + (isViewed ? '완료' : '보기') + '</span>' +
                            '  <div class="quiz-card-media">' +
                            '    <img src="' + escapeHtml(firstImage) + '" alt="' + escapeHtml(card.nameKo) + '"' + (imageCandidates.length ? ' data-image-candidates="' + escapeHtml(imageCandidates.join('||')) + '"' : '') + ' data-image-fallback-index="0" loading="' + imagePriority + '" decoding="async">' +
                            '  </div>' +
                            '  <div class="quiz-card-index">' + String(globalIndex).padStart(2, '0') + '</div>' +
                            '  <div class="quiz-card-name">' + escapeHtml(isViewed ? card.nameKo : maskCardName(card.nameKo)) + '</div>' +
                            '</button>';
                    }).join('') +
                    '</div>';
            }).join('');

            elements.track.style.transform = 'translateX(-' + (state.currentBatchIndex * 100) + '%)';
            attachImageFallbacks(elements.track);
            preloadNearbyBatchImages();

            Array.prototype.slice.call(elements.track.querySelectorAll('.quiz-card')).forEach(function (button) {
                button.addEventListener('click', function () {
                    const cardId = String(button.getAttribute('data-card-id') || '').trim();
                    const batchIndex = Number(button.getAttribute('data-batch-index'));
                    if (!cardId || Number.isNaN(batchIndex)) return;
                    handleCardSelection(batchIndex, cardId);
                });
            });

            elements.completeTitle.textContent = categoryLabel + ' 완료';
            elements.completeDescription.textContent = categoryLabel + ' 카드 ' + totalCards + '장을 모두 확인했어요.\n카드마다 이름을 떠올리고\n특징과 설명을 연결하며 학습을 마쳤습니다.\n다시 학습하며 말하기와 인지를 한 번 더 이어가 보세요.';
        }

        function renderLetterWordTrack() {
            const totalCards = state.batches.flat().length;
            const categoryLabel = getSelectedCategoryLabel();
            elements.track.innerHTML = state.batches.map(function (batch, batchIndex) {
                const card = batch[0];
                if (!card) return '<div class="quiz-slide"></div>';
                const viewedSet = getViewedSet(batchIndex);
                const isViewed = Boolean(viewedSet[card.id]);
                const answerLetters = Array.isArray(card.answerLetters) ? card.answerLetters : getKoreanWordLetters(card.nameKo);
                const selectedLetters = Array.isArray(state.letterProgressByBatch[batchIndex]) ? state.letterProgressByBatch[batchIndex] : [];
                const imageCandidates = getOptimizedImageCandidates(card);
                const firstImage = imageCandidates[0] || '';
                return '' +
                    '<div class="quiz-slide quiz-letter-slide">' +
                    '  <article class="quiz-word-question' + (isViewed ? ' is-complete' : '') + '" data-card-id="' + escapeHtml(card.id) + '" data-batch-index="' + batchIndex + '" data-answer-letters="' + escapeHtml(answerLetters.join('')) + '">' +
                    '    <div class="quiz-word-scene">' +
                    '      <div class="quiz-word-image quiz-card-media">' +
                    '        <img src="' + escapeHtml(firstImage) + '" alt="' + escapeHtml(card.nameKo) + '"' + (imageCandidates.length ? ' data-image-candidates="' + escapeHtml(imageCandidates.join('||')) + '"' : '') + ' data-image-fallback-index="0" loading="eager" decoding="async">' +
                    '      </div>' +
                    '      <button type="button" class="quiz-word-hint" data-action="word-hint">힌트보기</button>' +
                    '    </div>' +
                    '    <div class="quiz-word-prompt">무엇일까요?</div>' +
                    '    <div class="quiz-answer-slots" aria-label="정답 글자 칸">' +
                    answerLetters.map(function (letter, index) {
                        const selected = selectedLetters[index] || '';
                        return '<span class="quiz-answer-slot' + (selected ? ' is-filled' : '') + '">' + escapeHtml(isViewed ? letter : selected) + '</span>';
                    }).join('') +
                    '    </div>' +
                    '    <div class="quiz-letter-tiles" aria-label="글자 보기">' +
                    (Array.isArray(card.letterOptions) ? card.letterOptions : buildLetterChoiceOptions(card, getCurrentBatch())).map(function (option) {
                        const usedCount = selectedLetters.filter(function (letter) {
                            return letter === option.letter;
                        }).length;
                        const answerCount = answerLetters.filter(function (letter) {
                            return letter === option.letter;
                        }).length;
                        const disabled = isViewed || (option.isAnswer && usedCount >= answerCount);
                        return '<button type="button" class="quiz-letter-tile" data-option-id="' + escapeHtml(option.id) + '" data-letter="' + escapeHtml(option.letter) + '"' + (disabled ? ' disabled' : '') + '>' + escapeHtml(option.letter) + '</button>';
                    }).join('') +
                    '    </div>' +
                    '  </article>' +
                    '</div>';
            }).join('');

            elements.track.style.transform = 'translateX(-' + (state.currentBatchIndex * 100) + '%)';
            attachImageFallbacks(elements.track);
            preloadNearbyBatchImages();

            Array.prototype.slice.call(elements.track.querySelectorAll('.quiz-letter-tile')).forEach(function (button) {
                button.addEventListener('click', function () {
                    const optionId = String(button.getAttribute('data-option-id') || '').trim();
                    handleLetterSelection(optionId);
                });
            });
            Array.prototype.slice.call(elements.track.querySelectorAll('[data-action="word-hint"]')).forEach(function (button) {
                button.addEventListener('click', function () {
                    const card = getCurrentBatch()[0];
                    if (!card) return;
                    showQuizToast(getCardDisplayDescription(card), { persistent: true });
                });
            });

            if (config.autoAdvanceOnLetterComplete && !state.completed && isCurrentBatchComplete() && !state.autoAdvanceTimer) {
                scheduleLetterAutoAdvance();
            }

            const resultLabel = /단어$/u.test(categoryLabel) ? categoryLabel : categoryLabel + ' 단어';
            elements.completeTitle.textContent = categoryLabel + ' 완료';
            elements.completeDescription.textContent = resultLabel + ' ' + totalCards + '개를 완성했어요.\n그림을 보고 낱말을 떠올리고\n글자를 순서대로 연결하는 연습을 마쳤습니다.\n다시 풀며 필수 단어를 한 번 더 익혀 보세요.';
        }

        function updateRenderedBatchCards(batchIndex) {
            const batch = state.batches[batchIndex] || [];
            const viewedSet = getViewedSet(batchIndex);
            const selectedId = state.selectedByBatch[batchIndex] || '';
            Array.prototype.slice.call(elements.track.querySelectorAll('[data-batch-index="' + String(batchIndex) + '"]')).forEach(function (button) {
                const cardId = String(button.getAttribute('data-card-id') || '').trim();
                const card = batch.find(function (item) {
                    return item.id === cardId;
                });
                if (!card) return;
                const isViewed = Boolean(viewedSet[cardId]);
                const isSelected = selectedId === cardId;
                button.classList.toggle('is-selected', isSelected);
                button.classList.toggle('is-viewed', isViewed);
                const badge = button.querySelector('.quiz-card-badge');
                if (badge) {
                    badge.textContent = isViewed ? '완료' : '보기';
                    badge.classList.toggle('is-done', isViewed);
                }
                const name = button.querySelector('.quiz-card-name');
                if (name) {
                    name.textContent = isViewed ? card.nameKo : maskCardName(card.nameKo);
                }
            });
        }

        function goToBatch(nextIndex) {
            clearTimer();
            if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
            hideQuizToast();
            state.currentBatchIndex = clamp(nextIndex, 0, Math.max(state.batches.length - 1, 0));
            render();
        }

        function completeCurrentQuiz() {
            state.completed = true;
            stopAllAudio();
            audio.play('complete');
            render();
            void persistActiveQuizSession({ reason: 'completed', forceCompleted: true });
        }

        function scheduleLetterAutoAdvance() {
            if (!config.autoAdvanceOnLetterComplete || !isLetterWordQuizMode()) return;
            if (state.autoAdvanceTimer) {
                window.clearTimeout(state.autoAdvanceTimer);
                state.autoAdvanceTimer = 0;
            }
            state.autoAdvanceTimer = window.setTimeout(function () {
                state.autoAdvanceTimer = 0;
                if (!isLetterWordQuizMode() || !isCurrentBatchComplete()) return;
                if (state.currentBatchIndex >= state.batches.length - 1) {
                    completeCurrentQuiz();
                    return;
                }
                goToBatch(state.currentBatchIndex + 1);
            }, config.autoAdvanceDelayMs);
        }

        function handleCardSelection(batchIndex, cardId) {
            const batch = state.batches[batchIndex] || [];
            const card = batch.find(function (item) {
                return item.id === cardId;
            });
            if (!card) return;

            stopAllAudio();
            state.selectedByBatch[batchIndex] = cardId;
            getViewedSet(batchIndex)[cardId] = true;
            state.completed = false;
            if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
            updateRenderedBatchCards(batchIndex);
            updateTopbar();
            updateRewardPanel();
            updateInfoPanel();
            updateNavigation();
            void playCardNarration(card, false);
        }

        function handleLetterSelection(optionId) {
            const batchIndex = state.currentBatchIndex;
            const card = getCurrentBatch()[0];
            if (!card || getViewedSet(batchIndex)[card.id]) return;
            const option = (Array.isArray(card.letterOptions) ? card.letterOptions : []).find(function (item) {
                return item.id === optionId;
            });
            if (!option) return;

            const answerLetters = Array.isArray(card.answerLetters) ? card.answerLetters : getKoreanWordLetters(card.nameKo);
            const current = Array.isArray(state.letterProgressByBatch[batchIndex])
                ? state.letterProgressByBatch[batchIndex].slice()
                : [];
            const expected = answerLetters[current.length];
            if (option.letter !== expected) {
                state.wrongAttemptsByBatch[batchIndex] = (Number(state.wrongAttemptsByBatch[batchIndex]) || 0) + 1;
                showCommonQuestionFeedback('wrong');
                showQuizToast('아쉬워요. 그림을 다시 보고 다음 글자를 골라 보세요.');
                return;
            }

            current.push(option.letter);
            state.letterProgressByBatch[batchIndex] = current;
            if (current.length >= answerLetters.length) {
                state.selectedByBatch[batchIndex] = card.id;
                getViewedSet(batchIndex)[card.id] = true;
                showCommonQuestionFeedback('correct');
                showQuizToast('정답이에요! ' + card.nameKo + ' 완성');
            }
            updateTopbar();
            renderTrack();
            updateRewardPanel();
            updateInfoPanel();
            updateNavigation();
            if (current.length >= answerLetters.length) {
                scheduleLetterAutoAdvance();
            }
        }

        function render() {
            if (!state.selectedCategoryId || !state.selectedType) {
                if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
                hideQuizToast();
                showScreen('intro');
                renderIntroOptions();
                return;
            }

            if (!state.batches.length) {
                if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
                hideQuizToast();
                showScreen('empty');
                elements.emptyDescription.textContent = getSelectedCategoryLabel() + ' ' + getAssetTypeLabel(state.selectedType) + ' 카드가 아직 준비되지 않았어요.';
                leaveFullscreen();
                updateFooter();
                return;
            }

            if (state.completed) {
                if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
                hideQuizToast();
                updateCompleteResult();
                showScreen('complete');
                leaveFullscreen();
                updateFooter();
                return;
            }

            showScreen('quiz');
            elements.quizScreen.classList.toggle('is-letter-word-mode', isLetterWordQuizMode());
            updateTopbar();
            renderTrack();
            updateRewardPanel();
            updateInfoPanel();
            updateNavigation();
            updateFooter();
        }

        async function startQuiz() {
            if (!state.selectedType || !state.selectedCategory) return;

            clearTimer();
            if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
            state.loadErrorText = '';
            state.quizBackground = state.quizBackground || pickRandomQuizBackground();
            setShellBackground(state.quizBackground);
            enterFullscreen();

            const selectedAssets = await loadCategoryAssets(state.selectedCategory);
            const filteredAssets = Array.isArray(selectedAssets) ? selectedAssets.filter(function (item) {
                return item.assetType === state.selectedType;
            }) : [];

            const minimumCount = isLetterWordQuizMode() ? 1 : config.cardsPerRound;
            if (filteredAssets.length < minimumCount) {
                state.batches = [];
                state.currentBatchIndex = 0;
                state.selectedByBatch = {};
                state.viewedByBatch = {};
                state.letterProgressByBatch = {};
                state.wrongAttemptsByBatch = {};
                state.completed = false;
                render();
                return;
            }

            state.batches = isLetterWordQuizMode()
                ? buildLetterQuizBatches(filteredAssets, config.quizQuestionCount, config.randomizeLetterQuestions)
                : buildProgressiveQuizBatches(filteredAssets, config.cardsPerRound);
            state.currentBatchIndex = 0;
            state.selectedByBatch = {};
            state.viewedByBatch = {};
            state.letterProgressByBatch = {};
            state.wrongAttemptsByBatch = {};
            state.completed = false;
            beginQuizRun();
            audio.play('select');
            render();
        }

        function goHome() {
            clearTimer();
            if (window.CardlabMeaningToast) window.CardlabMeaningToast.hide();
            leaveFullscreen();
            state.introStep = 'categories';
            state.selectedCategoryId = '';
            state.selectedCategory = null;
            state.selectedType = '';
            state.isLoading = false;
            state.loadingCategoryId = '';
            state.quizBackground = '';
            state.loadErrorText = '';
            state.currentBatchIndex = 0;
            state.selectedByBatch = {};
            state.viewedByBatch = {};
            state.letterProgressByBatch = {};
            state.wrongAttemptsByBatch = {};
            state.batches = [];
            state.completed = false;
            state.quizRunId = '';
            state.quizStartedAt = '';
            state.assetsByType.photo = [];
            state.assetsByType.illust = [];
            setShellBackground(pickRandomSelectionBackground());
            showScreen('intro');
            updateIntroState();
            renderIntroOptions();
            updateFooter();
        }

        function bindEvents() {
            document.addEventListener('pointerdown', function (event) {
                const target = event.target && typeof event.target.closest === 'function'
                    ? event.target.closest('button, a, input, textarea, select, label')
                    : null;
                if (!target) return;
                stopAllAudio();
            }, true);

            elements.prevButton.addEventListener('click', function () {
                goToBatch(state.currentBatchIndex - 1);
            });
            elements.nextButton.addEventListener('click', function () {
                if (!isCurrentBatchComplete()) {
                    showQuizToast(isLetterWordQuizMode() ? '글자를 모두 완성한 뒤 다음 문제로 갈 수 있어요.' : '아직 카드가 남아있어요.');
                    highlightUnviewedCards();
                    updateInfoPanel();
                    return;
                }
                if (state.nextPromptTimer) {
                    window.clearTimeout(state.nextPromptTimer);
                    state.nextPromptTimer = 0;
                }
                elements.nextButton.classList.remove('is-throbbing');
                if (state.currentBatchIndex >= state.batches.length - 1) {
                    completeCurrentQuiz();
                    return;
                }
                goToBatch(state.currentBatchIndex + 1);
            });
            if (elements.infoSpeakerButton) {
                elements.infoSpeakerButton.addEventListener('click', function () {
                    const selected = getSelectedCard();
                    if (!selected || elements.infoSpeakerButton.disabled) return;
                    playCardNarration(selected, true);
                });
            }
            elements.retryButton.addEventListener('click', function () {
                stopAllAudio();
                startQuiz();
            });
            elements.completeHomeButton.addEventListener('click', function () {
                openConfirmModal(elements, state, 'category', stopAllAudio);
            });
            elements.emptyHomeButton.addEventListener('click', function () {
                openConfirmModal(elements, state, 'category', stopAllAudio);
            });
            if (elements.headerCategoryButton) {
                elements.headerCategoryButton.addEventListener('click', async function () {
                    await persistActiveQuizSession({ reason: 'category' });
                    goHome();
                });
            }
            elements.homeButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    if (state.introStep === 'categories') {
                        openConfirmModal(elements, state, 'exit', stopAllAudio);
                        return;
                    }
                    openConfirmModal(elements, state, 'category', stopAllAudio);
                });
            });
            if (elements.exitButtons) {
                elements.exitButtons.forEach(function (button) {
                    button.addEventListener('click', function () {
                        openConfirmModal(elements, state, 'exit', stopAllAudio);
                    });
                });
            }
            if (elements.introBackButton) {
                elements.introBackButton.addEventListener('click', function () {
                    backToCategories();
                });
            }
            if (elements.confirmModalOk) {
                elements.confirmModalOk.addEventListener('click', async function () {
                    const action = state.pendingExitAction || 'category';
                    await persistActiveQuizSession({ reason: action, forceCompleted: state.completed });
                    closeConfirmModal(elements, state);
                    leaveFullscreen();
                    if (action === 'exit') {
                        goToPreviousLearning();
                        return;
                    }
                    backToCategories();
                });
            }
            if (elements.confirmModalCancel) {
                elements.confirmModalCancel.addEventListener('click', function () {
                    closeConfirmModal(elements, state);
                });
            }
            if (elements.confirmModal) {
                elements.confirmModal.addEventListener('click', function (event) {
                    if (event.target && event.target.hasAttribute('data-modal-close')) {
                        closeConfirmModal(elements, state);
                    }
                });
            }
            window.addEventListener('resize', function () {
                if (state.introStep === 'categories') {
                    window.requestAnimationFrame(updateCategoryLabelLayout);
                }
            }, { passive: true });
            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') {
                    closeConfirmModal(elements, state);
                }
            });
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    stopAllAudio();
                    void persistActiveQuizSession({ reason: 'hidden', forceCompleted: state.completed });
                } else {
                    void syncQueuedQuizAttempts();
                }
            });
            window.addEventListener('online', function () {
                void syncQueuedQuizAttempts();
            });
            window.addEventListener('offline', function () {
                updateSyncStatus();
            });
            window.addEventListener('pagehide', function () {
                stopAllAudio();
                void persistActiveQuizSession({ reason: 'pagehide', forceCompleted: state.completed, queueOnly: true });
            }, { passive: true });
            window.addEventListener('beforeunload', function () {
                stopAllAudio();
                void persistActiveQuizSession({ reason: 'unload', forceCompleted: state.completed, queueOnly: true });
            }, { passive: true });
        }

        async function init() {
            document.title = config.pageTitle;
            setShellBackground(pickRandomSelectionBackground());
            await loadCardSoundManifest();
            enterFullscreen();
            document.addEventListener('pointerdown', enterFullscreen, { once: true, passive: true });
            elements.introTitle.textContent = '';
            elements.introTitle.classList.add('shell-hidden');
            elements.introSubtitle.textContent = '';
            elements.introSubtitle.classList.add('shell-hidden');
            elements.introDescription.textContent = '';
            elements.introDescription.classList.add('shell-hidden');
            elements.shellTitle.textContent = '';
            elements.shellTitle.classList.add('shell-hidden');
            elements.stageTitle.textContent = config.title;
            elements.stageDescription.textContent = config.subtitle;
            elements.progressChip.textContent = '확인한 카드 0 / 0';
            bindEvents();
            renderIntroOptions();
            updateIntroState();
            updateSyncStatus();
            void syncQueuedQuizAttempts();
        }

        void init();
    }

    window.CardLabShell = {
        createCardQuizPage: createCardQuizPage
    };
})();
