// Gerekli kütüphaneleri dahil ediyoruz
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.io sunucusunu HTTP sunucusuna bağlıyoruz
const io = socketIo(server, {
  cors: {
    origin: '*', // Tüm bağlantılara izin veriyoruz
  }
});

const PORT = process.env.PORT || 3000;

// OYUN VERİLERİ
let deck = [];
let players = {};
let discardPile = [];
const MAX_PLAYERS = 6;
const STARTING_CARDS = 14;

// 3 deste kartı oluşturacak ve karıştıracak fonksiyon
function createDeck() {
    const suits = ['C', 'D', 'H', 'S'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    let newDeck = [];

    for (let i = 0; i < 3; i++) {
        for (const suit of suits) {
            for (const rank of ranks) {
                newDeck.push({ rank, suit });
            }
        }
    }

    // Fisher-Yates shuffle algoritması
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

// Oyun başladığında desteyi oluşturuyoruz
deck = createDeck();
discardPile.push(deck.pop()); // Bir kartı atma destesine koyuyoruz

// Socket.io bağlantısı kurulduğunda
io.on('connection', (socket) => {
    console.log(`Yeni bir oyuncu bağlandı: ${socket.id}`);

    // Oyuncu sayısının maksimuma ulaşmadığını kontrol et
    if (Object.keys(players).length < MAX_PLAYERS) {
        players[socket.id] = {
            id: socket.id,
            hand: [],
            score: 0,
            isTurn: false,
        };

        // Bağlanan oyuncuya kartları dağıt
        for (let i = 0; i < STARTING_CARDS; i++) {
            players[socket.id].hand.push(deck.pop());
        }

        // Oyuncu bağlandığında tüm oyunculara haber ver
        io.emit('playerJoined', {
            id: socket.id,
            totalPlayers: Object.keys(players).length,
        });

        // Bağlanan oyuncuya elini gönder
        socket.emit('myHand', players[socket.id].hand);

    } else {
        socket.emit('gameFull', 'Oyun dolu, daha sonra tekrar deneyin.');
        socket.disconnect();
    }


    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
        console.log(`Oyuncu ayrıldı: ${socket.id}`);
        delete players[socket.id];
        io.emit('playerDisconnected', {
            id: socket.id,
            totalPlayers: Object.keys(players).length,
        });
    });
});

// Sunucuyu başlatıyoruz
server.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
