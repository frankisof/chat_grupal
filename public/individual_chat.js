document.addEventListener('DOMContentLoaded', () => {
    const socket = io({ query: { username: localStorage.getItem('username') } }); // Conectar a socket.io con el username
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    localStorage.setItem('username', username);
    console.log('Username:', username);

    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messages = document.getElementById('messages');
    const userList = document.getElementById('user-list');
    let selectedUser = null;

    // Manejar el envío de mensajes
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = messageInput.value.trim();
        if (messageText !== '') {
            if (selectedUser) {
                socket.emit('privateMessage', selectedUser, messageText);
                messages.innerHTML += `<p><strong>Para ${selectedUser}:</strong> ${messageText}</p>`;
            } else {
                socket.emit('chatMessage', username, messageText);
                messages.innerHTML += `<p><strong>${username}:</strong> ${messageText}</p>`;
            }
            messageInput.value = '';
        }
    });

    // Recibir mensajes de chat
   // socket.on('chatMessage', (username, msg) => {
     //   messages.innerHTML += `<p><strong>${username}:</strong> ${msg}</p>`;
    //});

    // Recibir mensajes privados
    socket.on('privateMessage', (fromUser, msg) => {
        messages.innerHTML += `<p><strong>De ${fromUser}:</strong> ${msg}</p>`;
    });

    // Actualizar la lista de usuarios
    socket.on('users', (users) => {
        userList.innerHTML = ''; // Limpiar la lista actual
        users.forEach(user => {
            if (user !== username) {
                const userItem = document.createElement('div');
                userItem.classList.add('user-item');
                userItem.textContent = user;
                userItem.addEventListener('click', () => {
                    selectedUser = user;
                    console.log('Usuario seleccionado:', selectedUser);
                });
                userList.appendChild(userItem);
            }
        });
    });
});
