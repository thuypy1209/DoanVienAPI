using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace DoanVienAPI.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
        public async Task SendPrivateMessage(string targetUserId, string message)
        {
            await Clients.User(targetUserId).SendAsync("ReceivePrivateMessage", Context.UserIdentifier, message);
        }
    }
}
