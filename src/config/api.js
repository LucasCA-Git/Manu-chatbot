const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

let db;
let facilitInfoMarkdown;

// "lê" o arquivo da base de conhecimento e das entidades 
function carregarDados() {
    const filePathFacilit = path.join(__dirname, '../data/facilitinfo.md');
    facilitInfoMarkdown = fs.readFileSync(filePathFacilit, 'utf8'); //vai ler o md como string

    const filePathDB = path.join(__dirname, '../data/db.json');
    const dataDB = fs.readFileSync(filePathDB, 'utf8');
    db = JSON.parse(dataDB);
}

async function responderPergunta(pergunta) {

    // contexto para o prompt da OpenAI
    const prompt = `Você é um assistente de IA para gerenciamento de projetos da Facilit Tecnologia, especializado no sistema Target para gestores públicos.
     Você deve responder apenas com base nas informações fornecidas abaixo. **Não busque informações externas**. Caso a pergunta não tenha relação com os dados fornecidos, apenas diga educadamente que essa não é a sua função.
     Você deve responder de forma concisa, evitando respostas longas. Se sua resposta exceder 100 caracteres, resuma-a de maneira que ainda seja útil, clara e objetiva. 
     Não corte a resposta abruptamente.

    Informações sobre a Facilit Tecnologia:
    ${facilitInfoMarkdown} 

    Informações sobre o projeto Chatbot Target:
    O projeto "Chatbot Target" visa desenvolver uma solução baseada em inteligência artificial que permitirá aos gestores públicos interagir com o sistema Target por meio de um robô conversacional, capaz de fornecer resumos, listas, gráficos e informações detalhadas sobre a gestão de projetos governamentais de maneira rápida e eficiente.  

    Aqui está a estrutura do banco de dados com informações sobre os projetos (que você pode usar para responder perguntas relacionadas ao Target, se aplicável):
    ${JSON.stringify(db, null, 2)}

    Responda à seguinte pergunta com base nos dados fornecidos, de forma concisa e útil para o usuário.  Leve em consideração o contexto do projeto Chatbot Target e o público-alvo (gestores públicos). Se a pergunta não estiver relacionada aos dados fornecidos, à Facilit Tecnologia, ou ao sistema Target, responda de forma geral como um assistente de gerenciamento de projetos, mas sempre com foco na gestão pública. Tente manter a conversa o mais natural possível:

    ${pergunta}`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100,
        });

        // substitui '\n' pela quebra de linha HTML '<br>' pra poder pular linha
        let response = completion.choices[0].message.content.trim();
        response = response.replace(/\n/g, '<br>'); 

        return response;
    } catch (error) {
        console.error("Erro na OpenAI:", error);
        return "Desculpe, tive um problema ao processar sua pergunta. Por favor, tente novamente mais tarde.";
    }
}

module.exports = { responderPergunta, carregarDados };
