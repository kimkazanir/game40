// ... (Önceki kodlar aynı kalacak) ...

// Socket.io bağlantısı kurulduğunda
io.on('connection', (socket) => {
    console.log(`Yeni bir oyuncu bağlandı: ${socket.id}`);

    if (Object.keys(players).length < MAX_PLAYERS) {
        players[socket.id] = {
            id: socket.id,
            hand: [],
            score: 0,
            isTurn: Object.keys(players).length === 0, // İlk oyuncu turu başlar
        };

        for (let i = 0; i < STARTING_CARDS; i++) {
            players[socket.id].hand.push(deck.pop());
        }

        io.emit('playerJoined', {
            id: socket.id,
            totalPlayers: Object.keys(players).length,
            players: Object.values(players),
            discardPile: discardPile[discardPile.length - 1],
        });

        socket.emit('myHand', players[socket.id].hand);

    } else {
        socket.emit('gameFull', 'Oyun dolu, daha sonra tekrar deneyin.');
        socket.disconnect();
    }
    
    // Oyuncu desteden kart çektiğinde
    socket.on('drawCard', () => {
        if (deck.length > 0) {
            const card = deck.pop();
            players[socket.id].hand.push(card);
            socket.emit('myHand', players[socket.id].hand); // Elini güncelle
            io.emit('deckCount', deck.length); // Deste sayısını tüm oyunculara gönder
        }
    });

    // Oyuncu elindeki bir kartı attığında
    socket.on('discardCard', (cardData) => {
        const playerHand = players[socket.id].hand;
        const cardIndex = playerHand.findIndex(card => card.rank === cardData.rank && card.suit === cardData.suit);
        
        if (cardIndex !== -1) {
            const discardedCard = playerHand.splice(cardIndex, 1)[0];
            discardPile.push(discardedCard);
            socket.emit('myHand', players[socket.id].hand); // Elini güncelle
            io.emit('updateDiscardPile', discardedCard); // Atma destesini güncelle
            
            // Sıradaki oyuncuya turu devret
            // ... (Tur yönetimi kodları buraya gelecek) ...
        }
    });

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

// ... (Kalan kodlar aynı kalacak) ...
