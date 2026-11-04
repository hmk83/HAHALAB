// Public guardian capability contract. Never copy unknown keys or nested source objects.
export const GUARDIAN_SHARE_VERSION = 'guardian-aggregate-v1';
const TEXT_FIELDS = ['title', 'labTitle', 'stageTitle', 'reportType', 'reportProfileId', 'reportProfile', 'profileId', 'reportProfileLabel', 'reportScope', 'labKind', 'normProfile', 'normProfileLabel', 'focusKey', 'level', 'levelId', 'levelKey', 'levelLabel', 'difficultyLabel', 'ageGroupLabel', 'ageRangeLabel', 'domain', 'mode', 'scoreKind', 'wrongCountKind', 'reportEvidenceMode'];
const NUMBER_FIELDS = ['score', 'supportedCount', 'assistedCorrectCount', 'independentAccuracyRate', 'assistedRate', 'promptedCorrectRate', 'correctionRecoveryRate', 'placementAccuracy', 'transitionStability', 'cueTracking', 'conceptCoverage', 'connectionCount', 'difficultyIndex', 'benchmarkMs', 'memoryMs', 'rows', 'cols', 'sequenceLength', 'targetCount', 'optionCount', 'oddCount', 'distractorKinds', 'level', 'levelNumber', 'retryCount', 'replayCount', 'seenCount', 'audioReplayCount', 'visualReplayCount', 'teacherCueCount'];
const ALIASES = {
  totalItems: ['totalItems', 'totalQuestions', 'total_items', 'total_questions'],
  correctCount: ['correctCount', 'correct_count'], wrongCount: ['wrongCount', 'wrong_count'],
  completionCount: ['completionCount', 'completion_count'], perfectCount: ['perfectCount', 'perfect_count'],
  accuracyRate: ['accuracyRate', 'accuracy_rate'], firstTryRate: ['firstTryRate', 'first_try_rate'],
  completionRate: ['completionRate', 'completion_rate'],
  avgQuestionMs: ['avgQuestionMs', 'avg_question_ms', 'avgReactionMs', 'avg_reaction_ms'],
  elapsedMs: ['elapsedMs', 'elapsed_ms'],
  completedAtMs: ['completedAtMs', 'endedAtMs'],
};
const record = value => {
  if (typeof value === 'string') { try { value = JSON.parse(value); } catch { return {}; } }
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
};
const numeric = value => (typeof value === 'number' || typeof value === 'string' && value.trim()) && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
const text = (value, max = 200) => typeof value === 'string' ? value.slice(0, max) : '';

export function sanitizeGuardianSnapshot(snapshot) {
  const source = record(snapshot);
  const previousReport = record(source.report);
  const input = record(source.guardianInput || source.reportInput || previousReport.originalReportInput || source.report);
  const safe = {};
  for (const key of TEXT_FIELDS) if (typeof input[key] === 'string') safe[key] = text(input[key]);
  for (const [canonical, alias] of [['reportScope', 'report_scope'], ['labKind', 'lab_kind'], ['reportType', 'report_type']]) if (!safe[canonical] && typeof input[alias] === 'string') safe[canonical] = text(input[alias]);
  if (typeof input.accentColor === 'string' && /^#[0-9a-f]{3,8}$/i.test(input.accentColor)) safe.accentColor = input.accentColor;
  for (const key of NUMBER_FIELDS) { const value = numeric(input[key]); if (value !== null) safe[key] = value; }
  for (const [key, aliases] of Object.entries(ALIASES)) {
    safe[key] = aliases.map(alias => numeric(input[alias])).find(value => value !== null) ?? null;
  }
  // Match the existing engine's observed aggregate only; never ship the event sample.
  if (safe.avgQuestionMs === null) {
    let logs = input.questionLogs || input.question_logs || input.trialLogs || input.trial_logs;
    if (typeof logs === 'string') { try { logs = JSON.parse(logs); } catch { logs = []; } }
    const times = (Array.isArray(logs) ? logs : []).flatMap(log => {
      if (!log || typeof log !== 'object' || log.isValid === false || log.excluded === true || log.timedOut === true || log.timeout === true || log.responded === false || log.noResponse === true || /TIME.?OUT|MISS|OMISSION|CORRECT.?REJECT|WITHHOLD|NO.?RESPONSE|HELD|HOLD/i.test(String(log.outcome || log.result || log.responseType || ''))) return [];
      const value = numeric(log.responseMs ?? log.reactionMs ?? log.responseTimeMs);
      return value !== null && value > 0 ? [value] : [];
    });
    if (times.length) safe.avgQuestionMs = times.reduce((sum, value) => sum + value, 0) / times.length;
  }
  const quality = record(input.reportDataQuality);
  if (quality.source === 'history-aggregate') safe.reportEvidenceMode = 'observed-only';
  if (!safe.wrongCountKind && record(input.measurementContext).wrongCountKind === 'wrong-attempts') safe.wrongCountKind = 'wrong-attempts';
  for (const key of ['comparableHistoryCount', 'comparableRecordCount', 'historyCount', 'recordCount']) {
    const value = numeric(input[key]); if (value !== null) { safe.comparableHistoryCount = value; break; }
  }
  if (safe.comparableHistoryCount === undefined) {
    const history = [input.comparableHistory, input.sessionHistory, input.previousRecords, input.history, input.records].find(Array.isArray);
    if (history) safe.comparableHistoryCount = history.length;
  }
  const entry = record(source.entry);
  const safeEntry = {
    title: text(entry.title || safe.stageTitle || safe.title), subtitle: text(entry.subtitle),
    playedAt: text(entry.playedAt, 64), reportProfileId: text(entry.reportProfileId || safe.reportProfileId, 100),
    reportProfileLabel: text(entry.reportProfileLabel || safe.reportProfileLabel, 160),
  };
  if (safeEntry.subtitle.includes('재활랩')) { safe.labKind = 'rehab'; safe.reportScope = 'rehab'; }
  return {
    schemaVersion: GUARDIAN_SHARE_VERSION,
    entry: safeEntry,
    guardianInput: safe,
    provenance: { source: 'stored-history-guardian-aggregate', audienceScope: 'guardian', reviewStatus: 'automatic-unreviewed' },
  };
}
