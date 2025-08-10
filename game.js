const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    parent: 'game-container'
};

const game = new Phaser.Game(config);

// Sunucuya bağlanmak için URL (rummy-backend servisinizin adresi)
// Render'da rummy-backend servisini yayınladığınızda alacağınız URL'yi buraya yazın.
// Örnek: const socket = io('https://rummy-backend.onrender.com');
const socket = io('https://rummy-backend.onrender.com'); // Placeholder URL

// Oyun verileri
let playerHand = [];

function preload() {
    this.load.image('card_back', 'https://raw.githubusercontent.com/yolafro/phaser-deck/main/assets/images/card_back.png');
    this.load.atlas('cards', 'https://raw.githubusercontent.com/yolafro/phaser-deck/main/assets/images/cards.png', 'https://raw.githubusercontent.com/yolafro/phaser-deck/main/assets/images/cards.json');
}

function create() {
    this.cameras.main.setBackgroundColor('#283618');
    this.add.text(600, 50, 'Online Rummy', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

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
    });
}

function update() {
    // Oyun döngüsü
}

// Kartları ekranda göstermek için fonksiyon
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
    }
}
