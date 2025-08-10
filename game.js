// Phaser oyununun konfigürasyon ayarları
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    parent: 'game-container'
};

// Phaser oyun nesnesini oluşturuyoruz
const game = new Phaser.Game(config);

// Socket.io ile sunucuya bağlanıyoruz
// Sunucunuzun Render URL'sini kullanıyoruz.
const socket = io('https://game40.onrender.com');

function preload() {
    // Burada kart görselleri gibi varlıklar yüklenecek
}

function create() {
    // Oyun tahtası için basit bir arka plan rengi ekleyelim.
    this.cameras.main.setBackgroundColor('#283618'); // Koyu yeşil bir masa rengi

    // Ortaya oyunun adını yazalım
    this.add.text(400, 300, 'Online Rummy', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    // Sunucuya başarıyla bağlandığımızda
    socket.on('connect', () => {
        console.log('Sunucuya başarıyla bağlandık!', socket.id);
    });

    // Sunucudan gelen bir mesajı dinlemek için
    socket.on('message', (data) => {
        console.log('Sunucudan gelen mesaj:', data);
    });
}

function update() {
    // Oyun döngüsü her karede güncellenecek
}
