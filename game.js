// Phaser oyununun konfigürasyon ayarları
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

// Phaser oyun nesnesini oluşturuyoruz
const game = new Phaser.Game(config);

// Socket.io ile sunucuya bağlanıyoruz (Render linkiniz burada olmalı)
const socket = io('https://game40.onrender.com');

// 3 deste kartı oluşturacak ve karıştıracak fonksiyon
function createDeck() {
    const suits = ['C', 'D', 'H', 'S']; // Sinek, Karo, Kupa, Maça
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']; // T = 10
    let deck = [];

    for (let i = 0; i < 3; i++) {
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ rank, suit });
            }
        }
    }

    // Fisher-Yates shuffle algoritması
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Oyuncu ve oyun verilerini saklayacağımız global değişkenler
let deck = [];
let players = {};
let playerHand = [];
let discardPile = [];

// Kart görsellerini önceden yükle
function preload() {
    this.load.image('card_back', 'https://raw.githubusercontent.com/yolafro/phaser-deck/main/assets/images/card_back.png');
    this.load.atlas('cards', 'https://raw.githubusercontent.com/yolafro/phaser-deck/main/assets/images/cards.png', 'https://raw.githubusercontent.com/yolafro/phaser-deck/main/assets/images/cards.json');
}

// Oyun başladığında çalışacak kod
function create() {
    // Oyun tahtası için koyu yeşil arka plan
    this.cameras.main.setBackgroundColor('#283618');

    // Sunucuya başarıyla bağlandığımızda
    socket.on('connect', () => {
        console.log('Sunucuya başarıyla bağlandık!', socket.id);

        // Sunucuya oyuncu olarak katıldığımızı bildiriyoruz
        socket.emit('playerJoined', { id: socket.id });
    });

    // Sunucudan gelen mesajları dinleme
    socket.on('message', (data) => {
        console.log('Sunucudan mesaj:', data);
    });

    // Ana deste ve atma destesi alanlarını oluşturma
    let deckX = this.cameras.main.width / 2 - 150;
    let deckY = this.cameras.main.height / 2;

    this.add.image(deckX, deckY, 'card_back').setScale(0.7);
    this.add.text(deckX, deckY - 70, 'Deste', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

    let discardX = this.cameras.main.width / 2 + 150;
    let discardY = this.cameras.main.height / 2;
    this.add.rectangle(discardX, discardY, 100, 140, 0x555555); // Atma destesi için placeholder

    // Oyunun adını ekrana yazma
    this.add.text(400, 300, 'Online Rummy', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    // Deste oluşturma
    deck = createDeck();
    console.log('Oluşturulan deste:', deck.length, 'kart');
    
    // Oyuncu elini göstermek için kartları ekrana yerleştirme
    // Bu sadece bir görsel yerleştirme örneğidir, gerçek kartları sunucu gönderecek
    let handX = 100;
    let handY = 700;
    for (let i = 0; i < 14; i++) {
        let card = this.add.image(handX + (i * 40), handY, 'card_back').setScale(0.5);
        playerHand.push(card);
    }
}

function update() {
    // Oyun döngüsü her karede güncellenecek
}
