// 1. Kết nối SignalR
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chathub")
    .withAutomaticReconnect()
    .build();

const msgList = document.getElementById("messagesList");

// Tự động cuộn xuống dưới cùng khi load trang
msgList.scrollTop = msgList.scrollHeight;

// 2. Nhận tin nhắn Realtime
connection.on("ReceiveMessage", function (user, message) {
    // Xóa dòng thông báo "Chưa có tin nhắn" nếu có
    const tempMsg = document.getElementById("no-msg-temp");
    if (tempMsg) tempMsg.remove();

    // 👇 Thay 'data.user' thành 'user'
    const isMe = user === "Admin" || user === "Quản trị viên";
    const div = document.createElement("div");
    div.className = isMe ? "text-end mb-3" : "text-start mb-3";

    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    // 👇 Thay 'data.user' và 'data.message' thành 'user' và 'message'
    div.innerHTML = `
            <div class="d-inline-block p-2 rounded shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-light text-dark border'}" style="max-width: 75%;">
                <div class="small fw-bold mb-1" style="font-size: 0.75rem;">${user}</div>
                <div style="word-wrap: break-word;">${message}</div>
                <div class="mt-1 text-end" style="font-size: 0.65rem; opacity: 0.8;">${timeStr}</div>
            </div>
        `;

    msgList.appendChild(div);
    msgList.scrollTop = msgList.scrollHeight;
});

// 3. Khởi động SignalR
connection.start()
    .then(() => console.log("✅ SignalR Connected!"))
    .catch(err => console.error("❌ Connection Error: ", err));

// 4. Gửi tin nhắn
function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value;

    if (message.trim() !== "") {
        // LƯU Ý: Nếu ChatHub nhận (string user, string message) thì truyền "Admin" vào đầu
        connection.invoke("SendMessage", "Admin", message)
            .catch(err => console.error(err));
        input.value = "";
    }
}

document.getElementById("sendButton").addEventListener("click", function (e) {
    sendMessage();
    e.preventDefault();
});

document.getElementById("messageInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
        e.preventDefault();
    }
});