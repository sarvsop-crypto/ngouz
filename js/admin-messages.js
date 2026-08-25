/* Canonical direct-chat client with polling, files, replies and receipts. */
(function () {
  'use strict';

  var state = {
    threads: [], users: [], current: null, messages: [], messageIds: new Set(),
    before: null, eventCursor: null, selection: 0, pollTimer: null,
    backoff: 1000, reply: null, uploads: [], typingTimer: null, lastTyping: false
  };

  function el(id) { return document.getElementById(id); }
  function arr(value) { return Array.isArray(value) ? value : []; }
  function esc(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function when(value) {
    if (!value) return '';
    var date = new Date(value);
    return isNaN(date) ? String(value) : date.toLocaleString();
  }
  function toast(message, type) {
    var node = el('cmsToast');
    if (!node) return;
    node.textContent = message;
    node.className = 'cms-toast cms-toast--' + (type || 'info') + ' show';
    setTimeout(function () { node.classList.remove('show'); }, 4000);
  }
  function openModal(id, opener) { if (window.AdminModal) AdminModal.open(id, opener); }
  function closeModal(id) { if (window.AdminModal) AdminModal.close(id); }
  function uuid() {
    var source = window.crypto || window.msCrypto;
    if (source && source.randomUUID) return source.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
      var random = source && source.getRandomValues
        ? source.getRandomValues(new Uint8Array(1))[0] & 15 : Math.floor(Math.random() * 16);
      return (char === 'x' ? random : (random & 3 | 8)).toString(16);
    });
  }

  function setConnection(status, text) {
    el('connectionState').dataset.state = status;
    el('connectionState').textContent = text;
  }
  function peer(thread) {
    if (thread.peer_user) return thread.peer_user;
    var me = window.__CURRENT_USER__ || {};
    return arr(thread.participants).find(function (user) { return String(user.id) !== String(me.id); }) || null;
  }
  function threadMeta(thread) {
    if (thread.type === 'direct' && peer(thread)) {
      var person = peer(thread);
      return [person.role, person.region_code].filter(Boolean).join(' · ');
    }
    return arr(thread.participants).map(function (person) { return person.full_name || person.email; }).filter(Boolean).join(', ');
  }
  function threadTypeLabel(thread) {
    if (thread.task_id || thread.type === 'task') return 'Topshiriq';
    if (thread.type === 'direct') return 'Shaxsiy';
    if (thread.type === 'regional_all') return 'Rasmiy guruh';
    return 'Guruh';
  }
  function searchableThread(thread) {
    var people = arr(thread.participants).map(function (person) {
      return [person.full_name, person.email, person.role, person.region_code].join(' ');
    }).join(' ');
    return [thread.title, thread.last_body, threadTypeLabel(thread), people].join(' ').toLocaleLowerCase();
  }

  function renderThreads() {
    var query = el('threadSearch').value.trim().toLocaleLowerCase();
    var items = state.threads.filter(function (thread) { return !query || searchableThread(thread).indexOf(query) !== -1; });
    el('threadCount').textContent = items.length;
    el('threadList').innerHTML = items.map(function (thread) {
      var active = state.current && String(state.current.id) === String(thread.id);
      return '<button class="thread-item" type="button" role="option" data-thread="' + esc(thread.id)
        + '" aria-selected="' + (active ? 'true' : 'false') + '"><span class="thread-row"><span class="thread-title">'
        + esc(thread.title || 'Suhbat') + '</span><span class="badge badge--info">' + esc(threadTypeLabel(thread)) + '</span>'
        + (Number(thread.unread_count) > 0 ? '<span class="unread-badge">' + esc(thread.unread_count) + '</span>' : '')
        + '</span><span class="thread-row"><span class="thread-preview">' + esc(thread.last_body || threadMeta(thread))
        + '</span><small>' + esc(when(thread.last_created_at)) + '</small></span></button>';
    }).join('') || '<p class="empty-note">Suhbat topilmadi.</p>';
    var unread = state.threads.reduce(function (sum, thread) { return sum + Number(thread.unread_count || 0); }, 0);
    if (window.NgoAdminNavigation) NgoAdminNavigation.setBadge('messages', unread);
    el('threadList').setAttribute('aria-busy', 'false');
    if (state.users.length) renderPeople();
  }

  function existingDirect(userId) {
    return state.threads.find(function (thread) {
      var person = thread.type === 'direct' ? peer(thread) : null;
      return person && String(person.id) === String(userId);
    }) || null;
  }
  function roleLabel(role) {
    return { super_admin: 'Bosh admin', regional_admin: 'Hududiy admin' }[role] || role || '';
  }
  function personSearchText(user) {
    return [user.full_name, user.email, roleLabel(user.role), user.region_code].join(' ').toLocaleLowerCase();
  }
  function renderPeople() {
    var query = el('peopleSearch').value.trim().toLocaleLowerCase();
    var users = state.users.filter(function (user) { return !query || personSearchText(user).indexOf(query) !== -1; });
    el('peopleList').innerHTML = users.map(function (user) {
      var chat = existingDirect(user.id);
      return '<button class="collab-person" type="button" role="option" data-person="' + esc(user.id) + '">'
        + '<span><strong>' + esc(user.full_name || user.email) + '</strong><small>'
        + esc([roleLabel(user.role), user.region_code].filter(Boolean).join(' · ')) + '</small></span>'
        + (chat ? '<span class="badge badge--success">Mavjud suhbat</span>' : '<span class="badge badge--info">Suhbatni ochish</span>')
        + '</button>';
    }).join('') || '<p class="empty-note">Mos admin topilmadi.</p>';
    el('peopleList').setAttribute('aria-busy', 'false');
  }
  function renderGroupParticipants() {
    el('groupParticipants').innerHTML = state.users.map(function (user) {
      return '<label><input type="checkbox" value="' + esc(user.id) + '"> '
        + esc((user.full_name || user.email) + ' · ' + roleLabel(user.role) + (user.region_code ? ' · ' + user.region_code : '')) + '</label>';
    }).join('');
  }

  function fileKind(name) {
    var extension = String(name || '').toLocaleLowerCase().split('.').pop();
    if (extension === 'pdf') return 'pdf';
    if (/^(doc|docx|odt|rtf)$/.test(extension)) return 'document';
    if (/^(xls|xlsx|csv|ods)$/.test(extension)) return 'spreadsheet';
    if (/^(png|jpe?g|webp|gif)$/.test(extension)) return 'image';
    if (/^(mp4|webm|mov)$/.test(extension)) return 'video';
    if (/^(ogg|mp3|wav|m4a)$/.test(extension)) return 'audio';
    return 'file';
  }
  function fileIcon(kind) {
    return { pdf: 'file-pdf', document: 'file-doc', spreadsheet: 'file-xls', image: 'image-square',
      video: 'video-camera', audio: 'speaker-high', file: 'file' }[kind];
  }
  function attachmentHtml(attachment) {
    var name = attachment.original_name || 'Fayl';
    var kind = fileKind(name);
    return '<div class="attachment attachment--' + kind + '"><span class="attachment__icon" aria-hidden="true"><i class="ph ph-'
      + fileIcon(kind) + '"></i></span><button class="attachment__download" type="button" data-download="'
      + esc(attachment.attachment_id) + '" data-name="' + esc(name) + '" aria-label="' + esc(name)
      + ' faylini yuklab olish"><span class="attachment__name">' + esc(name)
      + '</span><i class="ph ph-download-simple" aria-hidden="true"></i></button><small>'
      + esc(attachment.size_bytes || '') + '</small></div>';
  }
  function readState(message) {
    var readers = arr(message.read_by);
    if (!message.mine || !readers.length) return '';
    var names = readers.map(function (reader) { return reader.full_name || reader.email; }).filter(Boolean);
    return ' · ' + esc(names.join(', ') || readers.length + ' kishi') + ' o‘qidi';
  }
  function messageHtml(message) {
    var allowed = arr(message.allowed_actions);
    var reply = message.reply_to_message_id ? state.messages.find(function (candidate) {
      return String(candidate.id) === String(message.reply_to_message_id);
    }) : null;
    var history = message.edited_at || message.deleted_at
      ? '<button class="message-action" type="button" data-history="' + esc(message.id) + '">Tarix</button>' : '';
    return '<article class="message' + (message.mine ? ' message--mine' : '') + '" data-message="' + esc(message.id) + '">'
      + '<div class="message-meta">' + esc(message.sender_name || message.sender_email || 'Admin') + ' · '
      + esc(when(message.created_at)) + (message.edited_at ? ' · tahrirlangan' : '') + '</div>'
      + (reply ? '<div class="message-quote">' + esc(reply.sender_name || '') + ': ' + esc(reply.body || '') + '</div>' : '')
      + '<div class="message-body">' + esc(message.deleted_at ? 'Xabar o‘chirilgan' : message.body) + '</div>'
      + arr(message.attachments).map(attachmentHtml).join('') + '<div class="message-state">'
      + esc(message.delivery_state || '') + readState(message) + '</div><div class="message-actions">'
      + (message.failed ? '<button class="message-action" type="button" data-retry="' + esc(message.id) + '">Qayta yuborish</button>' : '')
      + (!message.deleted_at && !message.failed ? '<button class="message-action" type="button" data-reply="' + esc(message.id) + '">Javob</button>' : '')
      + (!message.failed && allowed.indexOf('edit') >= 0 ? '<button class="message-action" type="button" data-edit="' + esc(message.id) + '">Tahrirlash</button>' : '')
      + (!message.failed && allowed.indexOf('delete') >= 0 ? '<button class="message-action" type="button" data-delete="' + esc(message.id) + '">O‘chirish</button>' : '')
      + history + '</div></article>';
  }
  function renderMessages(prepend) {
    var log = el('messageLog');
    var oldHeight = log.scrollHeight;
    var oldTop = log.scrollTop;
    log.innerHTML = state.messages.map(messageHtml).join('') || '<p class="text-dim">Hali xabar yo‘q.</p>';
    log.scrollTop = prepend ? log.scrollHeight - oldHeight + oldTop : log.scrollHeight;
    el('loadOlder').hidden = !state.before;
  }
  function mergeMessages(items, prepend) {
    var fresh = arr(items).filter(function (message) {
      if (state.messageIds.has(String(message.id))) return false;
      state.messageIds.add(String(message.id));
      return true;
    });
    state.messages = prepend ? fresh.concat(state.messages) : state.messages.concat(fresh);
    state.messages.sort(function (left, right) {
      var byTime = new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
      return byTime || Number(left.id) - Number(right.id);
    });
    renderMessages(prepend);
  }

  function loadThreads(keepSelection) {
    el('threadList').setAttribute('aria-busy', 'true');
    return NgoApi.get('/admin/messages/threads?limit=100').then(function (response) {
      state.threads = arr(response.items);
      if (state.current) state.current = state.threads.find(function (thread) { return String(thread.id) === String(state.current.id); }) || state.current;
      renderThreads();
      if (!keepSelection && !state.current) {
        var requested = new URLSearchParams(location.search).get('thread_id');
        var next = requested || (state.threads[0] && state.threads[0].id);
        if (next) return selectThread(next);
      }
    }).catch(function (error) {
      el('threadList').innerHTML = '<p role="alert">Suhbatlarni yuklab bo‘lmadi. <button type="button" data-reload-threads>Qayta urinish</button><br>' + esc(error.message) + '</p>';
      el('threadList').setAttribute('aria-busy', 'false');
      throw error;
    });
  }
  function markRead() {
    if (!state.current || !state.messages.length) return;
    var last = state.messages[state.messages.length - 1];
    NgoApi.post('/admin/messages/threads/' + encodeURIComponent(state.current.id) + '/read', { message_id: last.id })
      .then(function () { state.current.unread_count = 0; renderThreads(); }).catch(function () {});
  }
  function selectThread(id) {
    var token = ++state.selection;
    state.current = state.threads.find(function (thread) { return String(thread.id) === String(id); }) || { id: id, title: 'Suhbat' };
    state.messages = [];
    state.messageIds.clear();
    state.before = null;
    state.reply = null;
    renderReply();
    renderThreads();
    el('messagesLayout').dataset.mobileView = 'chat';
    el('chatTitle').textContent = state.current.title || 'Suhbat';
    el('chatType').textContent = threadTypeLabel(state.current) + (state.current.task_id ? ' #' + state.current.task_id : '');
    el('chatPresence').textContent = threadMeta(state.current);
    el('messageBody').disabled = false;
    el('attachmentInput').disabled = false;
    el('sendMessage').disabled = false;
    el('messageLog').setAttribute('aria-busy', 'true');
    history.replaceState(null, '', location.pathname + '?thread_id=' + encodeURIComponent(id));
    return NgoApi.get('/admin/messages/threads/' + encodeURIComponent(id) + '?limit=50').then(function (response) {
      if (token !== state.selection) return;
      state.before = response.next_before_id || null;
      mergeMessages(response.items, false);
      el('messageLog').setAttribute('aria-busy', 'false');
      markRead();
      sendPresence(false, true);
    }).catch(function (error) {
      if (token !== state.selection) return;
      el('messageLog').innerHTML = '<p role="alert">' + esc(error.message) + '</p>';
      el('messageLog').setAttribute('aria-busy', 'false');
    });
  }
  function openPerson(userId, opener) {
    var existing = existingDirect(userId);
    el('peopleError').textContent = '';
    el('peopleList').setAttribute('aria-busy', 'true');
    var request = existing ? Promise.resolve({ item: existing, created: false })
      : NgoApi.post('/admin/messages/threads', { type: 'direct', recipient_user_id: Number(userId) });
    return request.then(function (response) {
      var item = response.item || response;
      closeModal('peoplePicker');
      return loadThreads(true).then(function () {
        var canonical = state.threads.find(function (thread) { return String(thread.id) === String(item.id); });
        if (!canonical) throw new Error('Suhbat ro‘yxatda topilmadi');
        return selectThread(canonical.id);
      });
    }).catch(function (error) {
      el('peopleError').textContent = error.status === 403 ? 'Bu admin bilan suhbat ochish uchun ruxsat yo‘q.' : error.message;
      el('peopleList').setAttribute('aria-busy', 'false');
      if (opener) opener.focus();
    });
  }
  function loadOlder() {
    if (!state.current || !state.before) return;
    var token = state.selection;
    NgoApi.get('/admin/messages/threads/' + encodeURIComponent(state.current.id) + '?limit=50&before_id=' + encodeURIComponent(state.before))
      .then(function (response) { if (token === state.selection) { state.before = response.next_before_id || null; mergeMessages(response.items, true); } });
  }
  function renderReply() {
    el('replyBanner').hidden = !state.reply;
    if (state.reply) el('replyBanner').innerHTML = 'Javob: ' + esc(state.reply.body) + ' <button type="button" data-cancel-reply aria-label="Javobni bekor qilish">×</button>';
  }
  function sendPrepared(message) {
    message.failed = false;
    message.delivery_state = 'Yuborilmoqda...';
    renderMessages(false);
    return NgoApi.post('/admin/messages/threads/' + encodeURIComponent(message.threadId), {
      body: message.body, reply_to_message_id: message.replyId,
      client_message_id: message.clientId, attachments: message.paths
    }).then(function (response) {
      state.messageIds.delete(String(message.id));
      state.messages = state.messages.filter(function (candidate) { return candidate !== message; });
      mergeMessages([response.item || response], false);
      state.reply = null;
      renderReply();
    }).catch(function (error) {
      message.delivery_state = 'Xatolik: ' + error.message;
      message.failed = true;
      renderMessages(false);
      throw error;
    });
  }
  function postMessage(body, paths) {
    var message = { id: 'temp-' + Date.now(), body: body, mine: true, created_at: new Date().toISOString(),
      delivery_state: 'Yuborilmoqda...', allowed_actions: [], threadId: state.current.id,
      replyId: state.reply && state.reply.id, clientId: uuid(), paths: paths || [] };
    state.messageIds.add(String(message.id));
    state.messages.push(message);
    return sendPrepared(message);
  }
  function uploadFiles(files) {
    state.uploads = [];
    el('uploadList').hidden = false;
    return Promise.all(Array.from(files).map(function (file) {
      var row = { file: file, progress: 0 };
      state.uploads.push(row);
      renderUploads();
      var form = new FormData();
      form.append('file', file);
      return NgoApi.upload('/admin/collaboration/upload', form, function (progress) { row.progress = progress; renderUploads(); })
        .then(function (response) { row.item = response; row.progress = 100; renderUploads(); return response.path; });
    }));
  }
  function renderUploads() {
    el('uploadList').innerHTML = state.uploads.map(function (upload) {
      var kind = fileKind(upload.file.name);
      return '<div class="upload-item upload-item--' + kind + '"><span class="attachment__icon" aria-hidden="true"><i class="ph ph-'
        + fileIcon(kind) + '"></i></span><span class="upload-item__name">' + esc(upload.file.name)
        + '</span><progress max="100" value="' + upload.progress + '"></progress><span>' + upload.progress + '%</span></div>';
    }).join('');
  }
  function download(id, name) {
    NgoApi.download('/admin/collaboration/attachments/' + encodeURIComponent(id)).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url; link.download = name || 'attachment'; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }).catch(function (error) { toast(error.message, 'error'); });
  }
  function sendPresence(active, force) {
    if (!state.current || (!force && state.lastTyping === active)) return;
    state.lastTyping = active;
    NgoApi.post('/admin/messages/threads/' + encodeURIComponent(state.current.id) + '/presence', { is_typing: active })
      .then(function (response) {
        var online = arr(response.items).map(function (item) { return item.full_name; }).filter(Boolean);
        el('chatPresence').textContent = online.join(', ') || threadMeta(state.current);
      }).catch(function () {});
  }
  function highestMessageId() {
    return state.messages.reduce(function (max, message) { var id = Number(message.id); return isFinite(id) ? Math.max(max, id) : max; }, 0);
  }
  function refreshCurrent(full) {
    if (!state.current) return Promise.resolve();
    var token = state.selection;
    var path = '/admin/messages/threads/' + encodeURIComponent(state.current.id) + '?limit=50';
    if (!full && highestMessageId()) path += '&after_id=' + encodeURIComponent(highestMessageId());
    return NgoApi.get(path).then(function (response) {
      if (token !== state.selection) return;
      if (full) {
        state.messages = state.messages.filter(function (message) { return message.failed; });
        state.messageIds = new Set(state.messages.map(function (message) { return String(message.id); }));
        state.before = response.next_before_id || null;
      }
      mergeMessages(response.items, false);
      markRead();
    });
  }
  function handleEvent(event) {
    if (!event || !event.event_type) return;
    var payload = event.payload || {};
    var same = state.current && String(event.thread_id || payload.thread_id) === String(state.current.id);
    state.eventCursor = event.id || state.eventCursor;
    if (event.event_type === 'message.created' && same) refreshCurrent(false);
    if (['message.updated', 'message.deleted', 'thread.read'].indexOf(event.event_type) >= 0 && same) refreshCurrent(true);
    if (['thread.updated', 'thread.read', 'message.created'].indexOf(event.event_type) >= 0) loadThreads(true).catch(function () {});
    if (event.event_type === 'presence.changed' && same) el('typingStatus').textContent = payload.is_typing ? 'Admin yozmoqda...' : '';
  }
  function schedulePoll(delay) { clearTimeout(state.pollTimer); state.pollTimer = setTimeout(pollEvents, delay); }
  function pollEvents() {
    if (document.hidden || !navigator.onLine) { setConnection('offline', 'Offline — ulanish tiklanganda davom etadi.'); schedulePoll(5000); return; }
    NgoApi.get('/admin/collaboration/events?after_id=' + encodeURIComponent(state.eventCursor || 0) + '&limit=100')
      .then(function (response) {
        arr(response.items).forEach(handleEvent);
        if (response.cursor) state.eventCursor = response.cursor;
        state.backoff = 1000;
        setConnection('online', 'Yangilanish faol');
        schedulePoll(Number(response.retry_after_ms || 4000));
      }).catch(function () {
        setConnection('degraded', 'Ulanish sust; qayta ulanish kutilmoqda.');
        state.backoff = Math.min(state.backoff * 2, 30000);
        loadThreads(true).catch(function () {});
        schedulePoll(state.backoff);
      });
  }

  function wireEvents(user) {
    el('peopleSearch').addEventListener('input', renderPeople);
    el('threadSearch').addEventListener('input', renderThreads);
    el('chatBack').addEventListener('click', function () { el('messagesLayout').dataset.mobileView = 'list'; });
    el('loadOlder').addEventListener('click', loadOlder);
    el('peoplePickerBtn').addEventListener('click', function (event) {
      el('peopleError').textContent = ''; el('peopleSearch').value = ''; renderPeople(); openModal('peoplePicker', event.currentTarget);
      setTimeout(function () { el('peopleSearch').focus(); }, 0);
    });
    if (user.role === 'super_admin') {
      el('groupCreateBtn').hidden = false;
      el('groupCreateBtn').addEventListener('click', function (event) {
        el('groupError').textContent = ''; renderGroupParticipants(); openModal('groupEditor', event.currentTarget);
      });
    }
    el('groupForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var ids = Array.from(el('groupParticipants').querySelectorAll('input:checked')).map(function (input) { return Number(input.value); });
      var title = el('groupTitle').value.trim();
      if (!title || ids.length < 2) { el('groupError').textContent = 'Guruh nomi va kamida ikki ishtirokchi kerak.'; return; }
      NgoApi.post('/admin/messages/threads', { type: 'group', title: title, participant_user_ids: ids }).then(function (response) {
        closeModal('groupEditor'); el('groupForm').reset();
        return loadThreads(true).then(function () { return selectThread((response.item || response).id); });
      }).catch(function (error) { el('groupError').textContent = error.message; });
    });
    el('messageBody').addEventListener('input', function () {
      sendPresence(true); clearTimeout(state.typingTimer); state.typingTimer = setTimeout(function () { sendPresence(false); }, 1500);
    });
    el('messageForm').addEventListener('submit', function (event) {
      event.preventDefault();
      if (!state.current) return;
      var body = el('messageBody').value.trim();
      var files = el('attachmentInput').files;
      if (!body && !files.length) return;
      el('sendMessage').disabled = true;
      (files.length ? uploadFiles(files) : Promise.resolve([])).then(function (paths) { return postMessage(body, paths); })
        .then(function () {
          el('messageBody').value = ''; el('attachmentInput').value = ''; state.uploads = []; el('uploadList').hidden = true; sendPresence(false);
        }).catch(function (error) { toast(error.message || 'Yuborishda xatolik', 'error'); })
        .then(function () { el('sendMessage').disabled = false; });
    });
    document.addEventListener('click', handleClick);
    el('threadList').addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      var options = Array.from(el('threadList').querySelectorAll('[data-thread]'));
      var index = options.indexOf(document.activeElement);
      if (!options.length) return;
      event.preventDefault();
      options[(index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length].focus();
    });
  }

  function handleClick(event) {
    var close = event.target.closest('[data-close-modal]');
    if (close) { closeModal(close.dataset.closeModal); return; }
    var person = event.target.closest('[data-person]');
    if (person) { openPerson(person.dataset.person, person); return; }
    var thread = event.target.closest('[data-thread]');
    if (thread) { selectThread(thread.dataset.thread); return; }
    if (event.target.closest('[data-reload-threads]')) { loadThreads(false).catch(function () {}); return; }
    var retry = event.target.closest('[data-retry]');
    if (retry) { var failed = state.messages.find(function (message) { return String(message.id) === String(retry.dataset.retry); }); if (failed) sendPrepared(failed).catch(function (error) { toast(error.message, 'error'); }); return; }
    var reply = event.target.closest('[data-reply]');
    if (reply) { state.reply = state.messages.find(function (message) { return String(message.id) === String(reply.dataset.reply); }); renderReply(); el('messageBody').focus(); return; }
    if (event.target.closest('[data-cancel-reply]')) { state.reply = null; renderReply(); return; }
    var historyButton = event.target.closest('[data-history]');
    if (historyButton) {
      NgoApi.get('/admin/messages/' + encodeURIComponent(historyButton.dataset.history) + '/revisions').then(function (response) {
        var lines = arr(response.items).map(function (revision) { return when(revision.created_at) + ' — ' + (revision.editor_name || 'Admin') + '\n' + revision.body; });
        window.alert(lines.join('\n\n') || 'Oldingi versiya yo‘q.');
      }).catch(function (error) { toast(error.message, 'error'); });
      return;
    }
    var edit = event.target.closest('[data-edit]');
    if (edit) {
      var message = state.messages.find(function (candidate) { return String(candidate.id) === String(edit.dataset.edit); });
      var body = window.prompt('Xabar matni:', message.body);
      if (body && body.trim()) NgoApi.patch('/admin/messages/' + encodeURIComponent(message.id), { body: body.trim(), version: message.version })
        .then(function (response) { Object.assign(message, response.item || response); renderMessages(false); });
      return;
    }
    var remove = event.target.closest('[data-delete]');
    if (remove && window.confirm('Xabar o‘chirilsinmi?')) {
      NgoApi.del('/admin/messages/' + encodeURIComponent(remove.dataset.delete)).then(function () {
        var message = state.messages.find(function (candidate) { return String(candidate.id) === String(remove.dataset.delete); });
        if (message) message.deleted_at = new Date().toISOString(); renderMessages(false);
      });
      return;
    }
    var attachment = event.target.closest('[data-download]');
    if (attachment) download(attachment.dataset.download, attachment.dataset.name);
  }

  function init(user) {
    wireEvents(user);
    var usersReady = NgoApi.get('/admin/messages/users').then(function (response) {
      state.users = arr(response.items);
      el('peoplePickerBtn').disabled = false;
      if (user.role === 'super_admin') el('groupCreateBtn').disabled = false;
      renderPeople();
    });
    Promise.all([usersReady, loadThreads(false)]).then(function () {
      return NgoApi.get('/admin/collaboration/events?bootstrap=1');
    }).then(function (response) {
      state.eventCursor = response.cursor || 0;
      return Promise.all([loadThreads(true), refreshCurrent(true)]);
    }).then(function () { pollEvents(); }).catch(function (error) { toast(error.message, 'error'); schedulePoll(state.backoff); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { state.backoff = 1000; pollEvents(); } });
    window.addEventListener('online', function () { state.backoff = 1000; pollEvents(); });
    window.addEventListener('offline', function () { setConnection('offline', 'Offline'); });
  }

  if (window.NgoAdminReady) NgoAdminReady.then(init).catch(function () {});
})();
