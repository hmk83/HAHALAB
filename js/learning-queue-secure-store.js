(function () {
  'use strict';
  if (window.HahaLabSecureQueueStore) return;
  const PREFIX = 'hahalab_secure_learning_queue_v1::';
  const ALGORITHM = 'xchacha20poly1305';
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let active = null;
  let epoch = 0;
  let preload = null;
  let codecPromise = null;
  const clone = value => JSON.parse(JSON.stringify(value));
  const ownerKey = owner => owner?.authUserId && owner?.teacherId ? JSON.stringify([String(owner.authUserId), String(owner.teacherId)]) : '';
  const sessionKey = owner => JSON.stringify([ownerKey(owner), String(owner?.sessionId || '')]);
  const bytesToHex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  function fromHex(value) {
    if (typeof value !== 'string' || !/^(?:[a-f0-9]{2})+$/i.test(value)) throw new Error('QUEUE_CIPHER_ENCODING_INVALID');
    return Uint8Array.from(value.match(/../g), byte => parseInt(byte, 16));
  }
  function toBase64(bytes) {
    // Bounded chunks avoid argument-limit failures for long report sources.
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  }
  function fromBase64(value) {
    if (typeof value !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(value) || !value.length || value.length % 4 !== 0) throw new Error('QUEUE_CIPHER_ENCODING_INVALID');
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    if (toBase64(bytes) !== value) throw new Error('QUEUE_CIPHER_ENCODING_INVALID');
    return bytes;
  }
  function clear() {
    epoch += 1;
    active?.key.fill(0);
    active = null;
    preload = null;
  }
  function ready(owner) {
    if (active) {
      let live;
      try { live = active.getOwner(); } catch (_error) { live = null; }
      if (sessionKey(live) !== active.sessionKey) clear();
    }
    return Boolean(active && ownerKey(owner) === active.ownerKey && sessionKey(owner) === active.sessionKey && window.HahaLabQueueCipher);
  }
  function loadCodec() {
    if (window.HahaLabQueueCipher) return Promise.resolve();
    if (!codecPromise) codecPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/js/vendor/noble-ciphers-2.4.0.js';
      script.integrity = 'sha384-9NoAGAFhzRoVTKyDGPqS4n4kHtVA8Hk+kew4bumhxBztH7uV/tJKUxK0An4BFWzv';
      script.onload = () => window.HahaLabQueueCipher ? resolve() : reject(new Error('QUEUE_CODEC_UNAVAILABLE'));
      script.onerror = () => reject(new Error('QUEUE_CODEC_UNAVAILABLE'));
      document.head.appendChild(script);
    }).catch(error => { codecPromise = null; throw error; });
    return codecPromise;
  }
  async function ensure(client, owner, getOwner) {
    if (!ownerKey(owner) || !String(owner.sessionId || '').trim() || typeof getOwner !== 'function') return false;
    if ((active && active.sessionKey !== sessionKey(owner)) || (preload && preload.stamp !== sessionKey(owner))) clear();
    if (ready(owner) && sessionKey(getOwner()) === sessionKey(owner)) return true;
    const stamp = sessionKey(owner);
    if (preload?.stamp === stamp) return preload.promise;
    const ticket = epoch;
    const promise = (async () => {
      try {
        await loadCodec();
        if (ticket !== epoch || stamp !== sessionKey(getOwner())) return false;
        const result = await client.rpc('get_my_learning_queue_key');
        const response = result?.data;
        if (result?.error || !response || response.version !== 1 || response.algorithm !== ALGORITHM
          || String(response.auth_user_id) !== String(owner.authUserId) || String(response.teacher_id) !== String(owner.teacherId)
          || !/^[a-f0-9]{64}$/.test(response.key_hex || '') || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(response.key_id || '')
          || ticket !== epoch || stamp !== sessionKey(getOwner())) return false;
        const key = fromHex(response.key_hex);
        // The RPC response and key never enter persistent storage or diagnostics.
        active?.key.fill(0);
        active = { key, kid: response.key_id, ownerKey: ownerKey(owner), uid: String(owner.authUserId), teacher: String(owner.teacherId), sessionKey: stamp, getOwner };
        window.dispatchEvent(new Event('hahalab-queue-key-ready'));
        return true;
      } catch (_error) { return false; }
      finally { if (preload?.promise === promise) preload = null; }
    })();
    preload = { stamp, promise };
    return promise;
  }
  function aad(namespace, envelope, storageKey) {
    return encoder.encode(JSON.stringify([namespace, envelope.v, envelope.alg, envelope.encoding, envelope.kid, active.uid, active.teacher, storageKey]));
  }
  function unpack(namespace, raw, owner, storageKey) {
    if (!ready(owner)) throw new Error('QUEUE_KEY_UNAVAILABLE');
    const envelope = JSON.parse(raw);
    if (envelope.v !== 1 || envelope.alg !== ALGORITHM || envelope.encoding !== 'base64' || envelope.kid !== active.kid) throw new Error('QUEUE_ENVELOPE_INVALID');
    const nonce = fromHex(envelope.nonce);
    if (nonce.length !== 24) throw new Error('QUEUE_NONCE_INVALID');
    const plain = window.HahaLabQueueCipher.xchacha20poly1305(active.key, nonce, aad(namespace, envelope, storageKey)).decrypt(fromBase64(envelope.ciphertext));
    try { return JSON.parse(decoder.decode(plain)); }
    finally { plain.fill(0); }
  }
  function list(namespace, owner) {
    if (!ready(owner)) return [];
    const result = [];
    let keys;
    try { keys = Object.keys(window.localStorage); } catch (_error) { return []; }
    for (const key of keys) {
      if (!key.startsWith(PREFIX)) continue;
      const raw = window.localStorage.getItem(key);
      try { result.push({ value: unpack(namespace, raw, owner, key), storageKey: key, raw }); }
      catch (_error) { /* Foreign, another namespace or corrupt data stays untouched and hidden. */ }
    }
    return result;
  }
  function put(namespace, value, owner, identity) {
    if (!ready(owner)) throw new Error('QUEUE_KEY_UNAVAILABLE');
    const canonical = JSON.stringify(value);
    const existing = list(namespace, owner).find(item => identity(item.value) === identity(value));
    if (existing) {
      if (JSON.stringify(existing.value) !== canonical) throw new Error('QUEUE_EXISTING_PAYLOAD_MISMATCH');
      return existing;
    }
    const key = PREFIX + crypto.randomUUID();
    const nonce = crypto.getRandomValues(new Uint8Array(24));
    const envelope = { v: 1, alg: ALGORITHM, encoding: 'base64', kid: active.kid, nonce: bytesToHex(nonce) };
    const plain = encoder.encode(canonical);
    try { envelope.ciphertext = toBase64(window.HahaLabQueueCipher.xchacha20poly1305(active.key, nonce, aad(namespace, envelope, key)).encrypt(plain)); }
    finally { plain.fill(0); }
    const raw = JSON.stringify(envelope);
    window.localStorage.setItem(key, raw);
    if (window.localStorage.getItem(key) !== raw || JSON.stringify(unpack(namespace, raw, owner, key)) !== canonical) throw new Error('QUEUE_DURABILITY_UNCONFIRMED');
    return { value: clone(value), storageKey: key, raw };
  }
  function removeExact(namespace, snapshot, owner) {
    if (!ready(owner) || !snapshot?.storageKey?.startsWith(PREFIX)) return false;
    const current = window.localStorage.getItem(snapshot.storageKey);
    if (current !== snapshot.raw) return false;
    try { if (JSON.stringify(unpack(namespace, current, owner, snapshot.storageKey)) !== JSON.stringify(snapshot.value)) return false; }
    catch (_error) { return false; }
    window.localStorage.removeItem(snapshot.storageKey);
    return window.localStorage.getItem(snapshot.storageKey) === null;
  }
  // Migrate only verified-owned entries, preserving byte-for-byte legacy values
  // if the source changed, encryption failed, or another account owns the data.
  function migrateArray(namespace, legacyKey, owner, accepts, identity) {
    if (!ready(owner)) return;
    let raw;
    try { raw = window.localStorage.getItem(legacyKey); } catch (_error) { return; }
    if (!raw) return;
    let values;
    try { values = JSON.parse(raw); } catch (_error) { return; }
    if (!Array.isArray(values)) return;
    const moved = new Set();
    for (let index = 0; index < values.length; index += 1) {
      if (!accepts(values[index])) continue;
      try { put(namespace, values[index], owner, identity); moved.add(index); }
      catch (_error) { /* Original survives failed durable encryption. */ }
    }
    try {
      if (!moved.size || window.localStorage.getItem(legacyKey) !== raw) return;
      const remaining = values.filter((_value, index) => !moved.has(index));
      if (remaining.length) window.localStorage.setItem(legacyKey, JSON.stringify(remaining));
      else window.localStorage.removeItem(legacyKey);
    } catch (_error) { /* Encrypted copy exists; retain legacy until exact cleanup can retry. */ }
  }
  window.HahaLabSecureQueueStore = Object.freeze({ ensure, ready, clear, list, put, removeExact, migrateArray, prefix: PREFIX });
  window.addEventListener('hahalab-session-cleared', clear);
})();
