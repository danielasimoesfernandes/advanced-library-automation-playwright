export class UserFactory {
    constructor(request) {
        this.request = request;
    }

    async registerTestUser() {
        // Generate unique name and email
            const firstNames = [
                'Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel',
                'Helena', 'Iris', 'João', 'Katia', 'Luís', 'Mariana', 'Nuno', 'Joana', 'Paulo',
                'Olivia', 'Pedro', 'Raquel', 'Sergio', 'Teresa', 'Vítor', 'Henrique', 'Ines',
                'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael',
                'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard',
                'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'
            ];
            const lastNames = [
                'Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues',
                'Martins', 'Jesus', 'Sousa', 'Fernandes', 'Gonçalves', 'Gomes', 'Lopes',
                'Marques', 'Alves', 'Almeida', 'Ribeiro', 'Pinto', 'Carvalho', 'Simoes', 'Barbosa',
                'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
                'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzales',
                'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
            ];

            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${firstName} ${lastName}`;

            const domains = ['teste.com', 'exemplo.com', 'mail.com'];
            const randomString = Math.random().toString(36).substring(2, 7);
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}_${randomString}@${domains[0]}`;
            const password = "123456";

            const response = await this.request.post('/registro', {
                data: {
                    nome: fullName,
                    email: email,
                    senha: password
                }
            }); 
            const responseBody = await response.json();
            const userId = responseBody.usuario.id;
            return { response, userId, fullName, email, password };
        };
    };
