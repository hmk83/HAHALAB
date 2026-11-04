(function () {
  'use strict';

  const CONFIG = window.CARDLAB_HELP_PAGE_CONFIG || {};
  const PAGE_HELP = {
    association: {
      title: '꼬리 물기 연상 학습 안내',
      subtitle: '핵심 단어와 의미가 이어지는 낱말을 빠르게 떠올리며 어휘 연결력을 기르는 활동입니다.',
      methodTitle: '학습 방법',
      methodItems: [
        '핵심 낱말을 보고 관련 의미망을 따라 다음 낱말을 찾습니다.',
        '정답 후보를 비교하며 의미 범주와 연결 관계를 판단합니다.',
        '맞힌 뒤에는 바로 다음 연결로 넘어가 기억을 이어 갑니다.'
      ],
      benefitTitle: '도움이 되는 점',
      benefitItems: [
        '의미 관계 파악과 범주화 능력이 좋아집니다.',
        '관련 어휘를 빠르게 떠올리는 회상 속도가 향상됩니다.',
        '읽기 이해와 말하기에서 어휘 확장이 자연스럽게 일어납니다.'
      ]
    },
    wordbuild: {
      title: '단어 만들기 학습 안내',
      subtitle: '이미지와 뜻을 바탕으로 음절과 자모를 조합해 단어를 완성하는 읽기 기초 학습입니다.',
      methodTitle: '학습 방법',
      methodItems: [
        '그림과 설명을 보고 떠오르는 단어를 음절 단위로 완성합니다.',
        '자모 배열과 순서를 확인하며 정확한 철자 구조를 익힙니다.',
        '오디오 힌트와 글자 힌트를 활용해 스스로 수정합니다.'
      ],
      benefitTitle: '도움이 되는 점',
      benefitItems: [
        '음절 인식과 자모 결합 감각이 길러집니다.',
        '초기 읽기와 철자화, 받아쓰기 준비에 도움이 됩니다.',
        '소리-글자 대응을 반복하며 해독 정확도가 높아집니다.'
      ]
    },
    phonics: {
      title: '음운 인식 학습 안내',
      subtitle: '소리와 글자의 대응을 듣고 구분하며, 읽기와 쓰기의 기초를 다지는 훈련입니다.',
      methodTitle: '학습 방법',
      methodItems: [
        '소리를 듣고 해당하는 글자나 자모를 찾습니다.',
        '비슷한 소리를 구분하며 음운 단위의 차이를 익힙니다.',
        '정답을 고르며 소리 묶기와 합치기 과정을 반복합니다.'
      ],
      benefitTitle: '도움이 되는 점',
      benefitItems: [
        '자모-음가 대응이 안정되어 초기 해독이 쉬워집니다.',
        '비슷한 소리 구별 능력이 높아집니다.',
        '읽기와 맞춤법의 기초가 탄탄해집니다.'
      ]
    },
    quiz: {
      title: '카드 퀴즈 학습 안내',
      subtitle: '카드의 이름과 특징을 빠르게 확인하며 범주별 어휘를 폭넓게 익히는 활동입니다.',
      methodTitle: '학습 방법',
      methodItems: [
        '카드의 시각 정보와 이름을 함께 보고 범주를 판단합니다.',
        '비슷한 카드들을 비교하며 핵심 특징을 구분합니다.',
        '반복 확인을 통해 빠른 이름 찾기와 분류 능력을 키웁니다.'
      ],
      benefitTitle: '도움이 되는 점',
      benefitItems: [
        '사물 이름과 범주 개념이 함께 정리됩니다.',
        '시각 단서에서 의미를 빠르게 떠올리는 능력이 향상됩니다.',
        '어휘 회상 속도와 기억 유지에 도움이 됩니다.'
      ]
    },
    context: {
      title: '상황맞춤 어휘 학습 안내',
      subtitle: '문장 속 맥락을 읽고 빈칸에 알맞은 낱말을 고르며 의미와 문맥을 함께 이해하는 학습입니다.',
      methodTitle: '학습 방법',
      methodItems: [
        '문장 전체를 읽고 빈칸 앞뒤 단서를 함께 살핍니다.',
        '정답 후보를 뜻, 문맥, 문장 흐름에 맞게 비교합니다.',
        '선택한 낱말을 문장에 넣어 자연스럽게 읽히는지 확인합니다.'
      ],
      benefitTitle: '도움이 되는 점',
      benefitItems: [
        '문맥 기반 어휘 추론 능력이 좋아집니다.',
        '문장 이해와 어휘 선택을 함께 훈련할 수 있습니다.',
        '독해, 쓰기, 말하기에서 자연스러운 표현 선택에 도움이 됩니다.'
      ]
    },
    connective: {
      title: '접속어 다리놓기 학습 안내',
      subtitle: '앞뒤 문장의 관계를 읽고 알맞은 접속어를 고르며 문장 연결 감각을 기르는 학습입니다.',
      methodTitle: '학습 방법',
      methodItems: [
        '앞 문장과 뒤 문장의 관계를 먼저 살펴봅니다.',
        '원인과 결과, 대조, 선택, 순차 같은 연결 관계를 구분합니다.',
        '가로로 놓인 선택지에서 가장 자연스러운 접속어를 클릭하거나 드래그해 넣습니다.'
      ],
      benefitTitle: '도움이 되는 점',
      benefitItems: [
        '문장 간 논리 관계를 읽어 내는 힘이 좋아집니다.',
        '글을 쓸 때 자연스러운 연결 표현을 고르는 감각이 자랍니다.',
        '독해와 서술형 쓰기에서 문장 흐름을 정교하게 이해하는 데 도움이 됩니다.'
      ]
    },
    josa: {
      title: '조사 연결 학습 안내',
      subtitle: '문장 성분 관계를 살피며 알맞은 조사를 고르는 활동으로, 기본 문장 구조와 연결 감각을 기르는 학습입니다.',
      methodTitle: '학습 방법',
      methodItems: [
        '문장 속 빈칸 앞뒤를 함께 읽고 주어, 목적어, 장소, 방향을 구분합니다.',
        '받침 유무와 조사 쓰임을 비교하며 자연스러운 조사를 고릅니다.',
        '무작위로 섞인 문항을 반복해 조사 선택 감각을 익힙니다.'
      ],
      benefitTitle: '도움이 되는 점',
      benefitItems: [
        '문장 성분과 조사 기능을 구분하는 기초 문법 이해가 좋아집니다.',
        '받침, 높임, 장소, 범위 표현을 정확하게 익힐 수 있습니다.',
        '읽기와 쓰기에서 어색한 표현을 줄이고 문장 완성도가 높아집니다.'
      ]
    },
    synonym: {
      title: '유의어·반의어 학습 안내',
      subtitle: '제시어의 뜻을 바탕으로 같은 뜻과 반대 뜻을 구별하며 어휘 의미망을 넓히는 학습입니다.',
      methodTitle: '학습 방법',
      methodItems: [
        '제시어를 먼저 읽고 뜻이 같은지, 반대인지 구분합니다.',
        '품사와 문맥을 함께 살펴 가장 자연스러운 낱말을 고릅니다.',
        '10문항씩 무작위로 풀며 여러 표현을 반복해서 익힙니다.'
      ],
      benefitTitle: '도움이 되는 점',
      benefitItems: [
        '유의어와 반의어를 묶어 어휘 관계를 체계적으로 이해할 수 있습니다.',
        '뜻 비교 능력이 높아져 읽기와 쓰기에서 표현 선택이 정교해집니다.',
        '낱말 의미망이 넓어져 독해와 서술형 답안 작성에 도움이 됩니다.'
      ]
    }
  };

  function inferPageKey() {
    const configuredKey = String(CONFIG.pageKey || '').trim();
    if (configuredKey) return configuredKey;
    const text = [
      CONFIG.title,
      CONFIG.subtitle,
      document.title
    ]
      .map((value) => String(value || ''))
      .join(' ');
    if (/조사/.test(text)) return 'josa';
    if (/(유의어|반의어)/.test(text)) return 'synonym';
    if (/상황맞춤/.test(text)) return 'context';
    if (/(접속어|다리놓기)/.test(text)) return 'connective';
    if (/음운/.test(text)) return 'phonics';
    if (/단어 만들기/.test(text)) return 'wordbuild';
    if (/연상/.test(text)) return 'association';
    if (/퀴즈/.test(text)) return 'quiz';
    return '';
  }

  function buildStaticHelpConfig() {
    const pageHelp = PAGE_HELP[inferPageKey()] || {};
    return {
      title: String(CONFIG.title || pageHelp.title || '학습 안내'),
      subtitle: String(CONFIG.subtitle || pageHelp.subtitle || ''),
      methodTitle: String(CONFIG.methodTitle || pageHelp.methodTitle || '학습 방법'),
      methodItems: Array.isArray(CONFIG.methodItems) && CONFIG.methodItems.length ? CONFIG.methodItems : (pageHelp.methodItems || []),
      benefitTitle: String(CONFIG.benefitTitle || pageHelp.benefitTitle || '도움이 되는 점'),
      benefitItems: Array.isArray(CONFIG.benefitItems) && CONFIG.benefitItems.length ? CONFIG.benefitItems : (pageHelp.benefitItems || [])
    };
  }

  function normalizeHelpConfig(config) {
    const fallback = buildStaticHelpConfig();
    const source = config && typeof config === 'object' ? config : fallback;
    return {
      title: String(source.title || fallback.title || '학습 안내'),
      subtitle: String(source.subtitle || fallback.subtitle || ''),
      methodTitle: String(source.methodTitle || fallback.methodTitle || '학습 방법'),
      methodItems: Array.isArray(source.methodItems) && source.methodItems.length ? source.methodItems : fallback.methodItems,
      benefitTitle: String(source.benefitTitle || fallback.benefitTitle || '도움이 되는 점'),
      benefitItems: Array.isArray(source.benefitItems) && source.benefitItems.length ? source.benefitItems : fallback.benefitItems
    };
  }

  function resolveHelpConfig() {
    if (typeof CONFIG.getContent === 'function') {
      try {
        return normalizeHelpConfig(CONFIG.getContent());
      } catch (error) {
        return normalizeHelpConfig();
      }
    }
    return normalizeHelpConfig();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ensureModal() {
    let modal = document.getElementById('helpModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'helpModal';
    modal.className = 'help-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = [
      '<div class="help-modal-backdrop" data-help-close></div>',
      '<div class="help-modal-card" role="dialog" aria-modal="true" aria-labelledby="helpModalTitle" aria-describedby="helpModalDesc">',
      '  <div class="help-modal-head">',
      '    <div>',
      '      <div id="helpModalTitle" class="help-modal-title"></div>',
      '      <div id="helpModalDesc" class="help-modal-subtitle"></div>',
      '    </div>',
      '    <button type="button" class="help-modal-close" data-help-close aria-label="학습 안내 닫기">×</button>',
      '  </div>',
      '  <div class="help-modal-sections">',
      '    <section class="help-modal-section">',
      '      <div class="help-modal-section-title" id="helpModalMethodTitle"></div>',
      '      <ul id="helpModalMethodList" class="help-modal-list"></ul>',
      '    </section>',
      '    <section class="help-modal-section">',
      '      <div class="help-modal-section-title" id="helpModalBenefitTitle"></div>',
      '      <ul id="helpModalBenefitList" class="help-modal-list"></ul>',
      '    </section>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);
    return modal;
  }

  function fillModal(modal) {
    const helpConfig = resolveHelpConfig();
    const title = modal.querySelector('#helpModalTitle');
    const desc = modal.querySelector('#helpModalDesc');
    const methodTitle = modal.querySelector('#helpModalMethodTitle');
    const benefitTitle = modal.querySelector('#helpModalBenefitTitle');
    const methodList = modal.querySelector('#helpModalMethodList');
    const benefitList = modal.querySelector('#helpModalBenefitList');

    if (title) title.textContent = helpConfig.title;
    if (desc) desc.textContent = helpConfig.subtitle;
    if (methodTitle) methodTitle.textContent = helpConfig.methodTitle;
    if (benefitTitle) benefitTitle.textContent = helpConfig.benefitTitle;
    if (methodList) methodList.innerHTML = helpConfig.methodItems.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('');
    if (benefitList) benefitList.innerHTML = helpConfig.benefitItems.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('');
  }

  function openModal(modal) {
    fillModal(modal);
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
  }

  function init() {
    const modal = ensureModal();
    const helpButtons = Array.prototype.slice.call(document.querySelectorAll('[data-action="help"], #helpButton'));
    if (helpButtons.length) {
      helpButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          openModal(modal);
        });
      });
    }

    modal.addEventListener('click', function (event) {
      if (event.target && event.target.hasAttribute('data-help-close')) {
        closeModal(modal);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal(modal);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
