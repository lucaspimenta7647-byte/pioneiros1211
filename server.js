const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true }));

const QUESTIONS = [
  { category: 'Mística', q: 'Qual é a ideia central da Mística da III Secção?', options: ['A descoberta da Terra Prometida', 'A Igreja em construção', 'A vida na selva', 'A caminhada de São Paulo'], a: 1, why: 'A Mística dos Pioneiros assenta na edificação da Igreja.' },
  { category: 'Mística', q: 'Na Mística dos Pioneiros, cada jovem é chamado a ser…', options: ['Uma pedra viva do Templo do Senhor', 'Um navegador solitário', 'Um chefe sem equipa', 'Um observador sem ação'], a: 0, why: 'O Pioneiro é chamado a assumir o seu lugar como pedra viva do Templo do Senhor.' },
  { category: 'Mística', q: 'Qual é o patrono dos Pioneiros?', options: ['São Tiago', 'São Paulo', 'São Pedro', 'São Francisco de Assis'], a: 2, why: 'O patrono da III Secção é São Pedro.' },
  { category: 'Mística', q: 'Qual é a máxima associada aos quatro símbolos dos Pioneiros?', options: ['Aprender, Partilhar e Servir', 'Saber, Querer e Agir', 'Ver, Julgar e Avaliar', 'Ajudar, Guiar e Ensinar'], a: 1, why: 'A simbologia dos Pioneiros relaciona-se com Saber, Querer e Agir.' },
  { category: 'Mística', q: 'O que procura construir o Pioneiro, colocando os seus talentos ao serviço dos outros?', options: ['Apenas o seu sucesso individual', 'Comunhão e sociedade', 'Uma competição entre equipas', 'Um caminho sem obstáculos'], a: 1, why: 'O Pioneiro é chamado a ser construtor de comunhão e da própria sociedade.' },
  { category: 'Mística', q: 'Que atitude caracteriza o Pioneiro perante o mundo que o rodeia?', options: ['Aceitar tudo sem questionar', 'Evitar mudanças', 'Procurar melhorar, inovar e construir', 'Trabalhar sempre sozinho'], a: 2, why: 'O Pioneiro procura fazer diferente, mudar, inovar e pôr mãos à obra.' },
  { category: 'Símbolos', q: 'Qual é o símbolo do rumo certo e da boa escolha?', options: ['Machada', 'Gota de Água', 'Icthus', 'Rosa dos Ventos'], a: 3, why: 'A Rosa dos Ventos representa o rumo certo, a boa escolha e a decisão ponderada.' },
  { category: 'Símbolos', q: 'O que representa a Gota de Água?', options: ['A pureza e a transparência', 'A força física', 'A velocidade', 'A orientação geográfica'], a: 0, why: 'A Gota de Água simboliza a pureza e a transparência do Pioneiro consigo próprio e com os outros.' },
  { category: 'Símbolos', q: 'A Machada está associada a que ideia?', options: ['À orientação', 'À construção e à ação', 'À pureza', 'À memória'], a: 1, why: 'A Machada representa a construção, a ação e a capacidade de transformar ideias em realidade.' },
  { category: 'Símbolos', q: 'O que simboliza o Icthus (peixe)?', options: ['A natureza', 'A comunidade marítima', 'Jesus Cristo', 'A chegada à Terra Prometida'], a: 2, why: 'O Icthus é o peixe que simboliza Jesus Cristo e foi usado pelos primeiros cristãos.' },
  { category: 'Símbolos', q: 'Qual dos símbolos está mais ligado ao SABER?', options: ['Gota de Água', 'Rosa dos Ventos', 'Machada', 'Icthus'], a: 0, why: 'A Gota de Água destaca o SABER e a individualidade do Pioneiro.' },
  { category: 'Símbolos', q: 'Qual dos símbolos destaca o QUERER?', options: ['Icthus', 'Machada', 'Rosa dos Ventos', 'Gota de Água'], a: 2, why: 'A Rosa dos Ventos relaciona-se com o QUERER, a vontade e a escolha.' },
  { category: 'Símbolos', q: 'Qual dos símbolos destaca o AGIR?', options: ['Machada', 'Gota de Água', 'Icthus', 'Rosa dos Ventos'], a: 0, why: 'A Machada representa o AGIR: transformar o que se sonha em realização.' },
  { category: 'Símbolos', q: 'O Icthus foi usado pelos primeiros cristãos como…', options: ['Um mapa de viagem', 'Um sinal de identificação entre cristãos', 'Um símbolo de riqueza', 'Uma ferramenta de construção'], a: 1, why: 'O peixe foi adotado como sinal de identificação mútua entre os primeiros cristãos.' },
  { category: 'Símbolos', q: 'A Rosa dos Ventos lembra ao Pioneiro que deve…', options: ['Escolher sem pensar', 'Evitar tomar decisões', 'Ponderar as escolhas e o rumo', 'Seguir sempre os outros'], a: 2, why: 'A Rosa dos Ventos recorda a importância de escolher e ponderar o caminho.' },
  { category: 'Símbolos', q: 'A Gota de Água também lembra que o Pioneiro deve…', options: ['Ser transparente consigo e com os outros', 'Guardar tudo para si', 'Trabalhar sem ninguém', 'Evitar fazer parte de um grupo'], a: 0, why: 'A transparência e a capacidade de se juntar aos outros são ideias ligadas à Gota de Água.' },
  { category: 'Símbolos', q: 'Qual é a tradução da palavra grega “Icthus” neste contexto?', options: ['Pão', 'Caminho', 'Peixe', 'Pedra'], a: 2, why: 'Icthus significa peixe em grego.' },
  { category: 'Mística', q: 'Segundo a Mística, os talentos do Pioneiro devem ser colocados…', options: ['Ao serviço da comunidade', 'Apenas ao serviço próprio', 'Em competição com os outros', 'De lado quando há dificuldades'], a: 0, why: 'O Pioneiro coloca os seus talentos ao serviço da comunidade.' },
  { category: 'Mística', q: 'O Pioneiro prefere transformar o mundo…', options: ['Sem ouvir ninguém', 'Em equipa e em conjunto', 'Esperando que os outros façam tudo', 'Sem planear'], a: 1, why: 'A vontade do Pioneiro e a dos outros, em equipa, permite transformar e construir.' },
  { category: 'Símbolos', q: 'Que símbolo representa a capacidade e a energia transformadora do Pioneiro?', options: ['Rosa dos Ventos', 'Icthus', 'Machada', 'Gota de Água'], a: 2, why: 'A Machada simboliza o potencial, as capacidades e a energia transformadora.' },
  { category: 'Mística', q: 'A Mística da III Secção dá continuidade à Nova e Eterna Aliança estabelecida por…', options: ['Moisés', 'Cristo', 'São Paulo', 'Baden-Powell'], a: 1, why: 'A Mística assenta na edificação da Igreja, dando continuidade à Aliança estabelecida por Cristo.' },
  { category: 'Símbolos', q: 'Que símbolo está associado à decisão ponderada?', options: ['Rosa dos Ventos', 'Machada', 'Gota de Água', 'Icthus'], a: 0, why: 'A decisão ponderada é uma das ideias centrais da Rosa dos Ventos.' },
  { category: 'Mística', q: 'O Pioneiro deve procurar conhecer as suas capacidades e…', options: ['Evitar aprender técnicas novas', 'Adquirir as ferramentas de que precisa', 'Fazer tudo sem ajuda', 'Desistir perante os obstáculos'], a: 1, why: 'O Pioneiro procura conhecer e melhorar as capacidades e adquirir ferramentas para concretizar os seus projetos.' },
  { category: 'Símbolos', q: 'Quais são os quatro símbolos principais dos Pioneiros?', options: ['Flor de Lis, Vara, Chapéu e Cantil', 'Gota de Água, Rosa dos Ventos, Machada e Icthus', 'Pão, Tenda, Fogo e Evangelho', 'Bússola, Mochila, Corda e Tenda'], a: 1, why: 'Os quatro símbolos são a Gota de Água, a Rosa dos Ventos, a Machada e o Icthus.' }
];

const rooms = new Map();
const LADDERS = { 3: 11, 8: 16, 14: 25, 21: 32, 28: 39, 36: 46 };
const SNAKES = { 17: 6, 31: 19, 42: 30, 47: 35, 49: 27 };
const COLORS = ['#e06b42', '#2585a6', '#7b65b3', '#2b966f', '#c18a29', '#c05d83', '#687b88', '#799b41'];

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''); }
  while (rooms.has(code));
  return code;
}
function cleanName(value) {
  return String(value || '').trim().replace(/[<>]/g, '').slice(0, 16);
}
function publicQuestion(question) {
  return { category: question.category, q: question.q, options: question.options };
}
function nextConnectedIndex(room, fromIndex) {
  for (let offset = 1; offset <= room.players.length; offset++) {
    const idx = (fromIndex + offset) % room.players.length;
    if (room.players[idx] && room.players[idx].connected) return idx;
  }
  return -1;
}
function publicRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    started: room.started,
    finished: room.finished,
    phase: room.phase,
    currentTurn: room.currentTurn,
    players: room.players.map(p => ({ id: p.id, name: p.name, position: p.position, connected: p.connected, color: p.color })),
    ladders: LADDERS,
    snakes: SNAKES,
    winnerId: room.winnerId || null
  };
}
function broadcast(room) {
  io.to(room.code).emit('roomState', publicRoom(room));
}
function getRoomFor(socket) {
  const code = socket.data.roomCode;
  return code ? rooms.get(code) : null;
}
function startRoom(room) {
  room.started = true;
  room.finished = false;
  room.phase = 'waiting';
  room.currentTurn = room.players.findIndex(p => p.connected);
  room.players.forEach(p => p.position = 0);
  room.winnerId = null;
  broadcast(room);
}

io.on('connection', socket => {
  socket.on('createRoom', ({ name } = {}) => {
    const playerName = cleanName(name);
    if (!playerName) return socket.emit('notice', 'Escreve o teu nome primeiro.');
    if (socket.data.roomCode) return socket.emit('notice', 'Já estás numa sala.');
    const code = makeCode();
    const player = { id: socket.id, name: playerName, position: 0, connected: true, color: COLORS[0] };
    const room = { code, hostId: socket.id, players: [player], started: false, finished: false, phase: 'waiting', currentTurn: 0, pending: null, winnerId: null };
    rooms.set(code, room);
    socket.data.roomCode = code;
    socket.join(code);
    socket.emit('joinedRoom', { code, playerId: socket.id });
    broadcast(room);
  });

  socket.on('joinRoom', ({ name, code } = {}) => {
    const playerName = cleanName(name);
    const roomCode = String(code || '').trim().toUpperCase();
    const room = rooms.get(roomCode);
    if (!playerName) return socket.emit('notice', 'Escreve o teu nome primeiro.');
    if (!room) return socket.emit('notice', 'Não encontrei essa sala. Confirma o código.');
    if (socket.data.roomCode) return socket.emit('notice', 'Já estás numa sala.');
    if (room.started && !room.players.some(p => !p.connected && p.name.toLowerCase() === playerName.toLowerCase())) return socket.emit('notice', 'Esta partida já começou. Só podes entrar antes do início.');
    let player = room.players.find(p => !p.connected && p.name.toLowerCase() === playerName.toLowerCase());
    if (player) {
      player.id = socket.id;
      player.connected = true;
    } else {
      if (room.players.length >= 8) return socket.emit('notice', 'A sala já tem o máximo de 8 jogadores.');
      player = { id: socket.id, name: playerName, position: 0, connected: true, color: COLORS[room.players.length % COLORS.length] };
      room.players.push(player);
    }
    socket.data.roomCode = roomCode;
    socket.join(roomCode);
    if (!room.hostId || !room.players.some(p => p.id === room.hostId && p.connected)) room.hostId = socket.id;
    socket.emit('joinedRoom', { code: roomCode, playerId: socket.id });
    broadcast(room);
  });

  socket.on('startGame', () => {
    const room = getRoomFor(socket);
    if (!room) return;
    if (socket.id !== room.hostId) return socket.emit('notice', 'Só quem criou a sala pode iniciar.');
    if (room.players.filter(p => p.connected).length < 2) return socket.emit('notice', 'São precisos pelo menos 2 jogadores.');
    if (room.started && !room.finished) return;
    startRoom(room);
    io.to(room.code).emit('gameMessage', 'A partida começou. Boa sorte!');
  });

  socket.on('roll', () => {
    const room = getRoomFor(socket);
    if (!room || !room.started || room.finished || room.phase !== 'waiting') return;
    const player = room.players[room.currentTurn];
    if (!player || player.id !== socket.id) return socket.emit('notice', 'Ainda não é a tua vez.');
    const dice = 1 + Math.floor(Math.random() * 6);
    const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    room.pending = { playerId: socket.id, dice, question };
    room.phase = 'question';
    io.to(room.code).emit('questionAsked', { playerId: socket.id, playerName: player.name, dice });
    socket.emit('question', { ...publicQuestion(question), dice });
    broadcast(room);
  });

  socket.on('answer', ({ choice } = {}) => {
    const room = getRoomFor(socket);
    if (!room || room.phase !== 'question' || !room.pending || room.pending.playerId !== socket.id) return;
    const question = room.pending.question;
    const correct = Number(choice) === question.a;
    const player = room.players.find(p => p.id === socket.id);
    const dice = room.pending.dice;
    let movement = null;
    if (correct) {
      const before = player.position;
      player.position = Math.min(50, player.position + dice);
      movement = { from: before, to: player.position, kind: 'normal' };
      if (LADDERS[player.position]) {
        const from = player.position;
        player.position = LADDERS[from];
        movement = { from, to: player.position, kind: 'ladder' };
      } else if (SNAKES[player.position]) {
        const from = player.position;
        player.position = SNAKES[from];
        movement = { from, to: player.position, kind: 'snake' };
      }
      if (player.position >= 50) {
        room.finished = true;
        room.winnerId = player.id;
      }
    }
    room.pending = null;
    room.phase = 'feedback';
    io.to(room.code).emit('answerResult', {
      playerId: player.id,
      playerName: player.name,
      correct,
      correctIndex: question.a,
      explanation: question.why,
      dice,
      movement,
      finished: room.finished
    });
    broadcast(room);
    const code = room.code;
    setTimeout(() => {
      const latest = rooms.get(code);
      if (!latest || latest.phase !== 'feedback') return;
      if (!latest.finished) {
        const idx = latest.players.findIndex(p => p.id === player.id);
        const next = nextConnectedIndex(latest, idx);
        if (next >= 0) latest.currentTurn = next;
      }
      latest.phase = 'waiting';
      broadcast(latest);
      if (latest.finished) io.to(code).emit('gameOver', { winner: player.name });
    }, 2400);
  });

  function detachPlayer(room) {
    const index = room.players.findIndex(p => p.id === socket.id);
    const player = room.players[index];
    if (player) player.connected = false;
    if (room.hostId === socket.id) {
      const nextHost = room.players.find(p => p.connected);
      room.hostId = nextHost ? nextHost.id : null;
    }
    // Evita que a partida fique bloqueada se alguém sair durante uma pergunta.
    if (room.pending?.playerId === socket.id) {
      room.pending = null;
      room.phase = 'waiting';
      const next = nextConnectedIndex(room, index);
      if (next >= 0) room.currentTurn = next;
    } else if (room.started && !room.finished && room.phase === 'waiting' && room.players[room.currentTurn]?.id === socket.id) {
      const next = nextConnectedIndex(room, index);
      if (next >= 0) room.currentTurn = next;
    }
    if (room.players.every(p => !p.connected)) rooms.delete(room.code);
    else broadcast(room);
  }

  socket.on('leaveRoom', () => {
    const room = getRoomFor(socket);
    if (!room) return;
    detachPlayer(room);
    socket.leave(room.code);
    socket.data.roomCode = null;
  });

  socket.on('disconnect', () => {
    const room = getRoomFor(socket);
    if (!room) return;
    detachPlayer(room);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Desafio Pioneiro disponível em http://localhost:${PORT}`);
});
