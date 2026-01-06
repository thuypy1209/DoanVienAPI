/**
 * Xem trước hình ảnh khi chọn file
 * @param {HTMLElement} input - Đối tượng input file
 * @param {string} previewId - ID của thẻ img hiển thị ảnh (mặc định là 'imagePreview')
 */
function previewImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            // Cập nhật nguồn ảnh cho thẻ img có id imagePreview
            document.getElementById('imagePreview').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}