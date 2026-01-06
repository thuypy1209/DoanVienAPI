/**
 * Hiển thị Modal và tải mã QR từ API
 * @param {number} id - ID của hoạt động
 * @param {string} name - Tên hoạt động để hiển thị tiêu đề
 */
function showQrCode(id, name) {
    // 1. Cập nhật tiêu đề Modal
    document.getElementById("qrTitle").innerText = "Mã QR: " + name;

    // 2. Trỏ src của ảnh tới API GenerateQRCode
    // Đường dẫn này phải khớp với [HttpGet("qr/{id}")] trong HoatDongController
    const qrImageUrl = "/api/HoatDong/qr/" + id;

    const qrImg = document.getElementById("qrImage");

    // Hiển thị trạng thái đang tải (tùy chọn)
    qrImg.style.opacity = "0.5";

    qrImg.src = qrImageUrl;

    // Khi ảnh tải xong thì hiện rõ lại
    qrImg.onload = function () {
        qrImg.style.opacity = "1";
    };

    // 3. Hiển thị Modal (Sử dụng Bootstrap 5 native)
    var myModal = new bootstrap.Modal(document.getElementById('qrModal'));
    myModal.show();
}

/**
 * Hàm in mã QR
 */
function printQr() {
    const qrSrc = document.getElementById("qrImage").src;
    const activityName = document.getElementById("qrTitle").innerText;

    if (!qrSrc) return;

    // Tạo một cửa sổ mới để in
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