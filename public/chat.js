document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Conectar a socket.io

    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messages = document.getElementById('messages');

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const messageText = messageInput.value.trim();
        if (messageText !== '') {
            socket.emit('chatMessage', messageText);
            console.log("text1"+messageText)
            messageInput.value = '';
        }
    });

    socket.on('chatMessage', (username, messageText) => {
        addMessage(username, messageText); // Llama a la función con ambos parámetros
        console.log(username + ': ' + messageText);
    });

    function addMessage(username, messageText) { // Define la función con ambos parámetros
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = `${username}: ${messageText}`;
        messages.appendChild(messageElement);
        messages.scrollTop = messages.scrollHeight; // Scroll to the bottom
    }
});
