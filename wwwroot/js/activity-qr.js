/**
 * Hiển thị Modal và tải mã QR từ API
 * @param {number} id - ID của hoạt động
 * @param {string} name - Tên hoạt động để hiển thị tiêu đề
 */
function showQrCode(id, name) {

    // Lấy element
    const qrTitle = document.getElementById("qrTitle");
    const qrImg = document.getElementById("qrImage");
    const qrModalEl = document.getElementById("qrModal");

    // ❗ FIX: nếu thiếu element thì dừng (tránh crash)
    if (!qrTitle || !qrImg || !qrModalEl) {
        console.error("QR elements not found:", {
            qrTitle,
            qrImg,
            qrModalEl
        });
        return;
    }

    // 1. Cập nhật tiêu đề Modal
    qrTitle.innerText = "Mã QR: " + name;

    // 2. Trỏ src của ảnh tới API GenerateQRCode
    const qrImageUrl = "/api/HoatDong/qr/" + id;

    // Hiển thị trạng thái đang tải
    qrImg.style.opacity = "0.5";

    qrImg.src = qrImageUrl;

    // Khi ảnh tải xong thì hiện rõ lại
    qrImg.onload = function () {
        qrImg.style.opacity = "1";
    };

    // 3. Hiển thị Modal
    var myModal = new bootstrap.Modal(qrModalEl);
    myModal.show();
}

/**
 * Hàm in mã QR
 */
function printQr() {
    const qrImg = document.getElementById("qrImage");
    const qrTitle = document.getElementById("qrTitle");

    // ❗ FIX: tránh null
    if (!qrImg || !qrTitle) {
        console.error("QR elements not found for print");
        return;
    }

    const qrSrc = qrImg.src;
    const activityName = qrTitle.innerText;

    if (!qrSrc) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>In mã QR</title>
                <style>
                    body { text-align: center; font-family: sans-serif; padding: 50px; }
                    img { width: 400px; height: 400px; }
                    h2 { margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <h2>${activityName}</h2>
                <img src="${qrSrc}" />
                <p>Sử dụng ứng dụng để quét mã điểm danh</p>
                <script>
                    window.onload = function() { window.print(); window.close(); };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * Search bảng
 */
function searchTable() {
    const inputEl = document.getElementById("searchInput");
    const tableRows = document.querySelectorAll("#activityTable tr");

    // ❗ FIX: check null
    if (!inputEl) return;

    let input = inputEl.value.toLowerCase();

    tableRows.forEach(row => {
        let text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? "" : "none";
    });
}