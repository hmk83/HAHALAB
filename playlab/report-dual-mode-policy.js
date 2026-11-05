(function () {
  'use strict';

  const VERSION = '2026-07-10-report-dual-mode-v2';

  const REPORT_DUAL_MODE_POLICY = {
    version: VERSION,
    defaultMode: 'teacher',
    evidenceRegistry: 'data/report-evidence-registry-2026.json',
    reportLayers: [
      {
        id: 'observed-facts',
        order: 1,
        label: '관찰 사실',
        rule: '원본 로그에서 직접 확인되는 수행값과 과제 조건만 기록하며 해석 문장을 섞지 않는다.'
      },
      {
        id: 'interpretation-candidate',
        order: 2,
        label: '해석 후보',
        rule: '관찰 사실로 설명 가능한 복수의 후보를 비단정형으로 제시하고 진단 또는 인과 결론으로 표현하지 않는다.'
      },
      {
        id: 'response-plan',
        order: 3,
        label: '대응 계획',
        rule: '다음 활동은 자동 확정하지 않고 담당 선생님이 맥락을 확인할 조정 후보로 제시한다.'
      },
      {
        id: 'limits',
        order: 4,
        label: '한계',
        rule: '표본 수, 비교 조건, 과제 표준화 여부, 환경과 연습 효과 등 해석 제한을 명시한다.'
      }
    ],
    modes: {
      guardian: {
        id: 'guardian',
        label: '보호자 공유 모드',
        audience: '보호자와 가족',
        purpose: '상태를 이해하기 쉽게 공유하고 불안을 낮추는 요약',
        maxDetailLevel: 2,
        showRawMetrics: false,
        showDiagnosticLanguage: false,
        showClinicalTerms: false,
        showTeacherDecisionSupport: false,
        summaryBlocks: [
          '현재 관찰 요약',
          '지난 기록 대비 변화',
          '선생님 확인이 필요한 부분',
          '가정에서 참고할 수 있는 관찰 포인트'
        ],
        requiredTone: [
          '관찰 기반',
          '차분한 설명',
          '비단정형 문장',
          '선생님 검토 전제'
        ]
      },
      teacher: {
        id: 'teacher',
        label: '전문가 분석 모드',
        audience: '선생님, 기관 담당자, 치료 및 교육 전문가',
        purpose: '수행 로그와 오류 패턴을 기반으로 다음 개입 판단을 돕는 분석',
        maxDetailLevel: 5,
        showRawMetrics: true,
        showDiagnosticLanguage: false,
        showClinicalTerms: true,
        showTeacherDecisionSupport: true,
        summaryBlocks: [
          '수행 지표',
          '인지 영역별 변화',
          '오류 유형',
          '반응시간 및 변동성',
          '교사 검토용 조정 후보'
        ],
        requiredTone: [
          '데이터 기반',
          '관찰과 추정 분리',
          '임상 판단 보조',
          '근거 제한 명시'
        ]
      }
    },
    audienceFieldRules: {
      guardian: {
        requiredFields: ['observed-facts', 'response-plan', 'limits'],
        optionalFields: ['interpretation-candidate'],
        hiddenFields: ['raw-event-log', 'item-level-latency', 'diagnostic-hypothesis', 'clinical-score', 'normative-rank'],
        interpretationRule: '쉬운 관찰 문장만 허용하며 해석 후보는 선생님 확인이 필요한 가능성으로 축약한다.',
        actionRule: '가정 훈련 처방이 아니라 관찰 포인트와 선생님 상담 항목만 제공한다.'
      },
      teacher: {
        requiredFields: ['observed-facts', 'interpretation-candidate', 'response-plan', 'limits'],
        optionalFields: ['raw-event-log', 'item-level-latency', 'error-taxonomy'],
        hiddenFields: ['automated-diagnosis', 'automated-treatment-decision'],
        interpretationRule: '각 해석 후보를 뒷받침하는 관찰값과 대안 설명을 함께 표시한다.',
        actionRule: '조정 후보, 확인할 조건, 담당자 승인 상태를 구분한다.'
      }
    },
    comparisonGate: {
      sameConditionFields: ['task_id', 'task_version', 'difficulty', 'device_class', 'input_method', 'session_context'],
      stages: {
        1: { id: 'baseline', label: '기준선', allowedClaim: '현재 회기의 관찰 사실만 제시한다.' },
        2: { id: 'point-comparison', label: '2시점 비교', allowedClaim: '두 시점의 기술적 차이만 제시하며 추세로 부르지 않는다.' },
        3: { id: 'same-condition-trend', label: '동일 조건 추세', allowedClaim: '3회 이상 동일 조건 기록에서만 기술적 추세 후보를 제시한다.' }
      },
      mismatchResult: {
        id: 'comparison-withheld',
        label: '비교 보류',
        allowedClaim: '조건 차이를 표시하고 변화 또는 추세 해석을 보류한다.'
      },
      noDataResult: {
        id: 'no-data',
        label: '기록 없음',
        allowedClaim: '표시할 유효 회기가 없다.'
      },
      trendIsClinicalChange: false,
      limitation: '3회 기준은 서비스의 보수적 표시 게이트이며 신뢰도 검증, 표준화된 변화 기준 또는 임상적 유의성을 대신하지 않는다.'
    },
    metricRules: [
      {
        id: 'accuracy-rate',
        label: '정답률',
        sourceFields: ['score', 'correct_count', 'wrong_count', 'total_questions'],
        allowedInterpretation: '과제 이해와 수행 안정성을 보는 관찰 지표',
        limitation: '정답률만으로 인지 능력, 진단명, 장기 예후를 단정하지 않는다.'
      },
      {
        id: 'reaction-time',
        label: '반응 시간',
        sourceFields: ['median_reaction_ms', 'reaction_iqr_ms', 'avg_reaction_ms', 'reaction_time_ms', 'duration_seconds'],
        preferredSummary: {
          center: 'median_reaction_ms',
          spread: 'reaction_iqr_ms',
          fallback: ['avg_reaction_ms'],
          displayRule: '유효 반응시간 표본이 있으면 중앙값과 IQR을 우선하고 평균은 보조값으로만 표시한다.'
        },
        allowedInterpretation: '처리 속도와 과제 접근 방식의 변화를 살피는 보조 지표',
        limitation: '반응시간은 대체로 우측 편향되고 피로, 환경, 지시 이해, 운동 반응, 기기 지연과 이상값의 영향을 받을 수 있다.'
      },
      {
        id: 'reaction-variability',
        label: '반응 변동성',
        sourceFields: ['reaction_variability', 'response_variability', 'reactionScore'],
        allowedInterpretation: '주의 유지와 수행 일관성의 변화를 보는 보조 지표',
        limitation: 'ADHD나 주의 문제를 단독으로 판정하는 지표로 쓰지 않는다.'
      },
      {
        id: 'error-pattern',
        label: '오류 유형',
        sourceFields: ['wrong_words', 'wrong_asset_ids', 'errorPattern', 'weakness'],
        allowedInterpretation: '어떤 과제 조건에서 어려움이 반복되는지 찾는 교사 검토 지표',
        limitation: '문항 자체의 애매함, 이미지/음성 불일치 가능성을 먼저 분리한다.'
      },
      {
        id: 'adherence',
        label: '참여 및 순응도',
        sourceFields: ['completed', 'cleared', 'duration_minutes', 'session_count'],
        allowedInterpretation: '수업 참여 흐름과 지속 가능성을 보는 운영 지표',
        limitation: '참여도만으로 가정 수행 가능 여부나 다음 일정 확정을 자동 판단하지 않는다.'
      }
    ],
    scoreAndLabelRules: {
      compositeClinicalScore: {
        allowed: false,
        blockedCombination: ['accuracy-rate', 'reaction-time'],
        blockedScaleMax: 100,
        rule: '정확도와 반응시간을 임의 가중해 임상적 100점 점수로 합산하지 않는다.',
        reason: '두 지표는 서로 다른 변화와 교란 요인을 가질 수 있고 임상 가중치와 판정 기준이 검증되지 않았다.'
      },
      normativeLabels: {
        requireAll: ['standardized_task', 'validated_norms', 'population_match', 'administration_match'],
        blockedWhenRequirementsMissing: true,
        blockedExamples: ['정상', '경계', '위험군', '또래 상위', '또래 하위', '백분위', '표준점수'],
        fallbackLabel: '이 과제 내 수행 기록',
        rule: '비표준화 과제 또는 적합한 규준이 없는 과제에는 정상/경계/위험군, 또래 순위, 백분위, 표준점수 표현을 쓰지 않는다.'
      }
    },
    wording: {
      requiredDisclaimers: [
        '본 리포트는 학습 수행 기록을 바탕으로 한 관찰 자료이며, 진단이나 치료 효과 판정이 아닙니다.',
        '활동 조정은 내담자의 컨디션, 수업 맥락, 선생님의 전문 판단을 함께 고려해 결정합니다.'
      ],
      guardianAllowedPhrases: [
        '이번 활동에서는',
        '관찰되었습니다',
        '도움이 될 수 있습니다',
        '선생님이 확인해 조정합니다',
        '다음 활동 전 검토가 필요합니다',
        '가정에서는 부담 없이 관찰해 주세요'
      ],
      teacherAllowedPhrases: [
        '관찰 지표',
        '반응시간',
        '오류 유형',
        '수행 일관성',
        '조정 후보',
        '추가 관찰 필요',
        '근거 제한'
      ],
      blockedPhrases: [
        '진단됩니다',
        '치료되었습니다',
        '완치',
        'ADHD 확정',
        '인지장애 확정',
        '독립적 일상생활 수행 능력 20% 개선 예상',
        '반드시 개선됩니다',
        '다음 주 활동을 진행합니다',
        '자동으로 스케줄링합니다',
        '난이도를 확정 상향합니다',
        '정확도와 반응시간을 합산한 임상 100점 점수'
      ],
      riskyPhrasePatterns: [
        '([0-9]+)% 개선 예상',
        '([0-9]+)개월 내 .*개선',
        '독립적 일상생활.*개선',
        '진단(됨|됩니다|할 수 있습니다)',
        '치료 효과(가|를).*입증',
        '자동(으로)? .*스케줄',
        '다음 주 .*진행 예정',
        '(정확도|정답률).*반응시간.*(임상|진단).*(100점|100\\s*점)'
      ],
      replacementPhrases: {
        '다음 주 활동을 진행합니다': '다음 활동 전 선생님이 상태를 확인해 조정합니다',
        '자동으로 스케줄링합니다': '선생님 검토 후 조정 후보로 제안합니다',
        '난이도를 확정 상향합니다': '난이도 조정 후보로 검토할 수 있습니다',
        '개선 예상': '변화 가능성을 관찰합니다',
        '진단됩니다': '관찰이 필요합니다'
      }
    },
    actionPlanRules: {
      allowedActionLabels: [
        '유지 검토',
        '반복 관찰',
        '난이도 조정 후보',
        '휴식 또는 과제 길이 조정 검토',
        '전문가 추가 검토'
      ],
      blockedActionLabels: [
        '자동 확정',
        '필수 진행',
        '치료 완료',
        '진단 확정'
      ],
      teacherApprovalRequired: true
    },
    evidenceReferences: [
      {
        id: 'blinch-cousineau-2024-response-time-distribution',
        publicationYear: 2024,
        title: 'Response time distribution analysis of medium-sized datasets in MATLAB',
        url: 'https://doi.org/10.20982/tqmp.20.2.p106',
        appliedRule: '반응시간의 우측 편향과 이상값 영향을 고려해 중앙값과 IQR을 우선하는 기술 통계를 사용한다.',
        limitation: '논문은 충분한 시행 수에서 분포 분석을 권고하므로 중앙값/IQR만으로 분포 전체나 임상 변화를 설명할 수 없다.'
      },
      {
        id: 'nguyen-2024-digital-gonogo-preprint',
        publicationYear: 2024,
        title: 'Using a Novel Digital Go/No-Go to Dissociate Intra-subject Temporal Fluctuations in Reaction Time and Accuracy',
        url: 'https://pubmed.ncbi.nlm.nih.gov/38947017/',
        appliedRule: '정확도와 반응시간은 분리해 표시하고 시간대, 학습 및 회기 조건을 비교 한계로 기록한다.',
        limitation: '동료심사 전 성인 표본 연구이므로 아동 임상 기준이나 점수 가중치의 근거로 사용하지 않는다.'
      },
      {
        id: 'mokkink-2024-cosmin-guideline-v2',
        publicationYear: 2024,
        title: 'COSMIN guideline for systematic reviews of patient-reported outcome measures version 2.0',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11541334/',
        appliedRule: '검증된 측정 속성과 해석 가능성 없이 수행값에 임상 의미 또는 규준 라벨을 부여하지 않는다.',
        limitation: 'PROM 방법론 지침으로 게임형 수행 과제를 직접 검증한 문서는 아니다.'
      },
      {
        id: 'alsem-2024-parent-professional-sdm-roles',
        publicationYear: 2024,
        title: 'Exploring the shared in shared decision-making in the care for children with chronic diseases or disabilities',
        url: 'https://pubmed.ncbi.nlm.nih.gov/39694955/',
        appliedRule: '보호자와 전문가의 정보 요구와 의사결정 역할을 분리하되 대응 계획은 공유 검토 대상으로 둔다.',
        limitation: '역할에 관한 관점 논문으로 특정 리포트 필드 구성의 효과를 시험하지 않았다.'
      },
      {
        id: 'mindmore-2024-test-retest-practice-effects',
        publicationYear: 2024,
        title: 'Test-retest reliability, practice effects and estimates of change: A study on the Mindmore digital cognitive assessment tool',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11735254/',
        appliedRule: '반복 기록의 변화 해석 전에 기준선, 재검사 신뢰도와 연습 효과 가능성을 한계로 표시한다.',
        limitation: '특정 디지털 검사 도구 연구이므로 HAHA LAB 과제의 신뢰도나 변화 기준으로 전용할 수 없다.'
      },
      {
        id: 'global-ceo-initiative-2025-dca-standards',
        publicationYear: 2025,
        title: 'Acceptable standards for clinic-based digital cognitive assessments',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12710439/',
        appliedRule: '의도한 모집단의 규준, 신뢰도, 타당도와 시행 조건 검증이 없으면 임상 점수와 규준 라벨을 금지한다.',
        limitation: '알츠하이머병 중심 전문가 권고이므로 소아 교육·재활 과제에 직접 적용되는 표준은 아니다.'
      },
      {
        id: 'watson-2026-caregiver-goal-setting-consensus',
        publicationYear: 2026,
        title: 'Expert consensus on optimal goal-setting practices for caregivers of children with a disability or delay',
        url: 'https://pubmed.ncbi.nlm.nih.gov/42095423/',
        appliedRule: '보호자 우선순위와 일상 맥락을 전문가 관찰과 분리해 기록하고 다음 목표는 공유 검토 후보로 둔다.',
        limitation: '합의 연구는 절차 원칙을 지원하지만 HAHA LAB 문구나 결과 기준을 검증한 것은 아니다.'
      },
      {
        id: 'armstrong-2026-whole-class-oral-language-review',
        publicationYear: 2026,
        title: 'Effective Whole Class Oral Language Interventions and Strategies for Students with Developmental Language Disorder',
        url: 'https://pubmed.ncbi.nlm.nih.gov/42273712/',
        appliedRule: '임상 과제 수행과 교실·교육 참여 결과를 서로 다른 맥락으로 구분해 기록한다.',
        limitation: '학급 단위 중재 근거는 단일 디지털 과제의 개인 임상 절단점이나 일반화를 보장하지 않는다.'
      },
      {
        id: 'kannan-2026-clinical-visualization-review',
        publicationYear: 2026,
        title: 'Visualization of individual clinical outcomes for patients and professionals',
        url: 'https://pubmed.ncbi.nlm.nih.gov/41945985/',
        appliedRule: '비교 조건과 지표 방향이 명확할 때만 선·막대 시각화를 사용하고 표본 수와 정의를 함께 표시한다.',
        limitation: '모든 대상에게 최적인 단일 차트 형식은 없으며 시각화가 측정 타당성 부족을 보완할 수 없다.'
      },
      {
        id: 'jeong-2026-response-mode-effects',
        publicationYear: 2026,
        title: 'Response-mode effects in digital cognitive tasks for children',
        url: 'https://pubmed.ncbi.nlm.nih.gov/42190238/',
        appliedRule: '정확도와 반응시간 비교에는 기기, 입력 방식, 자극 형식, 반응 방식을 동일 조건 필드로 요구한다.',
        limitation: '특정 과제의 반응 방식 차이는 HAHA LAB 전체 과제에 적용할 보정계수를 제공하지 않는다.'
      }
    ]
  };

  function normalizeMode(mode) {
    const value = String(mode || '').trim().toLowerCase();
    if (value === 'parent' || value === 'family' || value === 'caregiver') return 'guardian';
    if (value === 'professional' || value === 'clinician' || value === 'institution') return 'teacher';
    return REPORT_DUAL_MODE_POLICY.modes[value] ? value : REPORT_DUAL_MODE_POLICY.defaultMode;
  }

  function getReportModeConfig(mode) {
    return REPORT_DUAL_MODE_POLICY.modes[normalizeMode(mode)];
  }

  function buildReportDisclaimer(mode) {
    const config = getReportModeConfig(mode);
    const base = REPORT_DUAL_MODE_POLICY.wording.requiredDisclaimers.slice();
    if (config.id === 'guardian') {
      base.push('보호자 공유 화면은 핵심 변화와 관찰 포인트만 쉽게 정리한 요약입니다.');
    } else {
      base.push('전문가 분석 화면은 수업 판단을 돕는 보조 자료이며, 최종 계획은 담당 선생님이 확정합니다.');
    }
    return base;
  }

  function scanReportText(text) {
    const source = String(text || '');
    const blocked = REPORT_DUAL_MODE_POLICY.wording.blockedPhrases.filter((phrase) => source.includes(phrase));
    const risky = REPORT_DUAL_MODE_POLICY.wording.riskyPhrasePatterns
      .map((pattern) => ({ pattern, regex: new RegExp(pattern) }))
      .filter((entry) => entry.regex.test(source))
      .map((entry) => entry.pattern);
    return {
      ok: blocked.length === 0 && risky.length === 0,
      blocked,
      risky
    };
  }

  function getMetricRule(metricId) {
    const id = String(metricId || '').trim();
    return REPORT_DUAL_MODE_POLICY.metricRules.find((rule) => rule.id === id) || null;
  }

  function getReportLayerConfig(layerId) {
    const id = String(layerId || '').trim();
    return REPORT_DUAL_MODE_POLICY.reportLayers.find((layer) => layer.id === id) || null;
  }

  function getComparisonStage(sessionCount, sameCondition) {
    const count = Math.max(0, Math.floor(Number(sessionCount) || 0));
    if (count === 0) {
      return Object.assign({ sessionCount: 0, canCompare: false, canDescribeTrend: false }, REPORT_DUAL_MODE_POLICY.comparisonGate.noDataResult);
    }
    if (sameCondition !== true && count >= 2) {
      return Object.assign({ sessionCount: count, canCompare: false, canDescribeTrend: false }, REPORT_DUAL_MODE_POLICY.comparisonGate.mismatchResult);
    }
    const stageKey = count >= 3 ? 3 : count >= 2 ? 2 : 1;
    return Object.assign({
      sessionCount: count,
      canCompare: stageKey >= 2,
      canDescribeTrend: stageKey >= 3
    }, REPORT_DUAL_MODE_POLICY.comparisonGate.stages[stageKey]);
  }

  function validateMetricPresentation(input) {
    const value = input || {};
    const components = Array.isArray(value.components) ? value.components : [];
    const compositeRule = REPORT_DUAL_MODE_POLICY.scoreAndLabelRules.compositeClinicalScore;
    const combinesBlockedMetrics = compositeRule.blockedCombination.every((id) => components.includes(id));
    const isClinicalHundredPointScore = combinesBlockedMetrics
      && Number(value.scaleMax) === compositeRule.blockedScaleMax
      && (value.isClinical === true || /임상|진단/.test(String(value.label || '')));

    const normativeRule = REPORT_DUAL_MODE_POLICY.scoreAndLabelRules.normativeLabels;
    const normativeRequirements = {
      standardized_task: value.standardizedTask === true,
      validated_norms: value.validatedNorms === true,
      population_match: value.populationMatch === true,
      administration_match: value.administrationMatch === true
    };
    const normativeAllowed = normativeRule.requireAll.every((key) => normativeRequirements[key]);
    const requestedNormativeLabel = value.usesNormativeLabel === true
      || normativeRule.blockedExamples.some((label) => String(value.label || '').includes(label));

    const violations = [];
    if (isClinicalHundredPointScore) violations.push('blocked-clinical-100-point-composite');
    if (requestedNormativeLabel && !normativeAllowed) violations.push('blocked-unvalidated-normative-label');
    return {
      ok: violations.length === 0,
      violations,
      normativeAllowed
    };
  }

  const api = {
    REPORT_DUAL_MODE_POLICY,
    normalizeMode,
    getReportModeConfig,
    buildReportDisclaimer,
    scanReportText,
    getMetricRule,
    getReportLayerConfig,
    getComparisonStage,
    validateMetricPresentation
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (typeof window !== 'undefined') {
    window.HahaLabReportDualMode = api;
  }
})();
