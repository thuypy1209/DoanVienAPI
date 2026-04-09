function searchSinhVien() {
    // 1. Lấy đúng ID từ HTML (đã sửa từ searchSinhVien thành searchSinhVienInput)
    let generalSearch = document.getElementById("searchSinhVienInput").value.toLowerCase();
    let khoaFilter = document.getElementById("filterKhoa").value.toLowerCase();
    let lopFilter = document.getElementById("filterLop").value.toLowerCase();

    let rows = document.querySelectorAll("#sinhVienTable tr");

    rows.forEach(row => {
        let cells = row.getElementsByTagName("td");
        // Bỏ qua dòng thông báo "Chưa có dữ liệu" (chỉ có 1 cell)
        if (cells.length < 4) return;

        // Cột 0: MSSV | Cột 1: Họ tên | Cột 2: Lớp/Khoa | Cột 3: Email
        let textMSSV = cells[0].innerText.toLowerCase();
        let textHoTen = cells[1].innerText.toLowerCase();
        let textLopKhoa = cells[2].innerText.toLowerCase(); // Cột này chứa cả Lớp và Khoa
        let textEmail = cells[3].innerText.toLowerCase();

        // 2. KIỂM TRA ĐIỀU KIỆN
        // Tìm kiếm nhanh: khớp với MSSV hoặc Tên hoặc Email
        let matchGeneral = textMSSV.includes(generalSearch) ||
            textHoTen.includes(generalSearch) ||
            textEmail.includes(generalSearch);

        // Lọc theo Khoa: Tìm trong cột Lớp/Khoa
        let matchKhoa = khoaFilter === "" || textLopKhoa.includes(khoaFilter);

        // Lọc theo Lớp: Tìm trong cột Lớp/Khoa
        let matchLop = lopFilter === "" || textLopKhoa.includes(lopFilter);

        // 3. HIỂN THỊ (Phải thỏa mãn đồng thời cả 3 bộ lọc)
        if (matchGeneral && matchKhoa && matchLop) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// Hàm Reset bộ lọc
function resetFilters() {
    document.getElementById("searchSinhVienInput").value = "";
    document.getElementById("filterKhoa").value = "";
    document.getElementById("filterLop").value = "";
    searchSinhVien(); // Cập nhật lại bảng về mặc định
}