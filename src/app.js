const express = require('express');
const path = require('path');
const { responderPergunta, carregarDados } = require('./config/api');

const app = express();
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

const port = 3000;

// rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// rota para processar perguntas do Blip
app.post('/api', async (req, res) => {
    const pergunta = req.body.pergunta; 
    try {
        const resposta = await responderPergunta(pergunta); 
        res.json({ response: resposta }); // envia a resposta no formato JSON (do jeito que foi configurado no blip)
    } catch (error) {
        console.error("Erro ao processar a pergunta:", error);
        res.status(500).json({ error: 'Erro ao processar a pergunta.' });
    }
});

// iniciar o servidor
async function startServer() {
    try {
        carregarDados();
        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Erro ao iniciar o servidor:", error);
    }
}

startServer();
