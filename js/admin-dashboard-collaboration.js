(function(){
  'use strict';
  function set(id,v){var e=document.getElementById(id);if(e)e.textContent=Number(v||0);}
  function init(){var u=window.__CURRENT_USER__||(NgoApi.getUser&&NgoApi.getUser())||{};var b=document.getElementById('dashboardAssignTask');if(b&&u.role==='super_admin')b.hidden=false;Promise.all([NgoApi.get('/admin/tasks?page=1&limit=1'),NgoApi.get('/admin/messages/threads?limit=100')]).then(function(r){var k=r[0].kpis||{};set('dashboardTaskOverdue',k.overdue_count);set('dashboardTaskBlocked',k.blocked_count);var unread=(r[1].items||[]).reduce(function(n,t){return n+Number(t.unread_count||0);},0);set('dashboardUnreadMessages',unread);var badge=document.getElementById('dashboardNavUnread');if(badge){badge.hidden=!unread;badge.textContent=unread>99?'99+':unread;}}).catch(function(){set('dashboardTaskOverdue',0);set('dashboardTaskBlocked',0);set('dashboardUnreadMessages',0);});}
  (function wait(n){if(window.__CURRENT_USER__||!n)init();else setTimeout(function(){wait(n-1);},100);})(30);
})();
