const socket = io(`http://localhost:5000`);

let connected = false;

socket.emit("setup", userLoggedIn);

socket.on("connected",() => {
    connected = true;
})

socket.on("message received",(newMessage) => {
    messageReceived(newMessage);
})