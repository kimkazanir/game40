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
    this.load.image('card_back', 'https://gameassets.netlify.app/card_back.png');
    this.load.image('cards', 'https://gameassets.netlify.app/cards.png');
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
            displayDiscardPile(this, cardData);
        }
    });

    socket.on('playerJoined', (data) => {
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

function getCardFrame(cardData) {
    const cardNames = [
        'Aclubs', 'Ahearts', 'Adiamonds', 'Aspades',
        '2clubs', '2hearts', '2diamonds', '2spades',
        '3clubs', '3hearts', '3diamonds', '3spades',
        '4clubs', '4hearts', '4diamonds', '4spades',
        '5clubs', '5hearts', '5diamonds', '5spades',
        '6clubs', '6hearts', '6diamonds', '6spades',
        '7clubs', '7hearts', '7diamonds', '7spades',
        '8clubs', '8hearts', '8diamonds', '8spades',
        '9clubs', '9hearts', '9diamonds', '9spades',
        '10clubs', '10hearts', '10diamonds', '10spades',
        'Jclubs', 'Jhearts', 'Jdiamonds', 'Jspades',
        'Qclubs', 'Qhearts', 'Qdiamonds', 'Qspades',
        'Kclubs', 'Khearts', 'Kdiamonds', 'Kspades',
        'Joker1', 'Joker2'
    ];
    return cardNames.indexOf(cardData.rank + cardData.suit);
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
        let card = scene.add.sprite(handX + (i * 80), handY, 'cards', getCardFrame(cardData)).setScale(0.7);
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

function displayDiscardPile(scene, cardData) {
    discardPileSprite.setTexture('cards');
    discardPileSprite.setFrame(getCardFrame(cardData));
}
