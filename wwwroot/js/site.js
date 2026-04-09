document.addEventListener('DOMContentLoaded', function () {
    // Tìm cái nút (thử cả 2 ID cho chắc ăn)
    const btn = document.getElementById('menu-toggle') || document.getElementById('sidebarToggle');
    const wrapper = document.getElementById('wrapper');

    if (btn && wrapper) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            wrapper.classList.toggle('toggled');
            console.log("Sidebar toggled!");
        });
    }
});