let io = null;
let onlineUsers = new Map();

const initSocket = (socketIo) => {
  io = socketIo;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const getOnlineUsers = () => onlineUsers;

const setOnlineUsers = (users) => {
  onlineUsers = users;
};

module.exports = {
  initSocket,
  getIO,
  getOnlineUsers,
  setOnlineUsers
}; 