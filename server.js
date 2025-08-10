// Gerekli kütüphaneleri (Express ve Socket.io) dahil ediyoruz
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Express uygulamasını başlatıyoruz
const app = express();
const server = http.createServer(app);

// Socket.io sunucusunu HTTP sunucusuna bağlıyoruz
const io = socketIo(server);

// Sunucunun dinleyeceği portu belirliyoruz
const PORT = process.env.PORT || 3000;

// Sunucunun kök dizinine bir istek geldiğinde ne yapacağını belirliyoruz
app.get('/', (req, res) => {
  res.send('Rummy Sunucusu Çalışıyor!');
});

// Socket.io bağlantısı kurulduğunda ne yapacağımızı belirliyoruz
io.on('connection', (socket) => {
  console.log('Yeni bir kullanıcı bağlandı.');

  // Bağlantı kesildiğinde ne yapacağımızı belirliyoruz
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı.');
  });
});

// Sunucuyu belirtilen portta başlatıyoruz
server.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
