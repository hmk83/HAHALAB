(function () {
  'use strict';
  if (window.PlaylabReportPdf) return;
  const ownScript = document.currentScript;
  const baseUrl = new URL('.', ownScript && ownScript.src || new URL('playlab/', document.baseURI));
  const PAGE = { width: 595.28, height: 841.89, margins: [40, 52, 40, 48] };
  const CONTENT_WIDTH = PAGE.width - 80;
  const GRAPH_HEIGHT = 650;
  const SKIP = 'script,style,noscript,template,button,input,select,textarea,[data-pdf-exclude],.playlab-report-mode-panel,.detail-report-mode-panel,.detail-playlab-log-btn,.detail-hevi-log-muted,.material-symbols-outlined,.material-icons';
  const PARAGRAPH = /^(P|H[1-6]|DT|DD|LI|PRE|FIGCAPTION|SUMMARY|BLOCKQUOTE)$/;
  let libraryPromise;

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      const timer = window.setTimeout(function () { script.remove(); reject(new Error('PDF 출력 파일 준비 시간이 초과되었습니다. 다시 시도해 주세요.')); }, 20000);
      script.src = url;
      script.onload = function () { window.clearTimeout(timer); resolve(); };
      script.onerror = function () { window.clearTimeout(timer); script.remove(); reject(new Error('PDF 출력 파일을 불러오지 못했습니다. 다시 시도해 주세요.')); };
      document.head.appendChild(script);
    });
  }

  async function ensureLibrary() {
    if (!libraryPromise) libraryPromise = (async function () {
      if (!window.pdfMake) await loadScript(new URL('vendor/pdfmake-0.3.13.min.js', baseUrl).href);
      await loadScript(new URL('vendor/report-noto-sans-kr.js', baseUrl).href);
      if (!window.pdfMake || !window.__hahalabReportFont) throw new Error('PDF 글꼴을 준비하지 못했습니다.');
      window.pdfMake.addVirtualFileSystem({ 'NotoSansKR.ttf': window.__hahalabReportFont });
      window.pdfMake.addFonts({ NotoSansKR: { normal: 'NotoSansKR.ttf', bold: 'NotoSansKR.ttf', italics: 'NotoSansKR.ttf', bolditalics: 'NotoSansKR.ttf' } });
      return window.pdfMake;
    })().catch(function (error) { libraryPromise = null; throw error; });
    return libraryPromise;
  }

  function modeFor(root, options) {
    const shell = root.matches('[data-report-mode]') ? root : root.closest('[data-report-mode]') || root.querySelector('[data-report-mode]');
    if (shell && shell.getAttribute('data-shared-audience') === 'guardian') return 'guardian';
    const explicit = options.reportMode || options.mode || shell && shell.getAttribute('data-report-mode');
    if (explicit) return /guardian|parent|family/i.test(explicit) ? 'guardian' : 'teacher';
    return root.closest('.detail-report-mode-guardian') ? 'guardian' : 'teacher';
  }

  function omitted(node, mode) {
    if (node.nodeType !== 1) return false;
    if (node.matches(SKIP) || node.hidden || node.getAttribute('aria-hidden') === 'true') return true;
    if (node.classList.contains('playlab-report-mode-content-guardian') && mode !== 'guardian') return true;
    if (node.classList.contains('playlab-report-mode-content-teacher') && mode !== 'teacher') return true;
    if (node.matches('[data-report-audience]') && node.getAttribute('data-report-audience') !== mode) return true;
    const style = getComputedStyle(node);
    return style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse';
  }

  function richText(node, mode, format) {
    if (node.nodeType === 3) {
      const value = node.textContent.replace(/\s+/g, ' ');
      return value ? [{ text: value, ...(format || {}) }] : [];
    }
    if (node.nodeType !== 1 || omitted(node, mode)) return [];
    if (node.tagName === 'BR') return [{ text: '\n' }];
    if (node.matches('svg,canvas,img,table')) return [];
    const next = Object.assign({}, format || {});
    if (node.matches('strong,b')) next.bold = true;
    if (node.matches('em,i')) next.italics = true;
    if (node.matches('u')) next.decoration = 'underline';
    return Array.from(node.childNodes).flatMap(function (child) { return richText(child, mode, next); });
  }

  function hasText(runs) { return runs.some(function (run) { return /\S/.test(run.text); }); }
  function paragraph(node, mode) {
    const runs = richText(node, mode);
    if (!hasText(runs)) return null;
    const level = /^H[1-6]$/.test(node.tagName) ? Number(node.tagName[1]) : 0;
    const out = { text: runs, margin: [node.tagName === 'DD' || node.tagName === 'LI' ? 10 : 0, level ? 12 : 2, 0, level ? 6 : 7] };
    if (level) { out.headlineLevel = level; out.fontSize = level <= 2 ? 17 : 13; out.color = '#0f4f9b'; out.bold = true; }
    if (node.tagName === 'LI') out.text = [{ text: '• ' }].concat(out.text);
    return out;
  }

  function svgNode(svg) {
    const clone = svg.cloneNode(true);
    const originals = [svg].concat(Array.from(svg.querySelectorAll('*')));
    const copies = [clone].concat(Array.from(clone.querySelectorAll('*')));
    const properties = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'font-size', 'font-weight', 'text-anchor', 'opacity', 'dominant-baseline'];
    originals.forEach(function (source, index) {
      const target = copies[index];
      if (!target) return;
      const style = getComputedStyle(source);
      properties.forEach(function (property) { const value = style.getPropertyValue(property); if (value) target.setAttribute(property, value); });
      if (target.tagName.toLowerCase() === 'text' || target.tagName.toLowerCase() === 'tspan') target.setAttribute('font-family', 'NotoSansKR');
      Array.from(target.attributes).forEach(function (attribute) { if (/^on/i.test(attribute.name)) target.removeAttribute(attribute.name); });
    });
    clone.querySelectorAll('script,foreignObject,iframe').forEach(function (node) { node.remove(); });
    clone.querySelectorAll('image,use').forEach(function (node) {
      const href = node.getAttribute('href') || node.getAttribute('xlink:href') || '';
      if (href && !href.startsWith('#') && !href.startsWith('data:')) throw new Error('외부 참조 그래프는 PDF에 저장할 수 없습니다. 그래프를 다시 불러와 주세요.');
    });
    const viewBox = svg.viewBox && svg.viewBox.baseVal;
    let bounds = { x: viewBox && viewBox.width ? viewBox.x : 0, y: viewBox && viewBox.height ? viewBox.y : 0, width: viewBox && viewBox.width || Number(svg.getAttribute('width')) || 600, height: viewBox && viewBox.height || Number(svg.getAttribute('height')) || 300 };
    try {
      const box = svg.getBBox();
      const x = Math.min(bounds.x, box.x), y = Math.min(bounds.y, box.y);
      const right = Math.max(bounds.x + bounds.width, box.x + box.width), bottom = Math.max(bounds.y + bounds.height, box.y + box.height);
      bounds = { x: x - 4, y: y - 4, width: right - x + 8, height: bottom - y + 8 };
    } catch (_error) {}
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('viewBox', [bounds.x, bounds.y, bounds.width, bounds.height].join(' '));
    clone.setAttribute('width', String(bounds.width)); clone.setAttribute('height', String(bounds.height));
    const source = new XMLSerializer().serializeToString(clone);
    return { svg: source, fit: [CONTENT_WIDTH, GRAPH_HEIGHT], margin: [0, 8, 0, 12], unbreakable: true, _reportGraph: true };
  }

  async function imageNode(node) {
    let url;
    if (node.tagName === 'CANVAS') url = node.toDataURL('image/png');
    else {
      if (!node.complete) await new Promise(function (resolve, reject) {
        function finish(error) {
          window.clearTimeout(timer); node.removeEventListener('load', loaded); node.removeEventListener('error', failed);
          if (error) reject(error); else resolve();
        }
        function loaded() { finish(); }
        function failed() { finish(new Error('리포트 이미지를 불러오지 못했습니다.')); }
        const timer = window.setTimeout(function () { finish(new Error('리포트 이미지 준비 시간이 초과되었습니다. 다시 시도해 주세요.')); }, 20000);
        node.addEventListener('load', loaded, { once: true }); node.addEventListener('error', failed, { once: true });
      });
      if (!node.naturalWidth) throw new Error('리포트 이미지가 비어 있습니다.');
      const canvas = document.createElement('canvas'); canvas.width = node.naturalWidth; canvas.height = node.naturalHeight;
      canvas.getContext('2d').drawImage(node, 0, 0); url = canvas.toDataURL('image/png');
    }
    return { image: url, fit: [CONTENT_WIDTH, GRAPH_HEIGHT], margin: [0, 8, 0, 12], unbreakable: true, _reportGraph: true };
  }

  async function tableNode(table, mode) {
    const rows = Array.from(table.rows).filter(function (row) { return !omitted(row, mode); });
    if (!rows.length) return null;
    const body = [];
    const occupied = [];
    let columns = 0;
    for (let r = 0; r < rows.length; r++) {
      const row = [];
      let c = 0;
      for (const cell of Array.from(rows[r].cells).filter(function (item) { return !omitted(item, mode); })) {
        while (occupied[r] && occupied[r][c]) { row[c] = {}; c++; }
        const colSpan = Math.max(1, cell.colSpan || 1), rowSpan = Math.max(1, Math.min(cell.rowSpan || 1, rows.length - r));
        const stack = await walk(cell, mode, true);
        row[c] = { stack: stack.length ? stack : [{ text: '' }], margin: [4, 4, 4, 4], ...(colSpan > 1 ? { colSpan } : {}), ...(rowSpan > 1 ? { rowSpan } : {}), ...(cell.tagName === 'TH' ? { bold: true, fillColor: '#edf3fb' } : {}) };
        for (let rr = r; rr < r + rowSpan; rr++) { occupied[rr] = occupied[rr] || []; for (let cc = c; cc < c + colSpan; cc++) if (rr !== r || cc !== c) occupied[rr][cc] = true; }
        for (let cc = c + 1; cc < c + colSpan; cc++) row[cc] = {};
        c += colSpan;
      }
      columns = Math.max(columns, row.length, occupied[r] && occupied[r].length || 0); body.push(row);
    }
    body.forEach(function (row) { for (let c = 0; c < columns; c++) if (!row[c]) row[c] = {}; });
    const headerRows = table.tHead ? Math.min(table.tHead.rows.length, body.length) : rows[0].querySelector('th') ? 1 : 0;
    return { table: { headerRows: headerRows, widths: Array(columns).fill('*'), body: body, dontBreakRows: false }, layout: 'lightHorizontalLines', margin: [0, 6, 0, 12] };
  }

  const DIV_TABLE = '.detail-playlab-log-table,.detail-rehab-session-table,[role="table"]';
  async function divTableNodes(table, mode) {
    if (!table.matches(DIV_TABLE) || table.querySelector('svg,canvas,img,table')) return null;
    const rows = Array.from(table.children).flatMap(function (node) {
      return node.getAttribute('role') === 'rowgroup' ? Array.from(node.children) : [node];
    }).filter(function (node) { return !omitted(node, mode); });
    if (!rows.length) return null;
    const cells = rows.map(function (row) { return Array.from(row.children).filter(function (cell) { return !omitted(cell, mode); }); });
    if (cells.some(function (row) { return row.length < 2; })) return null;
    const columns = Math.max.apply(null, cells.map(function (row) { return row.length; }));
    const grid = getComputedStyle(rows[0]).gridTemplateColumns.split(/\s+/).map(parseFloat);
    const weights = grid.length === columns && grid.every(function (value) { return Number.isFinite(value) && value > 0; }) ? grid : Array(columns).fill(1);
    const totalWeight = weights.reduce(function (sum, value) { return sum + value; }, 0);
    const availableWidth = CONTENT_WIDTH - columns * 6;
    const minimumWidth = Math.min(40, availableWidth / columns);
    const weightedWidth = availableWidth - minimumWidth * columns;
    const widths = weights.map(function (value) { return minimumWidth + weightedWidth * value / totalWeight; });
    const header = rows[0].classList.contains('is-head') || cells[0].some(function (cell) { return cell.getAttribute('role') === 'columnheader'; });
    const converted = [];
    const breakable = [];
    for (let r = 0; r < rows.length; r++) {
      const row = [];
      let estimatedHeight = 0;
      for (let c = 0; c < columns; c++) {
        const cell = cells[r][c];
        const stack = cell ? await walk(cell, mode, true) : [];
        row.push({ stack: stack.length ? stack : [{ text: '' }], margin: [1, 2, 1, 2], ...(header && r === 0 ? { bold: true, fillColor: '#edf3fb' } : {}) });
        if (cell) {
          // Conservative upper bound for normal report rows. Long notes must
          // remain flowable rather than becoming oversized unbreakable blocks.
          const blocks = Array.from(cell.querySelectorAll('*')).filter(function (node) { return node.tagName === 'BR' || /^(block|list-item)$/.test(getComputedStyle(node).display); }).length;
          const lines = Math.ceil(cell.textContent.trim().length * 11 / Math.max(20, widths[c] - 4));
          estimatedHeight = Math.max(estimatedHeight, lines * 16 + blocks * 10 + 12);
        }
      }
      converted.push(row); breakable.push(estimatedHeight > 500);
    }
    const output = [];
    let group = [];
    let groupBreakable = false;
    function flush() {
      if (!group.length) return;
      const body = header ? [converted[0]].concat(group) : group;
      output.push({ table: { headerRows: header ? 1 : 0, widths: widths.slice(), body: body, dontBreakRows: !groupBreakable }, fontSize: 9, layout: {
        hLineWidth: function (index, node) { return index === 0 || index === node.table.body.length ? 0.7 : 0.35; },
        vLineWidth: function () { return 0; }, hLineColor: function () { return '#d5ddea'; },
        paddingLeft: function () { return 3; }, paddingRight: function () { return 3; }, paddingTop: function () { return 3; }, paddingBottom: function () { return 3; }
      }, margin: [0, 6, 0, 12] });
      group = [];
    }
    for (let r = header ? 1 : 0; r < converted.length; r++) {
      if (group.length && groupBreakable !== breakable[r]) flush();
      groupBreakable = breakable[r]; group.push(converted[r]);
    }
    flush();
    if (!output.length && header) return [{ table: { headerRows: 1, widths: widths, body: [converted[0]], dontBreakRows: true }, layout: 'lightHorizontalLines' }];
    return output;
  }

  async function walk(node, mode, descendOnly) {
    if (!node || node.nodeType !== 1 || omitted(node, mode)) return [];
    if (!descendOnly) {
      if (node.tagName.toLowerCase() === 'svg') return [svgNode(node)];
      if (node.matches('canvas,img')) return [await imageNode(node)];
      if (node.tagName === 'TABLE') { const table = await tableNode(node, mode); return table ? [table] : []; }
      if (node.matches(DIV_TABLE)) { const tables = await divTableNodes(node, mode); if (tables) return tables; }
      if (PARAGRAPH.test(node.tagName) && !node.querySelector('svg,canvas,img,table')) { const item = paragraph(node, mode); return item ? [item] : []; }
    }
    const output = [];
    let inline = [];
    function flush() { if (hasText(inline)) output.push({ text: inline, margin: [0, 2, 0, 7] }); inline = []; }
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) { inline = inline.concat(richText(child, mode)); continue; }
      if (child.nodeType !== 1 || omitted(child, mode)) continue;
      const display = getComputedStyle(child).display;
      const semantic = PARAGRAPH.test(child.tagName) || child.matches('svg,canvas,img,table,ul,ol,dl,details') || child.matches(DIV_TABLE);
      if (!semantic && /^(inline|inline-block|contents)$/.test(display) && !child.querySelector('svg,canvas,img,table,p,h1,h2,h3,h4,li')) { inline = inline.concat(richText(child, mode)); continue; }
      flush(); output.push.apply(output, await walk(child, mode, false));
    }
    flush(); return output;
  }

  async function buildDefinition(root, options) {
    const config = options || {};
    if (!root || root.nodeType !== 1 || !root.isConnected) throw new Error('저장할 리포트를 찾지 못했습니다.');
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const mode = modeFor(root, config);
    const content = await walk(root, mode, false);
    if (!content.length) throw new Error('현재 모드에 저장할 리포트 내용이 없습니다.');
    const title = String(config.title || document.title || 'HAHA LAB 리포트').trim();
    return {
      pageSize: 'A4', pageMargins: PAGE.margins.slice(),
      info: { title: title, creator: 'HAHA LAB', subject: mode === 'guardian' ? '보호자용 리포트' : '전문가용 리포트' },
      defaultStyle: { font: 'NotoSansKR', fontSize: 10, lineHeight: 1.35, color: '#172333' },
      content: [{ text: title, fontSize: 19, color: '#0f4f9b', margin: [0, 0, 0, 6] }, { text: mode === 'guardian' ? '보호자용 리포트' : '전문가용 리포트', fontSize: 9, color: '#526277', margin: [0, 0, 0, 16] }].concat(content),
      footer: function (page, pages) { return { text: 'HAHA LAB  ·  ' + page + ' / ' + pages, alignment: 'center', fontSize: 8, color: '#526277', margin: [40, 15, 40, 0] }; },
      pageBreakBefore: function (node, container) {
        return Boolean(node.headlineLevel && container && container.getFollowingNodesOnPage && !container.getFollowingNodesOnPage().length);
      }
    };
  }

  async function createBuffer(root, options) {
    const pdfMake = await ensureLibrary();
    const definition = await buildDefinition(root, options);
    const bytes = await pdfMake.createPdf(definition).getBuffer();
    return new Uint8Array(bytes);
  }

  async function download(root, options) {
    const config = options || {};
    const sourceText = root && root.textContent;
    const modeShell = root && (root.closest('[data-report-mode]') || root.querySelector('[data-report-mode]'));
    const sourceMode = modeShell && modeShell.getAttribute('data-report-mode');
    if (config.validateBeforeDownload && await config.validateBeforeDownload() === false) throw new Error('리포트 접근 상태가 변경되었습니다. 다시 열어 주세요.');
    const bytes = await createBuffer(root, config);
    if (!root.isConnected || root.textContent !== sourceText || root.getBoundingClientRect().width <= 0 || modeShell && modeShell.getAttribute('data-report-mode') !== sourceMode) throw new Error('리포트가 변경되었거나 닫혔습니다. 다시 열어 주세요.');
    if (config.validateBeforeDownload && await config.validateBeforeDownload() === false) throw new Error('리포트 접근 상태가 변경되었습니다. 다시 열어 주세요.');
    const name = String(config.title || document.title || 'HAHA LAB 리포트').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim() || 'HAHA LAB 리포트';
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    const link = document.createElement('a'); link.href = url; link.download = name + '.pdf'; document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
    return { bytes: bytes.length, fileName: name + '.pdf' };
  }

  window.PlaylabReportPdf = { buildDefinition: buildDefinition, createBuffer: createBuffer, download: download, version: '20261104-2' };
})();
