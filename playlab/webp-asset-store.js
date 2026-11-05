(function initPlaylabWebpAssetStore(global) {
  'use strict';

  var TABLE_NAME = 'playlab_webp_assets';
  var TABLE_CANDIDATES = [
    'playlab_webp_assets',
    'playlab_webp_asset',
    'webp_assets',
    'playlab_assets'
  ];
  var LOCAL_CACHE_KEY = '__PLAYLAB_WEBP_ADMIN_CACHE_V1__';

  var CATEGORY_LABELS = {
    animal: '동물',
    bird: '새',
    insect: '곤충',
    fruit: '과일',
    vegetable: '채소',
    food: '음식',
    vehicle: '탈것',
    conveyance: '이동수단',
    craft: '비행/선박',
    'public-place': '공공장소',
    livingspace: '생활공간',
    'sea-animal': '바다동물',
    recreation: '여가활동',
    face: '얼굴/표정',
    items: '사물',
    etc: '기타'
  };

  var TYPE_LABELS = {
    illust: '일러스트',
    photo: '사진',
    unknown: '미분류'
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function fnv1a(input) {
    var hash = 0x811c9dc5;
    var str = String(input || '');
    for (var i = 0; i < str.length; i += 1) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
  }

  function toArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map(function (v) { return v.trim(); }).filter(Boolean);
    }
    return [];
  }

  function toBool(v, fallback) {
    if (typeof v === 'boolean') return v;
    if (v === 'true') return true;
    if (v === 'false') return false;
    return !!fallback;
  }

  function normalizeType(value) {
    var v = String(value || 'unknown').toLowerCase();
    if (v === 'illust' || v === 'photo' || v === 'unknown') return v;
    return 'unknown';
  }

  function normalizeCategory(value) {
    var key = String(value || 'etc').trim().toLowerCase();
    return CATEGORY_LABELS[key] ? key : 'etc';
  }

  function normalizePath(value) {
    return String(value || '').replace(/\\/g, '/').replace(/^\.?\//, '');
  }

  function normalizeTableName(value) {
    var raw = String(value || '').trim();
    if (!raw) return '';
    var stripped = raw.replace(/["`]/g, '');
    var last = stripped.split('.').pop();
    return String(last || '').trim();
  }

  function isBigSourcePath(pathLike) {
    var normalized = normalizePath(pathLike).toLowerCase();
    if (!normalized) return false;
    return /(^|\/)big(\/|$)/.test(normalized);
  }

  function parseStem(stem) {
    var cleaned = String(stem || '').replace(/(?: \(\d+\)| \d+)$/, '');
    var parts = cleaned.split('-').filter(Boolean);
    var assetType = 'unknown';

    if (parts.length && (parts[parts.length - 1] === 'illust' || parts[parts.length - 1] === 'photo')) {
      assetType = parts.pop();
    }

    var category = 'etc';
    if (parts[0] === 'sea' && parts[1] === 'animal') {
      category = 'sea-animal';
      parts.splice(0, 2);
    } else if (parts[0] === 'public' && parts[1] === 'place') {
      category = 'public-place';
      parts.splice(0, 2);
    } else if (parts[0] && CATEGORY_LABELS[parts[0]]) {
      category = parts.shift();
    }

    return {
      asset_type: normalizeType(assetType),
      category: normalizeCategory(category),
      name_en: parts.join('-') || cleaned
    };
  }

  function titleCaseFallback(name) {
    return String(name || '')
      .split('-')
      .filter(Boolean)
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(' ');
  }

  function buildAssetFromRelativePath(relativePath, options) {
    var opts = options || {};
    var rel = normalizePath(relativePath);
    var fileName = rel.split('/').pop() || rel;
    var stem = fileName.replace(/\.webp$/i, '');
    var parsed = parseStem(stem);
    var autoName = String(opts.name_ko_auto || titleCaseFallback(parsed.name_en || stem));
    var id = String(opts.id || ('path-' + fnv1a(rel)));
    var sourceOnly = typeof opts.is_source_only === 'boolean' ? opts.is_source_only : isBigSourcePath(rel);
    var isBigFolder = typeof opts.is_big_folder === 'boolean' ? opts.is_big_folder : isBigSourcePath(rel);

    return normalizeAsset({
      id: id,
      file_path: rel,
      file_name: fileName,
      category: parsed.category,
      category_ko: CATEGORY_LABELS[parsed.category] || '기타',
      asset_type: parsed.asset_type,
      asset_type_ko: TYPE_LABELS[parsed.asset_type] || TYPE_LABELS.unknown,
      name_en: parsed.name_en,
      name_ko_auto: autoName,
      name_ko: String(opts.name_ko || autoName),
      description_ko: String(opts.description_ko || ''),
      tags: toArray(opts.tags || [parsed.category, parsed.asset_type].filter(Boolean)),
      notes: String(opts.notes || ''),
      is_active: typeof opts.is_active === 'boolean' ? opts.is_active : !sourceOnly,
      is_source_only: sourceOnly,
      is_big_folder: isBigFolder,
      source_dir: String(opts.source_dir || (rel.indexOf('/') >= 0 ? rel.slice(0, rel.lastIndexOf('/')) : 'images')),
      updated_at: nowIso(),
      updated_by: String(opts.updated_by || 'webp-admin')
    });
  }

  function normalizeAsset(raw) {
    var r = raw || {};
    var category = normalizeCategory(r.category);
    var assetType = normalizeType(r.asset_type);
    var nameEn = String(r.name_en || '').trim();
    var autoName = String(r.name_ko_auto || nameEn || r.file_name || '').trim();
    var manualName = String(r.name_ko || autoName).trim();
    var updatedAt = String(r.updated_at || nowIso());

    return {
      id: String(r.id || ''),
      file_path: normalizePath(r.file_path || ''),
      file_name: String(r.file_name || ''),
      category: category,
      category_ko: String(r.category_ko || CATEGORY_LABELS[category] || '기타'),
      asset_type: assetType,
      asset_type_ko: String(r.asset_type_ko || TYPE_LABELS[assetType] || TYPE_LABELS.unknown),
      name_en: nameEn,
      name_ko_auto: autoName,
      name_ko: manualName,
      description_ko: String(r.description_ko || ''),
      tags: toArray(r.tags),
      notes: String(r.notes || ''),
      is_active: toBool(r.is_active, !toBool(r.is_source_only, isBigSourcePath(r.file_path))),
      is_source_only: toBool(r.is_source_only, isBigSourcePath(r.file_path)),
      is_big_folder: toBool(r.is_big_folder, isBigSourcePath(r.file_path)),
      source_dir: String(r.source_dir || 'images'),
      updated_at: updatedAt,
      updated_by: String(r.updated_by || 'webp-admin'),
      dirty: !!r.dirty
    };
  }

  function assetSort(a, b) {
    if (a.category === b.category) return a.file_name.localeCompare(b.file_name, 'en');
    return a.category.localeCompare(b.category, 'en');
  }

  function loadManifest(manifestUrl) {
    return new Promise(function (resolve, reject) {
      if (global.PLAYLAB_WEBP_MANIFEST && Array.isArray(global.PLAYLAB_WEBP_MANIFEST.assets)) {
        resolve(global.PLAYLAB_WEBP_MANIFEST.assets.map(normalizeAsset).sort(assetSort));
        return;
      }

      var url = manifestUrl || 'webp-manifest.json';
      fetch(url, { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('manifest fetch failed: ' + res.status);
          return res.json();
        })
        .then(function (json) {
          var list = Array.isArray(json && json.assets) ? json.assets : [];
          resolve(list.map(normalizeAsset).sort(assetSort));
        })
        .catch(reject);
    });
  }

  function loadLocalCache() {
    try {
      var raw = localStorage.getItem(LOCAL_CACHE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      var list = Array.isArray(parsed && parsed.assets) ? parsed.assets : [];
      return list.map(normalizeAsset);
    } catch (err) {
      return [];
    }
  }

  function saveLocalCache(assets) {
    var list = (Array.isArray(assets) ? assets : []).map(normalizeAsset);
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({
      updated_at: nowIso(),
      assets: list
    }));
  }

  function timestampMs(value) {
    var t = Date.parse(value || '');
    return Number.isFinite(t) ? t : 0;
  }

  function mergeAssetRows(baseList, overlayList) {
    var map = new Map();
    (Array.isArray(baseList) ? baseList : []).forEach(function (row) {
      var normalized = normalizeAsset(row);
      map.set(normalized.id, normalized);
    });

    (Array.isArray(overlayList) ? overlayList : []).forEach(function (row) {
      var normalized = normalizeAsset(row);
      var prev = map.get(normalized.id);
      if (!prev) {
        map.set(normalized.id, normalized);
        return;
      }
      var useOverlay = timestampMs(normalized.updated_at) >= timestampMs(prev.updated_at);
      map.set(normalized.id, useOverlay ? Object.assign({}, prev, normalized) : Object.assign({}, normalized, prev));
    });

    return Array.from(map.values()).sort(assetSort);
  }

  function getSupabaseClient(options) {
    var opts = options || {};
    if (opts.client && typeof opts.client.from === 'function') return opts.client;
    if (global.supabase && typeof global.supabase.from === 'function') return global.supabase;
    if (global.supabase && typeof global.supabase.createClient === 'function' && opts.supabaseUrl && opts.supabaseKey) {
      return global.supabase.createClient(opts.supabaseUrl, opts.supabaseKey);
    }
    return null;
  }

  function isTableMissingError(error) {
    var msg = String((error && (error.message || error.details || error.hint || error.code)) || '');
    var lowered = msg.toLowerCase();
    return (
      lowered.indexOf("could not find the table") >= 0 ||
      lowered.indexOf("does not exist") >= 0 ||
      lowered.indexOf("relation") >= 0 ||
      lowered.indexOf("schema cache") >= 0 ||
      lowered.indexOf("pgrst") >= 0
    );
  }

  function probeTable(client, tableName) {
    var normalizedTableName = normalizeTableName(tableName);
    if (!client || typeof client.from !== 'function' || !normalizedTableName) {
      return Promise.resolve({ ok: false, tableName: tableName, error: new Error('invalid probe target') });
    }
    return client
      .from(normalizedTableName)
      .select('id')
      .limit(1)
      .then(function (res) {
        if (res && res.error) {
          return { ok: false, tableName: normalizedTableName, error: res.error };
        }
        return { ok: true, tableName: normalizedTableName, error: null };
      })
      .catch(function (error) {
        return { ok: false, tableName: normalizedTableName, error: error };
      });
  }

  function resolveAvailableTable(client, candidates) {
    if (!client || typeof client.from !== 'function') {
      return Promise.resolve({ tableName: null, error: new Error('supabase client unavailable') });
    }
    var seen = {};
    var queueRaw = []
      .concat(toArray(candidates))
      .concat([TABLE_NAME])
      .concat(TABLE_CANDIDATES);
    var queue = queueRaw.filter(function (name) {
      var key = normalizeTableName(name);
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });

    var idx = 0;
    function next(lastError) {
      if (idx >= queue.length) {
        return Promise.resolve({ tableName: null, error: lastError || new Error('no table candidate available') });
      }
      var tableName = queue[idx++];
      return probeTable(client, tableName).then(function (res) {
        if (res.ok) return { tableName: tableName, error: null };
        if (isTableMissingError(res.error)) return next(res.error);
        return { tableName: null, error: res.error };
      });
    }
    return next(null);
  }

  function fetchRemoteAssets(client, options) {
    var opts = options || {};
    var tableName = normalizeTableName(opts.tableName || TABLE_NAME);
    if (!client || typeof client.from !== 'function') return Promise.resolve({ data: [], error: new Error('supabase client unavailable') });
    return client.from(tableName).select('*').order('file_name', { ascending: true }).then(function (res) {
      if (res && res.error && isTableMissingError(res.error) && opts.fallbackCandidates) {
        return resolveAvailableTable(client, opts.fallbackCandidates).then(function (resolved) {
          if (!resolved.tableName) return { data: [], error: resolved.error || res.error, tableName: tableName };
          return client.from(resolved.tableName).select('*').order('file_name', { ascending: true }).then(function (retry) {
            var rowsRetry = Array.isArray(retry && retry.data) ? retry.data.map(normalizeAsset) : [];
            return { data: rowsRetry, error: retry ? retry.error : null, tableName: resolved.tableName };
          }).catch(function (retryError) {
            return { data: [], error: retryError, tableName: resolved.tableName };
          });
        });
      }
      var rows = Array.isArray(res && res.data) ? res.data.map(normalizeAsset) : [];
      return { data: rows, error: res ? res.error : null, tableName: tableName };
    }).catch(function (error) {
      return { data: [], error: error, tableName: tableName };
    });
  }

  function toDbRow(asset, actor) {
    var row = normalizeAsset(asset);
    var updater = String(actor || row.updated_by || 'webp-admin');
    return {
      id: row.id,
      file_path: row.file_path,
      file_name: row.file_name,
      category: row.category,
      category_ko: CATEGORY_LABELS[row.category] || row.category_ko || '기타',
      asset_type: row.asset_type,
      asset_type_ko: TYPE_LABELS[row.asset_type] || row.asset_type_ko || '미분류',
      name_en: row.name_en,
      name_ko_auto: row.name_ko_auto,
      name_ko: row.name_ko,
      description_ko: row.description_ko,
      tags: row.tags,
      notes: row.notes,
      is_active: row.is_active,
      is_source_only: row.is_source_only,
      is_big_folder: row.is_big_folder,
      source_dir: row.source_dir,
      updated_at: row.updated_at || nowIso(),
      updated_by: updater
    };
  }

  function chunkArray(list, size) {
    var out = [];
    for (var i = 0; i < list.length; i += size) {
      out.push(list.slice(i, i + size));
    }
    return out;
  }

  function upsertAssets(client, assets, actor, options) {
    var opts = options || {};
    var tableName = normalizeTableName(opts.tableName || TABLE_NAME);
    if (!client || typeof client.from !== 'function') {
      return Promise.resolve({ data: [], error: new Error('supabase client unavailable') });
    }
    var rows = (Array.isArray(assets) ? assets : []).map(function (asset) {
      return toDbRow(Object.assign({}, asset, { updated_at: nowIso() }), actor);
    });
    if (!rows.length) return Promise.resolve({ data: [], error: null });

    var chunks = chunkArray(rows, 200);
    var allData = [];
    return chunks.reduce(function (chain, chunk) {
      return chain.then(function (result) {
        if (result && result.error) return result;
        return client.from(tableName).upsert(chunk, { onConflict: 'id' }).select('*')
          .then(function (res) {
            if (res.error && isTableMissingError(res.error) && opts.fallbackCandidates) {
              return resolveAvailableTable(client, opts.fallbackCandidates).then(function (resolved) {
                if (!resolved.tableName) return { data: allData, error: resolved.error || res.error, tableName: tableName };
                tableName = resolved.tableName;
                return client.from(tableName).upsert(chunk, { onConflict: 'id' }).select('*')
                  .then(function (retry) {
                    if (retry.error) return { data: allData, error: retry.error, tableName: tableName };
                    var rowsRetry = Array.isArray(retry.data) ? retry.data : [];
                    allData = allData.concat(rowsRetry);
                    return { data: allData, error: null, tableName: tableName };
                  })
                  .catch(function (retryError) {
                    return { data: allData, error: retryError, tableName: tableName };
                  });
              });
            }
            if (res.error) return { data: allData, error: res.error };
            var rowsOut = Array.isArray(res.data) ? res.data : [];
            allData = allData.concat(rowsOut);
            return { data: allData, error: null };
          })
          .catch(function (error) {
            return { data: allData, error: error };
          });
      });
    }, Promise.resolve({ data: [], error: null, tableName: tableName })).then(function (res) {
      var normalized = Array.isArray(res.data) ? res.data.map(normalizeAsset) : [];
      return { data: normalized, error: res.error || null, tableName: res.tableName || tableName };
    });
  }

  function applyEdits(assets, edit) {
    var patch = edit || {};
    var patchId = String(patch.id || '');
    if (!patchId) return (Array.isArray(assets) ? assets : []).map(normalizeAsset).sort(assetSort);

    return (Array.isArray(assets) ? assets : []).map(function (asset) {
      var base = normalizeAsset(asset);
      if (base.id !== patchId) return base;

      var category = patch.category != null ? normalizeCategory(patch.category) : base.category;
      var assetType = patch.asset_type != null ? normalizeType(patch.asset_type) : base.asset_type;
      var nameKoValue = patch.name_ko != null ? String(patch.name_ko || '').trim() : base.name_ko;
      var sourceOnly = patch.is_source_only != null ? toBool(patch.is_source_only, base.is_source_only) : base.is_source_only;
      var merged = Object.assign({}, base, {
        category: category,
        category_ko: CATEGORY_LABELS[category] || base.category_ko,
        asset_type: assetType,
        asset_type_ko: TYPE_LABELS[assetType] || base.asset_type_ko,
        name_ko: nameKoValue || base.name_ko_auto,
        description_ko: patch.description_ko != null ? String(patch.description_ko || '') : base.description_ko,
        tags: patch.tags != null ? toArray(patch.tags) : base.tags,
        notes: patch.notes != null ? String(patch.notes || '') : base.notes,
        is_active: sourceOnly ? false : (patch.is_active != null ? toBool(patch.is_active, base.is_active) : base.is_active),
        is_source_only: sourceOnly,
        is_big_folder: patch.is_big_folder != null ? toBool(patch.is_big_folder, base.is_big_folder) : base.is_big_folder,
        updated_by: patch.updated_by ? String(patch.updated_by) : base.updated_by,
        updated_at: nowIso(),
        dirty: true
      });
      return normalizeAsset(merged);
    }).sort(assetSort);
  }

  function pickRandom(list, count, excludeId) {
    var pool = list.filter(function (item) {
      return item && item.id !== excludeId;
    });
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }
    return pool.slice(0, Math.max(0, count));
  }

  function buildQuestionChoices(assets, options) {
    var opts = options || {};
    var list = Array.isArray(assets) ? assets.map(normalizeAsset).filter(function (a) {
      return a.is_active && !a.is_source_only && !isBigSourcePath(a.file_path);
    }) : [];
    var targetId = String(opts.targetId || '');
    var count = Math.max(2, Number(opts.count || 4));
    var target = list.find(function (a) { return a.id === targetId; }) || null;
    if (!target && list.length) target = list[Math.floor(Math.random() * list.length)];
    if (!target) return { target: null, choices: [] };

    var candidatePool = list;
    if (opts.sameCategory) {
      var sameCat = list.filter(function (item) { return item.category === target.category && item.id !== target.id; });
      if (sameCat.length >= count - 1) candidatePool = sameCat;
    }
    if (opts.assetType && opts.assetType !== 'all') {
      var sameType = candidatePool.filter(function (item) { return item.asset_type === opts.assetType && item.id !== target.id; });
      if (sameType.length >= count - 1) candidatePool = sameType;
    }

    var wrong = pickRandom(candidatePool, count - 1, target.id);
    var choices = wrong.concat([target]).sort(function () { return Math.random() - 0.5; });
    return { target: target, choices: choices };
  }

  function clearLocalCache() {
    try {
      localStorage.removeItem(LOCAL_CACHE_KEY);
    } catch (err) {
      // no-op
    }
  }

  global.PlayLabWebpAssetStore = {
    TABLE_NAME: TABLE_NAME,
    LOCAL_CACHE_KEY: LOCAL_CACHE_KEY,
    CATEGORY_LABELS: Object.assign({}, CATEGORY_LABELS),
    TYPE_LABELS: Object.assign({}, TYPE_LABELS),
    normalizeAsset: normalizeAsset,
    parseStem: parseStem,
    isBigSourcePath: isBigSourcePath,
    normalizeTableName: normalizeTableName,
    buildAssetFromRelativePath: buildAssetFromRelativePath,
    titleCaseFallback: titleCaseFallback,
    loadManifest: loadManifest,
    loadLocalCache: loadLocalCache,
    saveLocalCache: saveLocalCache,
    clearLocalCache: clearLocalCache,
    mergeAssetRows: mergeAssetRows,
    isTableMissingError: isTableMissingError,
    resolveAvailableTable: resolveAvailableTable,
    TABLE_CANDIDATES: TABLE_CANDIDATES.slice(),
    getSupabaseClient: getSupabaseClient,
    fetchRemoteAssets: fetchRemoteAssets,
    upsertAssets: upsertAssets,
    applyEdits: applyEdits,
    buildQuestionChoices: buildQuestionChoices
  };
})(window);
