document.addEventListener('DOMContentLoaded', function () {
    // 1. Sidebar Toggle Button
    const btn = document.getElementById('menu-toggle') || document.getElementById('sidebarToggle');
    const wrapper = document.getElementById('wrapper');

    if (btn && wrapper) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            wrapper.classList.toggle('toggled');
        });
    }

    // 2. Hiển thị ngày tháng hiện tại (Tiếng Việt)
    const dateEl = document.getElementById('currentDateDisplay');
    if (dateEl) {
        const today = new Date();
        const options = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' };
        // Ví dụ: Thứ Bảy, 14/11/2026
        dateEl.textContent = today.toLocaleDateString('vi-VN', options);
    }
});
