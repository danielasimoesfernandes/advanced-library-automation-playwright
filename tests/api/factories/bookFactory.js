export class BookFactory {
    constructor(request) {
        this.request = request;
    }

    // Create a random, fun book for testing
    async createBookTest() {
        // Generate a random title
        const randomTitle = () => {
            const adjectives = ['Mystic', 'Hidden', 'Ancient', 'Magic', 'Lost', 'Secret', 'Silent',
                'Crazy', 'Enchanted', 'Dark', 'Brilliant', 'Forgotten', 'Infinite',
                'Golden', 'Shadowy', 'Wild', 'Epic', 'Radiant', 'Stormy', 'Cursed'];
            const nouns = ['Dragon', 'Forest', 'Castle', 'Kingdom', 'Book', 'Mystery', 'Planet',
                'Universe', 'Quest', 'Legend', 'River', 'Tower', 'Shadow', 'Star',
                'Maze', 'Throne', 'Knight', 'Guardian', 'Phoenix', 'Labyrinth'];

            const number = Math.floor(Math.random() * 99) + 1;
            return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} ${number}`;
        };

        // Generate a random author
        const randomAuthor = () => {
            const firstNames = ['Alice', 'Bob', 'Carlos', 'Dani', 'Eva', 'Felipe', 'Gina', 'Hugo',
                'Isabel', 'João', 'Luna', 'Miguel', 'Nina', 'Oscar', 'Paula', 'Quentin',
                'Rafael', 'Sofia', 'Thiago', 'Valentina'];
            const lastNames = ['Smith', 'Johnson', 'Oliveira', 'Costa', 'Santos', 'Martins', 'Ferreira',
                'Gomes', 'Rodriguez', 'Lopez', 'Silva', 'Pereira', 'Almeida', 'Ribeiro',
                'Moura', 'Carvalho', 'Dias', 'Nunes', 'Teixeira', 'Castro'];
            return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        };
        const randomDescription = () => {
            const textExample = ['A fun book to test.', 'A quirky adventure for testing purposes', 'A silly story to fill your test database.', 'A random tale for automated testing fun.', 'An amazing book for testing!'];
            return `${textExample[Math.floor(Math.random() * textExample.length)]}`;
        };

        const bookData = {
            nome: randomTitle(),
            autor: randomAuthor(),
            paginas: Math.floor(Math.random() * 500) + 100, // Random pages between 100-600
            descricao: randomDescription(),
            imagemUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/200/300`, // Random image URL
            estoque: Math.floor(Math.random() * 10) + 1, // Random stock 1-10
            preco: (Math.random() * 100).toFixed(2) // Random price
        };

        // Send POST request to create book
        return await this.request.post('/livros', { data: bookData });
    };

    async createBookForRentalTest() {
        return await this.request.post('/livros', {
            data: {
                nome: "Rental Test Book",
                autor: "Tech Author Rentals",
                paginas: 543,
                descricao: "A book created to test rental functionality",
                imagemUrl: "https://exemplo.com/imagem.jpg",
                estoque: 5,
                preco: 49.9
            }
        });
    };

    async createBookForFavoritesTest() {
        return await this.request.post('/livros', {
            data: {
                nome: "Favorites Test Book",
                autor: "Tech Author Fav",
                paginas: 567,
                descricao: "A book created to test favorites functionality",
                imagemUrl: "https://exemplo.com/imagem.jpg",
                estoque: 3,
                preco: 69.9
            }
        });
    };

    async createBookForPurchasesTest() {
        return await this.request.post('/livros', {
            data: {
                nome: "Purchase Test Book 4",
                autor: "Author Pur",
                paginas: 347,
                descricao: "A book created to test purchase functionality - part 4",
                imagemUrl: "https://exemplo.com/imagem.jpg",
                estoque: 16,
                preco: 57.0
            }
        });
    };
};