function showQrCode(id, tenHoatDong) {
    // 1. Cập nhật tiêu đề Modal
    var titleElement = document.getElementById('qrTitle');
    if (titleElement) {
        titleElement.innerText = 'QR: ' + tenHoatDong;
    }

    // 2. Cấu hình đường dẫn API
    // ⚠️ QUAN TRỌNG:
    // Nếu Web Admin và API chạy cùng Port (VD: cùng localhost:5000) -> Dùng dòng dưới:
    // var apiUrl = '/api/HoatDong/qr/' + id;

    // Nếu Web Admin và API chạy KHÁC Port (VD: Web 3000, API 5000) -> Phải điền full link API:
    var domainApi = 'http://localhost:5000'; // Thay bằng domain/port thật của API
    var apiUrl = domainApi + '/api/HoatDong/qr/' + id;

    // Mẹo nhỏ: Thêm thời gian vào cuối để trình duyệt không cache ảnh cũ
    apiUrl += '?t=' + new Date().getTime();

    // 3. Gán ảnh
    var img = document.getElementById('qrImage');
    if (img) {
        // Reset ảnh về rỗng trước khi tải ảnh mới để tránh hiện ảnh cũ
        img.src = '';
        img.src = apiUrl;
    }

    // 4. Hiển thị Modal (Hỗ trợ cả Bootstrap 4 và 5)
    var modalElement = document.getElementById('qrModal');
    if (modalElement) {
        // Kiểm tra xem bootstrap đã được load chưa
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            var myModal = new bootstrap.Modal(modalElement);
            myModal.show();
        } else {
            // Fallback nếu dùng jQuery (Bootstrap 4 cũ)
            if (typeof $ !== 'undefined') {
                $('#qrModal').modal('show');
            } else {
                alert("Lỗi: Chưa cài đặt thư viện Bootstrap JS!");
            }
        }
    }
}

function printQr() {
    var imgElement = document.getElementById('qrImage');
    if (!imgElement || imgElement.src === '') {
        alert("Chưa có mã QR để in!");
        return;
    }

    var imgUrl = imgElement.src;
    var win = window.open('', '_blank');

    win.document.write('<html><head><title>In QR Code</title>');
    // Thêm CSS để canh giữa trang giấy khi in
    win.document.write('<style>body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; } img { max-width: 100%; height: auto; }</style>');
    win.document.write('</head><body>');

    win.document.write('<h1>Mã điểm danh</h1>');
    win.document.write('<h3 style="color:#666">' + document.getElementById('qrTitle').innerText.replace('QR: ', '') + '</h3>');
    win.document.write('<img src="' + imgUrl + '" width="400" style="border:1px solid #000; padding:10px;"/>');
    win.document.write('<p style="margin-top:20px; font-style:italic;">Quét bằng App Đoàn Viên</p>');

    // Script tự động in
    win.document.write('<script>window.onload = function() { setTimeout(function(){ window.print(); window.close(); }, 500); }<\/script>');

    win.document.write('</body></html>');
    win.document.close();
}