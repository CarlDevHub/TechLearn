document.addEventListener('DOMContentLoaded', function () {

    var toggle = document.getElementById('navToggle');
    var drawer = document.getElementById('navDrawer');
    var overlay = document.getElementById('drawerOverlay');
    var close = document.getElementById('drawerClose');

    function openDrawer() {
        if (drawer) drawer.classList.add('open');
        if (overlay) overlay.classList.add('open');
    }

    function closeDrawer() {
        if (drawer) drawer.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }

    if (toggle) toggle.addEventListener('click', openDrawer);
    if (close) close.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.mainNav a, .drawerNav a').forEach(function (a) {
        if (a.getAttribute('href') === current) {
            a.classList.add('active');
        }
    });

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.fadeIn').forEach(function (el) { io.observe(el); });

    document.querySelectorAll('.moduleBtn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = btn.closest('.moduleItem');
            var isOpen = item.classList.contains('open');

            document.querySelectorAll('.moduleItem.open').forEach(function (o) {
                if (o !== item) o.classList.remove('open');
            });

            item.classList.toggle('open', !isOpen);
        });
    });

    var firstModule = document.querySelector('.moduleItem');
    if (firstModule) firstModule.classList.add('open');

    document.querySelectorAll('.lessonBtn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = btn.dataset.lesson;
            if (!id) return;

            document.querySelectorAll('.lessonBtn').forEach(function (b) { b.classList.remove('active'); });
            document.querySelectorAll('.lessonPanel').forEach(function (p) { p.classList.remove('active'); });

            btn.classList.add('active');
            var panel = document.getElementById(id);
            if (panel) panel.classList.add('active');

            var content = document.querySelector('.lessonContent');
            if (content && window.innerWidth < 900) {
                content.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    var firstLesson = document.querySelector('.lessonBtn');
    if (firstLesson) firstLesson.click();

    restoreProgress();

    document.querySelectorAll('.markBtn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = btn.dataset.lesson;
            var done = btn.classList.contains('done');
            var sideBtn = document.querySelector('.lessonBtn[data-lesson="' + id + '"]');

            if (done) {
                btn.classList.remove('done');
                btn.textContent = '✓ Mark as Complete';
                if (sideBtn) sideBtn.classList.remove('done');
                saveLesson(id, false);
            } else {
                btn.classList.add('done');
                btn.textContent = '✓ Completed';
                if (sideBtn) sideBtn.classList.add('done');
                saveLesson(id, true);
            }

            updateProgressBar();
        });
    });

    function saveLesson(id, state) {
        var key = getStorageKey();
        var data = JSON.parse(localStorage.getItem(key) || '{}');
        data[id] = state;
        localStorage.setItem(key, JSON.stringify(data));
    }

    function restoreProgress() {
        var key = getStorageKey();
        var data = JSON.parse(localStorage.getItem(key) || '{}');
        Object.keys(data).forEach(function (id) {
            if (!data[id]) return;
            var sideBtn = document.querySelector('.lessonBtn[data-lesson="' + id + '"]');
            if (sideBtn) sideBtn.classList.add('done');
            var markBtn = document.querySelector('.markBtn[data-lesson="' + id + '"]');
            if (markBtn) { markBtn.classList.add('done'); markBtn.textContent = '✓ Completed'; }
        });
        updateProgressBar();
    }

    function updateProgressBar() {
        var total = document.querySelectorAll('.lessonBtn').length;
        var done = document.querySelectorAll('.lessonBtn.done').length;
        var pct = total > 0 ? Math.round((done / total) * 100) : 0;

        var fill = document.querySelector('.sidebarProgressFill');
        var text = document.querySelector('.sidebarProgressText');
        if (fill) fill.style.width = pct + '%';
        if (text) text.textContent = done + ' / ' + total + ' lessons (' + pct + '%)';
    }

    function getStorageKey() {
        return 'progress_' + window.location.pathname.split('/').pop().replace('.html', '');
    }

    if (document.getElementById('dashProgress')) {
        renderDashboard();
    }

    function renderDashboard() {
        var courses = [
            { key: 'progress_cybersecurity-course', prefix: 'sec', total: 10 },
            { key: 'progress_database-course', prefix: 'db', total: 10 },
            { key: 'progress_networking-course', prefix: 'net', total: 8 }
        ];

        var totalDone = 0;
        var totalAll = 0;

        courses.forEach(function (c) {
            var data = JSON.parse(localStorage.getItem(c.key) || '{}');
            var done = Object.values(data).filter(Boolean).length;
            var pct = Math.round((done / c.total) * 100);

            totalDone += done;
            totalAll += c.total;

            var fill = document.getElementById(c.prefix + 'Fill');
            var label = document.getElementById(c.prefix + 'Label');
            var pctEl = document.getElementById(c.prefix + 'Pct');

            setTimeout(function () { if (fill) fill.style.width = pct + '%'; }, 300);
            if (label) label.textContent = done + ' / ' + c.total;
            if (pctEl) pctEl.textContent = pct + '%';
        });

        var overallPct = Math.round((totalDone / totalAll) * 100);
        var totalEl = document.getElementById('totalDone');
        var overallEl = document.getElementById('overallPct');
        if (totalEl) totalEl.textContent = totalDone;
        if (overallEl) overallEl.textContent = overallPct + '%';
    }

});
