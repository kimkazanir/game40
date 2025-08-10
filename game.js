// ... (Önceki kodlar aynı kalacak) ...

// Global oyun objeleri
let deckSprite;
let discardPileSprite;
let playerHand = [];

function create() {
    this.cameras.main.setBackgroundColor('#283618');
    this.add.text(600, 50, 'Online Rummy', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    // Deste ve atma destesi görsellerini ekle
    deckSprite = this.add.image(450, 400, 'card_back').setScale(0.7).setInteractive();
    discardPileSprite = this.add.image(750, 400, 'card_back').setScale(0.7);

    // Desteye tıklama olayını ekle
    deckSprite.on('pointerdown', () => {
        socket.emit('drawCard');
    });

    // Sunucuya başarıyla bağlandığımızda
    socket.on('connect', () => {
        console.log('Sunucuya başarıyla bağlandık!', socket.id);
    });

    // Sunucudan gelen kendi kartlarımızı alıyoruz
    socket.on('myHand', (hand) => {
        playerHand = hand;
        console.log('Elindeki kartlar:', playerHand);
        displayHand(this);
    });

    // Sunucudan gelen mesajları dinleme
    socket.on('playerJoined', (data) => {
        console.log(`Yeni oyuncu katıldı. Toplam oyuncu: ${data.totalPlayers}`);
        // Atma destesini güncelle
        if (data.discardPile) {
            discardPileSprite.setFrame(data.discardPile.rank + data.discardPile.suit);
        }
    });
    
    // Atma destesini güncelleme
    socket.on('updateDiscardPile', (cardData) => {
        discardPileSprite.setFrame(cardData.rank + cardData.suit);
    });
}

function displayHand(scene) {
    let handX = 600 - (playerHand.length * 40) / 2;
    let handY = 700;
    
    // Elimizdeki kartları temizle
    scene.children.each((child) => {
        if (child.getData && child.getData('isCard')) {
            child.destroy();
        }
    });

    for (let i = 0; i < playerHand.length; i++) {
        const cardData = playerHand[i];
        const cardFrame = cardData.rank + cardData.suit;
        let card = scene.add.image(handX + (i * 80), handY, 'cards', cardFrame).setScale(0.7);
        card.setInteractive();
        card.setData('isCard', true);
        card.setData('cardData', cardData);
        
        // Kartı atmak için tıklama olayı
        card.on('pointerdown', () => {
            socket.emit('discardCard', card.getData('cardData'));
        });
    }
}

// ... (update fonksiyonu aynı kalacak) ...
