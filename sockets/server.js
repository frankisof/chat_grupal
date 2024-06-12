const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuración del middleware de sesión
const sessionMiddleware = session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: false
});
app.use(sessionMiddleware);
io.use(sharedSession(sessionMiddleware));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../public/index.html'));
});

let users = {};

app.post('/login', (req, res) => {
    const { username, password, chatType } = req.body;
    if ((username === 'francisco' || username === 'juan' || username === 'pedro') && password === 'contraseña') {
        req.session.username = username; // Guardar el nombre de usuario en la sesión
        if (chatType === 'individual') {
            res.redirect(`/individual_chat.html?username=${username}`);
        } else {
            res.redirect(`/chat.html?username=${username}`);
        }
    } else {
        res.send('Nombre de usuario o contraseña incorrectos.');
    }
});


io.on('connection', (socket) => {
    const username = socket.handshake.session.username; // Obtener el nombre de usuario de la sesión
    if (username) {
        users[username] = socket.id;

        io.emit('users', Object.keys(users));  // Enviar la lista de usuarios conectados

        console.log('Nuevo usuario conectado:', username);

        socket.on('chatMessage', (msg) => {
            io.emit('chatMessage', username, msg);  // Emitir mensaje a todos los usuarios
        });

        socket.on('privateMessage', (toUser, msg) => {
            const toSocketId = users[toUser];
            if (toSocketId) {
                io.to(toSocketId).emit('privateMessage', username, msg);// Emitir mensaje privado
                console.log(`Mensaje privado de ${username} a ${toUser}: ${msg}`);
            } else {
                console.log(`Usuario ${toUser} no encontrado para mensaje privado.`);
            }
        });

        socket.on('disconnect', () => {
            delete users[username];
            io.emit('users', Object.keys(users));  // Actualizar la lista de usuarios conectados
            console.log('Usuario desconectado:', username);
        });
    } else {
        console.log('Usuario no autenticado. Cerrando la conexión.');
        socket.disconnect(true); // Desconectar el socket no autenticado
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
