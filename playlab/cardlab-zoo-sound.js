(function () {
    'use strict';

    const QUESTION_COUNT = 20;
    const CHOICE_COUNT = 4;
    const CURRICULUM_KEY = 'zoo-sound';
    const DEFAULT_SUPABASE_URL = 'https://gxungzlecmibgvykoiib.supabase.co';
    const DEFAULT_SUPABASE_KEY = 'sb_publishable_hzQriBXTJeAwATA2NjnV7A_Tr9E1hfE';
    const STORAGE_USER_KEY = 'haha_lab_session';
    const STORAGE_PAGE_KEY = 'haha_lab_page_state';
    const STAGE_ORDER_MAP = {
        word: 1,
        illust: 2,
        photo: 3
    };
    const STAGES = {
        word: {
            id: 'word',
            title: '단어 보기',
            label: '1단계',
            description: ''
        },
        illust: {
            id: 'illust',
            title: '일러스트 보기',
            label: '2단계',
            description: ''
        },
        photo: {
            id: 'photo',
            title: '사진 보기',
            label: '3단계',
            description: ''
        }
    };

    const SOUND_ITEMS = [
        { name: '강아지', sound: '../sound/zoo/dragon-studio-barking-dog-cute-sound-463192.mp3' },
        { name: '고양이', sound: '../sound/zoo/dragon-studio-cat-meow-401729.mp3' },
        { name: '코끼리', sound: '../sound/zoo/dragon-studio-elephant-trumpeting-494313.mp3' },
        { name: '개구리', sound: '../sound/zoo/dragon-studio-frog-croaking-sound-effect-322956.mp3' },
        { name: '말', sound: '../sound/zoo/dragon-studio-gentle-horse-whinny-499650.mp3' },
        { name: '오리', sound: '../sound/zoo/freesound_community-075176_duck-quack-40345.mp3' },
        { name: '비둘기', sound: '../sound/zoo/freesound_community-cartoon-doves-101457.mp3' },
        { name: '모기', sound: '../sound/zoo/freesound_community-flying-mosquito-105770.mp3' },
        { name: '매미', sound: '../sound/zoo/freesound_community-japanese-cicada-103659.mp3' },
        { name: '늑대', sound: '../sound/zoo/freesound_community-wolf-howl-6310.mp3' },
        { name: '돼지', sound: '../sound/zoo/magiaz-porco-3-326302.mp3' },
        { name: '까마귀', sound: '../sound/zoo/mightuser-1-an_ominous-crow-call-255173.mp3' },
        { name: '병아리', sound: '../sound/zoo/nikin-short-chick-sound-171389.mp3' },
        { name: '사자', sound: '../sound/zoo/pwlpl-powerful-lion-roar-sound-effect-high-quality-sfx-444190.mp3' },
        { name: '양', sound: '../sound/zoo/ribhavagrawal-sheep-baaing-type-01-293306.mp3' },
        { name: '소', sound: '../sound/zoo/scottishperson-sound-effect-cow-mooing-356517.mp3' },
        { name: '참새', sound: '../sound/zoo/sondangsirait419-burung-pipit-220066.mp3' },
        { name: '쥐', sound: '../sound/zoo/sondangsirait419-tikus-220067.mp3' },
        { name: '닭', sound: '../sound/zoo/stefan_grace-rooster-233738.mp3' },
        { name: '원숭이', sound: '../sound/zoo/u_zpj3vbdres-monkey-128368.mp3' }
    ];

    const EFFECT_SOUNDS = {
        correct: '../sound/correct.mp3',
        wrong: '../sound/error.mp3',
        complete: '../sound/happy_victory.mp3'
    };

    const state = {
        stageId: '',
        questions: [],
        index: 0,
        correctCount: 0,
        wrongCount: 0,
        answered: false,
        questionHadWrong: false,
        runId: '',
        startedAt: '',
        savedRunIds: {},
        questionLogs: [],
        supabase: null,
        audio: null,
        effectAudio: null,
        itemMap: new Map()
    };

    const elements = {};

    function $(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function shuffle(values) {
        const next = Array.isArray(values) ? [...values] : [];
        for (let index = next.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
        }
        return next;
    }

    function readStoredJson(storage, key) {
        if (!storage || !key) return null;
        try {
            const raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    function getStoredLabSessionContext() {
        const params = new URLSearchParams(window.location.search || '');
        const launchKey = String(params.get('labLaunchKey') || '').trim();
        const launchContext = launchKey
            ? (window.HahaLabLearningHarness?.readLaunchContext?.() || readStoredJson(window.sessionStorage, launchKey) || readStoredJson(window.localStorage, launchKey) || {})
            : {};
        const storedUser = readStoredJson(window.localStorage, STORAGE_USER_KEY) || readStoredJson(window.sessionStorage, STORAGE_USER_KEY) || {};
        const storedPage = readStoredJson(window.sessionStorage, STORAGE_PAGE_KEY) || readStoredJson(window.localStorage, STORAGE_PAGE_KEY) || {};
        const currentSession = storedPage.currentSession || {};
        const resolvedClient = currentSession.client || {};

        return {
            teacherId: String(
                launchContext.teacherId ||
                launchContext.teacher_id ||
                currentSession.teacherId ||
                currentSession.teacher_id ||
                storedUser.teacherId ||
                storedUser.teacher_id ||
                params.get('teacherId') ||
                ''
            ).trim(),
            clientId: String(
                launchContext.clientId ||
                launchContext.client_id ||
                currentSession.clientId ||
                currentSession.client_id ||
                resolvedClient.id ||
                params.get('clientId') ||
                ''
            ).trim(),
            clientName: String(
                launchContext.clientName ||
                launchContext.client_name ||
                currentSession.clientName ||
                currentSession.client_name ||
                resolvedClient.name ||
                params.get('clientName') ||
                ''
            ).trim()
        };
    }

    function initSupabase() {
        if (state.supabase || !window.supabase || typeof window.supabase.createClient !== 'function') return;
        state.supabase = window.supabase.createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY);
    }

    function normalizeName(value) {
        return String(value || '').trim().replace(/\s+/g, '');
    }

    function getManifestAssets() {
        const manifest = window.CARDLAB_WEBP_MANIFEST || {};
        return Array.isArray(manifest.assets) ? manifest.assets : [];
    }

    function buildItemMap() {
        const assets = getManifestAssets().filter((asset) => asset && asset.is_active !== false);
        const grouped = new Map();
        assets.forEach((asset) => {
            const name = normalizeName(asset.name_ko || asset.name_ko_auto);
            if (!name) return;
            if (!grouped.has(name)) {
                grouped.set(name, {
                    name,
                    description: String(asset.description_ko || '').trim(),
                    photo: '',
                    illust: ''
                });
            }
            const item = grouped.get(name);
            if (!item.description && asset.description_ko) item.description = String(asset.description_ko).trim();
            if (asset.asset_type === 'photo' && asset.file_path) item.photo = asset.file_path;
            if (asset.asset_type === 'illust' && asset.file_path) item.illust = asset.file_path;
        });

        SOUND_ITEMS.forEach((soundItem) => {
            const name = normalizeName(soundItem.name);
            const media = grouped.get(name) || {};
            if (media.photo || media.illust) {
                state.itemMap.set(name, {
                    ...soundItem,
                    name,
                    description: media.description || '소리를 듣고 어떤 동물인지 떠올려 보세요.',
                    photo: media.photo || media.illust,
                    illust: media.illust || media.photo
                });
            }
        });
    }

    function getPlayableItems() {
        return SOUND_ITEMS
            .map((item) => state.itemMap.get(normalizeName(item.name)))
            .filter((item) => item && item.sound && item.photo && item.illust);
    }

    function setScreen(activeId) {
        ['introScreen', 'gameScreen', 'completeScreen'].forEach((id) => {
            const element = elements[id];
            if (!element) return;
            element.classList.toggle('is-active', id === activeId);
        });
    }

    function setStageChips(stage = null) {
        if (elements.shellStageLabel) {
            elements.shellStageLabel.classList.toggle('shell-hidden', !stage);
            elements.shellStageLabel.textContent = stage ? stage.label : '스테이지 선택';
        }
        if (elements.stageSelectButton) {
            elements.stageSelectButton.classList.toggle('shell-hidden', !stage);
        }
    }

    function stopAudio() {
        if (state.audio) {
            state.audio.pause();
            state.audio.currentTime = 0;
        }
        elements.soundButton?.classList.remove('is-playing');
    }

    function stopEffectAudio() {
        if (state.effectAudio) {
            state.effectAudio.pause();
            state.effectAudio.currentTime = 0;
        }
    }

    function stopAllAudio() {
        stopAudio();
        stopEffectAudio();
    }

    function playAudio(src, options = {}) {
        const url = String(src || '').trim();
        if (!url) return Promise.resolve();
        const audio = options.effect ? (state.effectAudio || new Audio()) : (state.audio || new Audio());
        if (options.effect) {
            state.effectAudio = audio;
        } else {
            stopAudio();
            state.audio = audio;
            elements.soundButton?.classList.add('is-playing');
            audio.onended = () => elements.soundButton?.classList.remove('is-playing');
            audio.onerror = () => elements.soundButton?.classList.remove('is-playing');
        }
        audio.src = url;
        audio.currentTime = 0;
        return audio.play().catch(() => {
            if (!options.effect) {
                elements.soundButton?.classList.remove('is-playing');
                setFeedback('소리 버튼을 눌러 다시 들어보세요.', '');
            }
        });
    }

    function playCurrentSound() {
        const question = getCurrentQuestion();
        if (!question) return;
        playAudio(question.answer.sound);
    }

    function getCurrentQuestion() {
        return state.questions[state.index] || null;
    }

    function makeQuestion(answer, pool) {
        const distractors = shuffle(pool.filter((item) => item.name !== answer.name)).slice(0, CHOICE_COUNT - 1);
        return {
            answer,
            choices: shuffle([answer, ...distractors])
        };
    }

    function makeAssetId(item) {
        return `zoo-sound-${normalizeName(item && item.name)}`;
    }

    function ensureQuestionLog(question, index) {
        if (!question) return null;
        if (!state.questionLogs[index]) {
            state.questionLogs[index] = {
                index: index + 1,
                stageId: state.stageId,
                answerName: question.answer.name,
                sound: question.answer.sound,
                answerPhoto: question.answer.photo,
                answerIllust: question.answer.illust,
                answered: false,
                firstCorrect: false,
                wrongAttempts: 0,
                selectedNames: [],
                completedAt: ''
            };
        }
        return state.questionLogs[index];
    }

    function buildAttemptPayload(options = {}) {
        const reason = String(options.reason || 'completed').trim();
        const forceCompleted = Boolean(options.forceCompleted);
        const sessionContext = getStoredLabSessionContext();
        const clientId = String(sessionContext.clientId || '').trim();
        const teacherId = String(sessionContext.teacherId || '').trim();
        const totalQuestions = state.questions.length;
        const stage = STAGES[state.stageId] || STAGES.word;
        const completed = forceCompleted || (totalQuestions > 0 && state.questionLogs.filter((log) => log && log.answered).length >= totalQuestions);

        if (!state.runId || !state.startedAt || !totalQuestions || !clientId || !teacherId || !state.supabase) {
            return null;
        }
        if (state.savedRunIds[state.runId]) {
            return null;
        }

        const logs = state.questions.map((question, index) => ensureQuestionLog(question, index)).filter(Boolean);
        const correctCount = logs.filter((log) => log.firstCorrect === true).length;
        const wrongItems = logs.filter((log) => log.firstCorrect !== true);
        const wrongCount = Math.max(totalQuestions - correctCount, 0);
        const score = Math.max(0, Math.min(100, Math.round((correctCount / Math.max(totalQuestions, 1)) * 100)));
        const durationSeconds = Math.max(1, Math.round((Date.now() - new Date(state.startedAt).getTime()) / 1000));

        return {
            runId: state.runId,
            reason,
            payload: {
                p_client_id: clientId,
                p_teacher_id: teacherId,
                p_curriculum_key: CURRICULUM_KEY,
                p_stage_key: stage.id,
                p_stage_order: STAGE_ORDER_MAP[stage.id] || 1,
                p_stage_title: `동물 소리 찾기 · ${stage.title}`,
                p_total_questions: totalQuestions,
                p_correct_count: correctCount,
                p_wrong_count: wrongCount,
                p_score: score,
                p_cleared: completed && correctCount >= totalQuestions,
                p_duration_seconds: durationSeconds,
                p_wrong_asset_ids: wrongItems.map((log) => makeAssetId({ name: log.answerName })).filter(Boolean),
                p_wrong_words: wrongItems.map((log) => String(log.answerName || '').trim()).filter(Boolean),
                p_question_snapshot: state.questions.map((question, index) => ({
                    assetId: makeAssetId(question.answer),
                    word: question.answer.name,
                    sound: question.answer.sound,
                    difficultyScore: STAGE_ORDER_MAP[stage.id] || 1,
                    tokens: ['동물 소리', stage.title, `문항 ${index + 1}`]
                })),
                p_result_snapshot: logs.map((log) => ({
                    assetId: makeAssetId({ name: log.answerName }),
                    word: log.answerName,
                    solved: log.firstCorrect === true,
                    answered: log.answered === true,
                    firstCorrect: log.firstCorrect === true,
                    wrongAttempts: log.wrongAttempts,
                    selectedNames: log.selectedNames,
                    score: log.firstCorrect === true ? 100 : 0,
                    completedAt: log.completedAt || ''
                }))
            }
        };
    }

    async function persistActiveSession(options = {}) {
        const snapshot = buildAttemptPayload(options);
        if (!snapshot) return false;

        try {
            state.savedRunIds[snapshot.runId] = 'saving';
            const result = await state.supabase.rpc('record_cardlab_learning_attempt', snapshot.payload);
            if (result && result.error) throw result.error;
            state.savedRunIds[snapshot.runId] = snapshot.reason || 'completed';
            return true;
        } catch (error) {
            delete state.savedRunIds[snapshot.runId];
            console.error('[CardLabZooSound] save failed:', error);
            return false;
        }
    }

    function startStage(stageId) {
        stopAllAudio();
        const stage = STAGES[stageId] || STAGES.word;
        const pool = getPlayableItems();
        if (pool.length < CHOICE_COUNT) {
            setFeedback('동물 카드와 소리 파일을 확인해 주세요.', 'wrong');
            return;
        }
        state.stageId = stage.id;
        state.questions = shuffle(pool).slice(0, Math.min(QUESTION_COUNT, pool.length)).map((answer) => makeQuestion(answer, pool));
        state.index = 0;
        state.correctCount = 0;
        state.wrongCount = 0;
        state.answered = false;
        state.questionHadWrong = false;
        state.runId = `${CURRICULUM_KEY}-${stage.id}-${Date.now()}`;
        state.startedAt = new Date().toISOString();
        state.questionLogs = [];
        setStageChips(stage);
        setScreen('gameScreen');
        renderQuestion();
        playCurrentSound();
    }

    function renderQuestion() {
        const stage = STAGES[state.stageId] || STAGES.word;
        const question = getCurrentQuestion();
        if (!question) {
            finishStage();
            return;
        }
        state.answered = false;
        state.questionHadWrong = false;
        ensureQuestionLog(question, state.index);
        if (elements.stageTitle) elements.stageTitle.textContent = stage.title;
        if (elements.stageDescription) elements.stageDescription.textContent = stage.description;
        setFeedback('동물 소리를 듣고 아래 보기에서 골라보세요.', '');
        hideAnswerModal();
        renderChoices(question, stage);
    }

    function renderChoices(question, stage) {
        elements.choiceGrid.innerHTML = question.choices.map((choice) => {
            const isWord = stage.id === 'word';
            const imagePath = stage.id === 'photo' ? choice.photo : choice.illust;
            return `
                <button type="button" class="zoo-choice-card" data-name="${escapeHtml(choice.name)}" aria-label="${escapeHtml(choice.name)}">
                    ${isWord ? `<span class="zoo-choice-word">${escapeHtml(choice.name)}</span>` : `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(choice.name)}">`}
                </button>
            `;
        }).join('');
    }

    function setFeedback(text, type) {
        elements.feedbackText.textContent = text;
        elements.feedbackText.classList.toggle('is-correct', type === 'correct');
        elements.feedbackText.classList.toggle('is-wrong', type === 'wrong');
    }

    function hideAnswerModal() {
        elements.answerModal.classList.remove('is-active');
        elements.answerModal.setAttribute('aria-hidden', 'true');
    }

    function showAnswerModal(item) {
        elements.answerOrder.textContent = `${state.index + 1}번째 문제`;
        elements.answerName.textContent = item.name;
        elements.answerDescription.textContent = item.description || '소리와 동물의 모습을 함께 연결해 보세요.';
        elements.answerPhoto.src = item.photo;
        elements.answerPhoto.alt = `${item.name} 사진`;
        elements.answerIllust.src = item.illust;
        elements.answerIllust.alt = `${item.name} 일러스트`;
        elements.answerModal.classList.add('is-active');
        elements.answerModal.setAttribute('aria-hidden', 'false');
        elements.nextButton.focus();
    }

    function handleChoiceClick(event) {
        const button = event.target.closest('.zoo-choice-card');
        if (!button || state.answered) return;
        const question = getCurrentQuestion();
        if (!question) return;
        const selectedName = normalizeName(button.dataset.name);
        const isCorrect = selectedName === question.answer.name;
        const log = ensureQuestionLog(question, state.index);
        if (log) {
            log.selectedNames.push(selectedName);
        }

        if (isCorrect) {
            state.answered = true;
            if (log) {
                log.answered = true;
                log.firstCorrect = !state.questionHadWrong;
                log.completedAt = new Date().toISOString();
            }
            if (!state.questionHadWrong) state.correctCount += 1;
            button.classList.add('is-correct');
            elements.choiceGrid.querySelectorAll('.zoo-choice-card').forEach((choiceButton) => {
                choiceButton.disabled = true;
            });
            setFeedback('', 'correct');
            if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('correct', { sound: false });
            playAudio(EFFECT_SOUNDS.correct, { effect: true });
            window.setTimeout(() => {
                if (!state.answered || getCurrentQuestion() !== question) return;
                goNext();
            }, 900);
        } else {
            state.questionHadWrong = true;
            state.wrongCount += 1;
            if (log) {
                log.wrongAttempts += 1;
            }
            button.classList.add('is-wrong');
            window.setTimeout(() => button.classList.remove('is-wrong'), 420);
            setFeedback('다시 들어보고 골라요.', 'wrong');
            if (window.HahaFeedbackOverlay) window.HahaFeedbackOverlay.showQuestionComplete('wrong', { sound: false });
            playAudio(EFFECT_SOUNDS.wrong, { effect: true });
        }
    }

    function goNext() {
        if (!state.answered) return;
        hideAnswerModal();
        state.index += 1;
        if (state.index >= state.questions.length) {
            finishStage();
            return;
        }
        renderQuestion();
        playCurrentSound();
    }

    function finishStage() {
        stopAudio();
        persistActiveSession({ reason: 'completed', forceCompleted: true });
        const total = Math.max(state.questions.length, 1);
        const accuracy = Math.round((state.correctCount / total) * 100);
        const stage = STAGES[state.stageId] || STAGES.word;
        elements.completeTitle.textContent = '스테이지 완료';
        elements.completeDescription.textContent = '동물 소리를 듣고 알맞은 보기를 찾는 연습을 마쳤어요. 점수는 첫 반응을 기준으로 계산했어요.';
        elements.completeScore.textContent = `첫 반응 정답 ${state.correctCount} / ${total}`;
        elements.completeAccuracy.textContent = `정확도 ${accuracy}%`;
        setScreen('completeScreen');
        playAudio(EFFECT_SOUNDS.complete, { effect: true });
    }

    function goIntro() {
        stopAllAudio();
        hideAnswerModal();
        state.stageId = '';
        setStageChips(null);
        setScreen('introScreen');
    }

    async function exitPage() {
        stopAllAudio();
        await persistActiveSession({ reason: 'interrupted', forceCompleted: false });
        if (window.history.length > 1) {
            window.history.back();
            return;
        }
        window.location.href = '../index.html';
    }

    function openHelpModal() {
        elements.helpModal.classList.add('is-active');
        elements.helpModal.setAttribute('aria-hidden', 'false');
    }

    function closeHelpModal() {
        elements.helpModal.classList.remove('is-active');
        elements.helpModal.setAttribute('aria-hidden', 'true');
    }

    function bindEvents() {
        document.querySelectorAll('[data-stage]').forEach((button) => {
            button.addEventListener('click', () => startStage(button.dataset.stage));
        });
        elements.choiceGrid.addEventListener('click', handleChoiceClick);
        elements.soundButton.addEventListener('click', playCurrentSound);
        elements.nextButton.addEventListener('click', goNext);
        elements.retryButton.textContent = '현재 단계 다시 풀기';
        elements.stageHomeButton.textContent = '다른 단계 선택하기';
        elements.retryButton.addEventListener('click', () => startStage(state.stageId || 'word'));
        elements.stageHomeButton.addEventListener('click', goIntro);
        elements.stageSelectButton.addEventListener('click', goIntro);
        elements.helpButton.addEventListener('click', openHelpModal);
        elements.helpModalOk.addEventListener('click', closeHelpModal);
        elements.helpModal.addEventListener('click', (event) => {
            if (event.target.matches('[data-help-close]')) closeHelpModal();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeHelpModal();
            }
            if (event.code === 'Space' && elements.gameScreen.classList.contains('is-active')) {
                event.preventDefault();
                playCurrentSound();
            }
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAllAudio();
        });
        window.addEventListener('blur', stopAllAudio, { passive: true });
        window.addEventListener('pagehide', stopAllAudio, { passive: true });
        window.addEventListener('beforeunload', stopAllAudio, { passive: true });
    }

    function cacheElements() {
        [
            'introScreen',
            'gameScreen',
            'completeScreen',
            'shellStageLabel',
            'stageTitle',
            'stageDescription',
            'stageSelectButton',
            'soundButton',
            'feedbackText',
            'choiceGrid',
            'answerModal',
            'answerOrder',
            'answerName',
            'answerDescription',
            'answerPhoto',
            'answerIllust',
            'nextButton',
            'completeTitle',
            'completeDescription',
            'completeScore',
            'completeAccuracy',
            'retryButton',
            'stageHomeButton',
            'helpButton',
            'helpModal',
            'helpModalOk'
        ].forEach((id) => {
            elements[id] = $(id);
        });
    }

    function init() {
        cacheElements();
        initSupabase();
        buildItemMap();
        bindEvents();
        setStageChips(null);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
