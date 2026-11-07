# Desafio Pioneiro — Sobe e Desce multijogador

Jogo web multijogador para 2 a 8 participantes, com salas por código. A cada jogada, o participante lança o dado e recebe uma pergunta sobre a Mística e a Simbologia dos Pioneiros. Só avança se acertar.

## Executar no computador

1. Instala o [Node.js 18 ou superior](https://nodejs.org/).
2. Abre a pasta `desafio-pioneiro` num terminal.
3. Executa `npm install`.
4. Executa `npm start`.
5. Abre `http://localhost:3000` no navegador.
6. Cria uma sala e partilha o código com os restantes jogadores.

## Jogar na mesma rede Wi-Fi

O computador que executa o servidor e os telemóveis/computadores dos jogadores devem estar na mesma rede Wi-Fi. Nos outros dispositivos, abre `http://IP-DO-COMPUTADOR:3000` (substitui pelo endereço IP local do computador que está a alojar o jogo). Poderá ser necessário permitir o Node.js na firewall.

## Jogar à distância pela Internet

Para jogadores fora da mesma rede, publica esta pasta num serviço que aceite aplicações Node.js (por exemplo, Render, Railway ou outro alojamento Node). No Render, podes usar o ficheiro `render.yaml` incluído. Depois, todos entram pelo endereço público criado pelo alojamento. O servidor mantém as salas e sincroniza as jogadas em tempo real. As salas ficam na memória do servidor: se o serviço reiniciar, as partidas em curso são perdidas.

## Regras

- 2 a 8 jogadores por sala.
- O anfitrião inicia a partida quando estiverem pelo menos 2 jogadores.
- O jogador lança o dado e responde a uma pergunta de escolha múltipla.
- Resposta certa: avança o número indicado no dado.
- Resposta errada: fica na mesma casa.
- Ao cair numa escada, sobe; ao cair numa cobra, desce.
- A primeira pessoa a chegar à casa 50 vence.

## Editar perguntas

As perguntas e respostas estão no array `QUESTIONS`, no início de `server.js`. Cada pergunta tem:

- `category`: `Mística` ou `Símbolos`;
- `q`: texto da pergunta;
- `options`: quatro respostas possíveis;
- `a`: índice da resposta certa (começa em 0);
- `why`: explicação mostrada depois da resposta.

## Conteúdos de referência

As perguntas iniciais foram preparadas com base nestes materiais de Escutismo:

- Agrupamento 658, CNE — Mística e Simbologia: https://agr658.cne-escutismo.pt/pioneiros/mistica-e-simbologia.html
- Fé que se enTenda!, CNE — III Secção: https://fe.escutismo.pt/seccoes/terceira/

Confirma com os materiais do teu agrupamento se usam alguma formulação específica para a Mística ou para a Simbologia.
