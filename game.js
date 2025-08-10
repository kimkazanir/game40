const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

const socket = io('https://game40.onrender.com');

let playerHand = [];
let deckCountText;
let discardPileSprite;
let deckSprite;
let turnText;
let isMyTurn = false;

function preload() {
    console.log("Görseller yükleniyor...");
    this.load.image('card_back', 'https://www.dropbox.com/scl/fi/v623d24g81s34n6h66s19/card_back.png?rlkey=4dfr48u411c97a82u788s3q9e&raw=1');
    this.load.atlas('cards', 'https://www.dropbox.com/scl/fi/f0c3l9g9v2m027p5q0b4d/cards.png?rlkey=8s43y84qg1e6o62k1d97f2m61&raw=1', 'https://www.dropbox.com/scl/fi/p5qj7q2p7k1h016d94h9o/cards.json?rlkey=t0w3w3t3f2d2r45t2t8q2z2s4&raw=1');
}

function create() {
    this.cameras.main.setBackgroundColor('#283618');
    this.add.text(600, 50, 'Online Rummy', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    turnText = this.add.text(600, 100, '', { fontSize: '24px', fill: '#ffc' }).setOrigin(0.5);

    const deckX = 450;
    const deckY = 400;
    const discardX = 750;
    const discardY = 400;

    deckSprite = this.add.image(deckX, deckY, 'card_back').setScale(0.7).setInteractive();
    discardPileSprite = this.add.image(discardX, discardY, 'card_back').setScale(0.7);

    deckCountText = this.add.text(deckX, deckY - 70, '', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

    deckSprite.on('pointerdown', () => {
        if (isMyTurn) {
            socket.emit('drawCard');
        } else {
            console.log("Sıra sizde değil!");
        }
    });

    socket.on('connect', () => {
        console.log('Sunucuya başarıyla bağlandık!', socket.id);
    });

    socket.on('myHand', (hand) => {
        playerHand = hand;
        displayHand(this);
    });

    socket.on('deckCount', (count) => {
        deckCountText.setText(`Deste: ${count}`);
    });
    
    socket.on('updateDiscardPile', (cardData) => {
        if (cardData) {
            discardPileSprite.setFrame(cardData.rank + cardData.suit);
        }
    });

    socket.on('playerJoined', (data) => {
        console.log(`Yeni oyuncu katıldı. Toplam oyuncu: ${data.totalPlayers}`);
        data.players.forEach(player => {
            if (player.id === socket.id) {
                isMyTurn = player.isTurn;
            }
        });
        updateTurnText();
    });

    socket.on('turnChanged', (playerId) => {
        isMyTurn = (playerId === socket.id);
        updateTurnText();
    });
}

function update() {
    // Oyun döngüsü
}

function updateTurnText() {
    turnText.setText(isMyTurn ? 'Sıra Sende!' : 'Rakibinin sırası...');
}

function displayHand(scene) {
    let handX = 600 - (playerHand.length * 40) / 2;
    let handY = 700;
    
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
        
        card.on('pointerdown', () => {
            if (isMyTurn) {
                socket.emit('discardCard', card.getData('cardData'));
            } else {
                console.log("Sıra sizde değil!");
            }
        });
    }
}
