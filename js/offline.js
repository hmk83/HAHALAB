(function () {
    'use strict';

    const OVERLAY_ID = 'hahaOfflineOverlay';
    const OFFLINE_MESSAGE = '인터넷 연결이 안 되어 있습니다. 하하랩을 정상적으로 이용하려면 인터넷을 연결해 주세요.';
    const RETRY_TIMEOUT_MS = 4500;

    const getHealthCheckUrl = () => {
        if (!window.location.origin || window.location.origin === 'null') {
            return window.location.href;
        }
        return `${window.location.origin}/?haha_offline_check=${Date.now()}`;
    };

    const createOverlay = () => {
        const existing = document.getElementById(OVERLAY_ID);
        if (existing) return existing;

        const overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.className = 'haha-offline-overlay';
        overlay.setAttribute('role', 'alertdialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'hahaOfflineTitle');
        overlay.setAttribute('aria-describedby', 'hahaOfflineDescription');
        overlay.innerHTML = `
            <section class="haha-offline-card">
                <div class="haha-offline-loader-wrap" aria-hidden="true">
                    <div id="wifi-loader">
                        <svg viewBox="0 0 86 86" class="circle-outer" focusable="false">
                            <circle r="40" cy="43" cx="43" class="back"></circle>
                            <circle r="40" cy="43" cx="43" class="front"></circle>
                            <circle r="40" cy="43" cx="43" class="new"></circle>
                        </svg>
                        <svg viewBox="0 0 60 60" class="circle-middle" focusable="false">
                            <circle r="27" cy="30" cx="30" class="back"></circle>
                            <circle r="27" cy="30" cx="30" class="front"></circle>
                        </svg>
                        <svg viewBox="0 0 34 34" class="circle-inner" focusable="false">
                            <circle r="14" cy="17" cx="17" class="back"></circle>
                            <circle r="14" cy="17" cx="17" class="front"></circle>
                        </svg>
                        <div data-text="OFFLINE" class="text"></div>
                    </div>
                    <span class="haha-offline-loader-badge">HL</span>
                </div>
                <h1 class="haha-offline-title" id="hahaOfflineTitle">인터넷 연결을 확인해 주세요.</h1>
                <p class="haha-offline-copy" id="hahaOfflineDescription">
                    하하랩 수업 콘텐츠를 불러오려면 네트워크 연결이 필요합니다.<br>
                    연결 상태를 확인한 뒤 다시 시도해 주세요.
                </p>
                <div class="haha-offline-status" aria-hidden="true">
                    <span></span>
                    <strong>연결 대기 중</strong>
                </div>
                <div class="haha-offline-actions">
                    <button type="button" class="haha-offline-button haha-offline-button--back" data-offline-back>이전으로 가기</button>
                    <button type="button" class="haha-offline-button haha-offline-button--retry" data-offline-retry>다시 시도</button>
                </div>
            </section>
        `;

        overlay.querySelector('[data-offline-back]').addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
                return;
            }
            window.location.href = '/';
        });

        overlay.querySelector('[data-offline-retry]').addEventListener('click', () => {
            retryConnection(overlay);
        });

        document.body.appendChild(overlay);
        return overlay;
    };

    const setVisible = (visible) => {
        const overlay = createOverlay();
        overlay.classList.toggle('is-visible', Boolean(visible));
        document.documentElement.classList.toggle('haha-offline-active', Boolean(visible));
    };

    const retryConnection = async (overlay) => {
        const button = overlay.querySelector('[data-offline-retry]');
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = '확인 중...';

        try {
            if (navigator.onLine === false) {
                throw new Error('BROWSER_OFFLINE');
            }

            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), RETRY_TIMEOUT_MS);
            const response = await fetch(getHealthCheckUrl(), {
                method: 'GET',
                cache: 'no-store',
                credentials: 'same-origin',
                signal: controller.signal
            });
            window.clearTimeout(timeout);

            if (!response || !response.ok) {
                throw new Error('NETWORK_UNAVAILABLE');
            }

            setVisible(false);
            window.location.reload();
        } catch (_error) {
            setVisible(true);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    };

    const handleOffline = () => setVisible(true);
    const handleOnline = () => {
        const overlay = createOverlay();
        if (overlay.classList.contains('is-visible')) {
            retryConnection(overlay);
        }
    };

    const init = () => {
        createOverlay();
        if (navigator.onLine === false) {
            setVisible(true);
        }
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
