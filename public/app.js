const socket = io();
const $ = id => document.getElementById(id);
const entry = $('entry'), lobby = $('lobby'), game = $('game');
let myId = null, roomState = null, currentQuestion = null, selectedChoice = null, toastTimer = null;
const TIPS = [
  'Saber, Querer e Agir: três ideias para transformar o mundo.',
  'A Rosa dos Ventos recorda-te que cada escolha define um rumo.',
  'Uma gota junta-se a outras e pode tornar-se uma torrente.',
  'A Machada lembra que as ideias também precisam de ação.',
  'O Icthus é um símbolo de fé usado pelos primeiros cristãos.'
];
function showScreen(which) {
  entry.classList.toggle('hidden', which !== 'entry');
  lobby.classList.toggle('hidden', which !== 'lobby');
  game.classList.toggle('hidden', which !== 'game');
}
function playerName() { return $('playerName').value.trim(); }
function enterRoom(action) {
  $('entryError').textContent = '';
  const name = playerName();
  if (!name) { $('entryError').textContent = 'Escreve o teu nome para continuar.'; $('playerName').focus(); return; }
  if (action === 'create') socket.emit('createRoom', { name });
  else socket.emit('joinRoom', { name, code: $('roomCode').value.trim().toUpperCase() });
}
$('createBtn').addEventListener('click', () => enterRoom('create'));
$('joinBtn').addEventListener('click', () => enterRoom('join'));
$('playerName').addEventListener('keydown', e => { if (e.key === 'Enter') enterRoom('create'); });
$('roomCode').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5); });
$('roomCode').addEventListener('keydown', e => { if (e.key === 'Enter') enterRoom('join'); });
$('startBtn').addEventListener('click', () => socket.emit('startGame'));
$('copyCode').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('lobbyCode').textContent); $('copyCode').textContent = '✓'; setTimeout(() => $('copyCode').textContent = '⧉', 1300); }
  catch { $('copyCode').textContent = $('lobbyCode').textContent; }
});
$('rollBtn').addEventListener('click', () => { $('rollBtn').disabled = true; socket.emit('roll'); });
$('submitAnswer').addEventListener('click', () => {
  if (selectedChoice === null) return;
  $('submitAnswer').disabled = true;
  document.querySelectorAll('.answer-option').forEach(b => b.disabled = true);
  socket.emit('answer', { choice: selectedChoice });
  $('questionModal').classList.add('hidden');
});
$('leaveLobby').addEventListener('click', leaveRoom);
$('leaveGame').addEventListener('click', leaveRoom);
$('backToEntry').addEventListener('click', () => { $('winnerModal').classList.add('hidden'); leaveRoom(); });
function leaveRoom() {
  socket.emit('leaveRoom');
  myId = null; roomState = null; currentQuestion = null;
  $('questionModal').classList.add('hidden'); $('winnerModal').classList.add('hidden');
  showScreen('entry');
}
socket.on('joinedRoom', data => {
  myId = data.playerId;
  $('lobbyCode').textContent = data.code;
  $('gameCode').textContent = data.code;
  showScreen('lobby');
});
socket.on('notice', message => {
  if (!lobby.classList.contains('hidden')) showToastMessage(message);
  else $('entryError').textContent = message;
});
socket.on('roomState', state => {
  roomState = state;
  $('lobbyCode').textContent = state.code;
  $('gameCode').textContent = state.code;
  if (!state.started) { showScreen('lobby'); renderLobby(state); }
  else { showScreen('game'); renderGame(state); }
});
socket.on('questionAsked', data => {
  if (data.playerId !== myId) {
    $('rollBtn').disabled = true;
    $('rollHint').textContent = `${data.playerName} está a responder a uma pergunta…`;
  }
});
socket.on('question', question => {
  currentQuestion = question; selectedChoice = null;
  $('diceResult').textContent = `🎲 ${question.dice}`;
  $('questionCategory').textContent = question.category.toUpperCase() + ' DOS PIONEIROS';
  $('questionTitle').textContent = question.q;
  $('answerOptions').innerHTML = '';
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'answer-option';
    const letter = document.createElement('span'); letter.className = 'letter'; letter.textContent = String.fromCharCode(65 + index);
    const text = document.createElement('span'); text.textContent = option;
    button.append(letter, text);
    button.addEventListener('click', () => {
      selectedChoice = index;
      document.querySelectorAll('.answer-option').forEach((el, i) => el.classList.toggle('selected', i === index));
      $('submitAnswer').disabled = false;
    });
    $('answerOptions').append(button);
  });
  $('submitAnswer').disabled = true;
  $('questionModal').classList.remove('hidden');
});
socket.on('answerResult', result => {
  const toast = $('resultToast');
  toast.classList.remove('hidden', 'wrong');
  if (result.correct) {
    $('resultIcon').textContent = '✓';
    $('resultTitle').textContent = result.finished ? 'Chegaste à meta!' : result.movement?.kind === 'ladder' ? 'Subiste a escada!' : 'Resposta certa!';
    let movementText = result.movement ? `Avançaste ${result.dice} casas.` : '';
    if (result.movement?.kind === 'ladder') movementText += ` E subiste até à casa ${result.movement.to}!`;
    if (result.movement?.kind === 'snake') movementText += ` Atenção: desceste até à casa ${result.movement.to}.`;
    $('resultText').textContent = `${movementText} ${result.explanation}`;
  } else {
    toast.classList.add('wrong');
    $('resultIcon').textContent = '×';
    $('resultTitle').textContent = 'Não foi desta vez!';
    $('resultText').textContent = `Ficaste no mesmo sítio. ${result.explanation}`;
  }
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.add('hidden'), 2300);
});
socket.on('gameMessage', message => showToastMessage(message));
socket.on('gameOver', data => {
  $('winnerName').textContent = data.winner;
  $('winnerModal').classList.remove('hidden');
});
function showToastMessage(message) {
  const toast = $('resultToast'); toast.classList.remove('hidden', 'wrong');
  $('resultIcon').textContent = '✦'; $('resultTitle').textContent = 'Atenção, equipa!'; $('resultText').textContent = message;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.add('hidden'), 2600);
}
function renderLobby(state) {
  const players = $('lobbyPlayers'); players.innerHTML = '';
  state.players.forEach(player => {
    const row = document.createElement('div'); row.className = 'player-entry';
    const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.style.background = player.color; avatar.textContent = player.name.slice(0, 1).toUpperCase();
    const info = document.createElement('div');
    const name = document.createElement('strong'); name.textContent = player.name + (player.id === myId ? ' (tu)' : '');
    const role = document.createElement('small'); role.textContent = player.id === state.hostId ? 'ANFITRIÃO' : player.connected ? 'PRONTO PARA JOGAR' : 'DESLIGADO';
    info.append(name, role); row.append(avatar, info); players.append(row);
  });
  $('playerCount').textContent = `${state.players.filter(p => p.connected).length} / 8`;
  const isHost = state.hostId === myId;
  $('hostControls').classList.toggle('hidden', !isHost);
  $('waitingHost').classList.toggle('hidden', isHost);
  $('startBtn').disabled = state.players.filter(p => p.connected).length < 2;
}
function renderGame(state) {
  const board = $('board'); board.innerHTML = '';
  // A casa 1 começa no canto inferior esquerdo; o percurso alterna de direção.
  for (let n = 1; n <= 50; n++) {
    const rowFromBottom = Math.floor((n - 1) / 10);
    const offset = (n - 1) % 10;
    const col = rowFromBottom % 2 === 0 ? offset + 1 : 10 - offset;
    const row = 5 - rowFromBottom;
    const cell = document.createElement('div'); cell.className = 'cell' + (n === 50 ? ' finish' : '');
    cell.style.gridColumn = String(col); cell.style.gridRow = String(row);
    const number = document.createElement('span'); number.className = 'cell-num'; number.textContent = n;
    cell.append(number);
    if (state.ladders[n]) { const mark = document.createElement('span'); mark.className = 'cell-mark ladder'; mark.textContent = '↗'; cell.append(mark); }
    if (state.snakes[n]) { const mark = document.createElement('span'); mark.className = 'cell-mark snake'; mark.textContent = '↘'; cell.append(mark); }
    if (n === 50) { const mark = document.createElement('span'); mark.className = 'cell-mark'; mark.textContent = '★'; cell.append(mark); }
    const tokens = document.createElement('div'); tokens.className = 'tokens';
    state.players.filter(p => p.position === n).forEach(p => {
      const token = document.createElement('span'); token.className = 'token'; token.style.background = p.color; token.textContent = p.name.slice(0, 1).toUpperCase(); token.title = p.name; tokens.append(token);
    });
    cell.append(tokens); board.append(cell);
  }
  const current = state.players[state.currentTurn];
  const isMyTurn = current && current.id === myId;
  const phaseWaiting = state.phase === 'waiting';
  $('turnStatus').innerHTML = state.finished ? 'FINALIZADO' : `<i></i> ${phaseWaiting ? 'À ESPERA' : state.phase === 'feedback' ? 'A VALIDAR' : 'EM JOGO'}`;
  const currentContainer = $('currentPlayer'); currentContainer.innerHTML = '';
  const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.style.background = current?.color || '#799096'; avatar.textContent = current?.name?.slice(0, 1).toUpperCase() || '?';
  const info = document.createElement('div'); const strong = document.createElement('strong'); strong.textContent = current?.name || 'À espera…'; const small = document.createElement('small'); small.textContent = isMyTurn ? 'É a tua vez de jogar' : 'Está a jogar agora'; info.append(strong, small); currentContainer.append(avatar, info);
  $('rollArea').classList.toggle('hidden', !isMyTurn || state.finished);
  $('watchingArea').classList.toggle('hidden', isMyTurn || state.finished);
  $('rollBtn').disabled = !(isMyTurn && phaseWaiting);
  $('rollHint').textContent = isMyTurn ? (phaseWaiting ? 'Acerta na pergunta para avançar.' : 'A tua resposta está a ser validada…') : 'A aguardar a tua vez.';
  const score = $('scoreList'); score.innerHTML = '';
  [...state.players].sort((a,b) => b.position - a.position).forEach((p, index) => {
    const row = document.createElement('div'); row.className = 'score-row';
    const rank = document.createElement('span'); rank.className = 'score-rank'; rank.textContent = String(index + 1).padStart(2, '0');
    const nameWrap = document.createElement('div'); const name = document.createElement('div'); name.className = 'score-name'; name.textContent = p.name + (p.id === myId ? ' (tu)' : '');
    const bar = document.createElement('div'); bar.className = 'score-progress'; const fill = document.createElement('span'); fill.style.width = `${Math.max(0, Math.min(100, p.position * 2))}%`; fill.style.background = p.color; bar.append(fill); nameWrap.append(name, bar);
    const number = document.createElement('span'); number.className = 'score-number'; number.textContent = `${p.position}/50`;
    row.append(rank, nameWrap, number); score.append(row);
  });
  $('tipText').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
}
