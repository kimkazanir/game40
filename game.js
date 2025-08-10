// Phaser oyununun konfigürasyon ayarları
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Phaser oyun nesnesini oluşturuyoruz
const game = new Phaser.Game(config);

// Socket.io ile sunucuya bağlanıyoruz
// Render'da yayınladığınız arka uç sunucunuzun URL'sini buraya eklemelisiniz.
// Örnek: const socket = io('https://your-online-rummy-backend.onrender.com');
const socket = io('http://localhost:3000'); // Geliştirme için yerel sunucu adresi

function preload() {
    // Burada kart görselleri gibi varlıkları yüklenecek
}

function create() {
    // Sunucuya başarıyla bağlandığımızda
    socket.on('connect', () => {
        console.log('Sunucuya başarıyla bağlandık!', socket.id);
    });

    // Sunucudan gelen bir mesajı dinlemek için
    socket.on('message', (data) => {
        console.log('Sunucudan gelen mesaj:', data);
    });

    // Burada oyunun başlangıç ayarları ve arayüzü oluşturulacak
    this.add.text(400, 300, 'Oyun Yükleniyor...', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
}

function update() {
    // Oyun döngüsü her karede güncellenecek
}
