const telaMenu = document.getElementById('tela-menu');
    const telaModos = document.getElementById('tela-modos');
    const telaFim = document.getElementById('tela-fim');
    const telaSkins = document.getElementById('tela-skins');
    const areaJogo = document.getElementById('area-jogo');
    const tabuleiroElem = document.getElementById('tabuleiro');
    const tituloFim = document.getElementById('titulo-fim');
    const mensagemFim = document.getElementById('mensagem-fim');

    // Skins
    let skinTabuleiro = 1;
    let skinPeca = 1;
    tabuleiroElem.classList.add('skin-tab-1');
    areaJogo.classList.add('skin-peca-1');

    const timerBrancasElem = document.getElementById('timer-brancas');
    const timerPretasElem = document.getElementById('timer-pretas');
    const tempoBrancasElem = document.getElementById('tempo-brancas');
    const tempoPretasElem = document.getElementById('tempo-pretas');

    let modoJogo = 'pvp';
    let tabuleiro = [];
    let jogadorAtual = 2; // 2 = brancas, 1 = pretas
    let pecaSelecionada = null;
    let animando = false;
    let deveCapturar = false;
    let jogoEncerrado = false;

    let tempoBrancas = 0;
    let tempoPretas = 0;
    let intervalTimer = null;

    // SVG da coroa
    const COROA_SVG = `
      <svg class="coroa" viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 14 L4 6 L8 10 L12 3 L16 10 L20 6 L22 14 Z" stroke-width="1.2" stroke-linejoin="round"/>
        <rect x="2" y="14" width="20" height="3" rx="1"/>
      </svg>
    `;

    // ==================== SONS REALISTAS ====================
    // Biblioteca de sons do Google (Actions on Google Sound Library)
    const BIBLIOTECA_SONS = {
      click:    'https://actions.google.com/sounds/v1/ui/button_click.ogg',
      move:     'https://actions.google.com/sounds/v1/cartoon/woodblock_hit.ogg',
      captura:  'https://actions.google.com/sounds/v1/sports/pool_table_ball_drops_in_pocket.ogg',
      promo:    'https://actions.google.com/sounds/v1/cartoon/xylophone_tip_toe_scale_up.ogg',
      vitoria:  'https://actions.google.com/sounds/v1/cartoon/clown_horn.ogg'
    };

    // Volumes individuais para cada tipo de som
    const VOLUME_SONS = {
      click: 0.6,
      move: 0.7,
      captura: 0.85,
      promo: 0.8,
      vitoria: 0.9
    };

    // Pré-carrega e mantém em cache um <audio> por tipo de som
    const CACHE_AUDIO = {};

    function getSomCache(tipo) {
      if (!CACHE_AUDIO[tipo]) {
        const audio = new Audio(BIBLIOTECA_SONS[tipo]);
        audio.preload = 'auto';
        audio.volume = VOLUME_SONS[tipo] ?? 0.8;
        CACHE_AUDIO[tipo] = audio;
      }
      return CACHE_AUDIO[tipo];
    }

    function tocarSom(tipo) {
      try {
        const base = getSomCache(tipo);
        // Clona o elemento para permitir sobreposição de sons tocados rapidamente
        const instancia = base.cloneNode();
        instancia.volume = base.volume;
        instancia.play().catch(() => {});
      } catch (e) {}
    }

    // ==================== NAVEGAÇÃO ====================
    function abrirSelecaoModo() {
      tocarSom('click');
      telaMenu.classList.add('escondido');
      telaModos.classList.remove('escondido');
    }

    function entrarTelaCheia() {
      alternarTelaCheia();
    }

    // ==================== BOTÃO FULL SCREEN (CANTO SUPERIOR DIREITO) ====================
    const btnFullscreen = document.getElementById('fullscreen-btn');

    function atualizarTextoFullscreen() {
      if (!btnFullscreen) return;
      btnFullscreen.textContent = document.fullscreenElement
        ? '✖ Sair da Tela Cheia'
        : '⛶ Tela Cheia';
    }

    function alternarTelaCheia() {
      tocarSom('click');
      const el = document.documentElement;
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      }
    }

    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', alternarTelaCheia);
    }

    document.addEventListener('fullscreenchange', atualizarTextoFullscreen);
    document.addEventListener('webkitfullscreenchange', atualizarTextoFullscreen);
    document.addEventListener('msfullscreenchange', atualizarTextoFullscreen);

    function voltarAoMenuInicial() {
      tocarSom('click');
      pararTemporizador();
      areaJogo.classList.add('escondido');
      telaModos.classList.add('escondido');
      telaFim.classList.add('escondido');
      telaMenu.classList.remove('escondido');
      jogoEncerrado = false;
    }

    function selecionarModo(modo) {
      tocarSom('click');
      modoJogo = modo;
      telaModos.classList.add('escondido');
      areaJogo.classList.remove('escondido');
      reiniciarPartida();
    }

    function abrirSkins() {
      tocarSom('click');
      telaSkins.classList.remove('escondido');
    }

    function fecharSkins() {
      tocarSom('click');
      telaSkins.classList.add('escondido');
    }

    function escolherSkinTab(n) {
      tocarSom('click');
      tabuleiroElem.classList.remove('skin-tab-1','skin-tab-2','skin-tab-3','skin-tab-4','skin-tab-5');
      tabuleiroElem.classList.add('skin-tab-' + n);
      skinTabuleiro = n;
      document.querySelectorAll('#grid-tabuleiro .skin-opcao').forEach(el => {
        el.classList.toggle('ativa', +el.dataset.skin === n);
      });
    }

    function escolherSkinPeca(n) {
      tocarSom('click');
      areaJogo.classList.remove('skin-peca-1','skin-peca-2','skin-peca-3','skin-peca-4','skin-peca-5');
      areaJogo.classList.add('skin-peca-' + n);
      skinPeca = n;
      document.querySelectorAll('#grid-pecas .skin-opcao').forEach(el => {
        el.classList.toggle('ativa', +el.dataset.skin === n);
      });
      renderizarTabuleiro();
    }

    // ==================== ESTADO DO JOGO ====================
    function iniciarEstado() {
      tabuleiro = [
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0]
      ];
      jogadorAtual = 2;
      pecaSelecionada = null;
      animando = false;
      deveCapturar = false;
      jogoEncerrado = false;

      tempoBrancas = 0;
      tempoPretas = 0;
      atualizarDisplayRelogio();
      iniciarTemporizador();
      verificarCapturaObrigatoria();
      renderizarTabuleiro();
    }

    function reiniciarPartida() {
      telaFim.classList.add('escondido');
      iniciarEstado();
    }

    // ==================== TIMERS ====================
    function iniciarTemporizador() {
      pararTemporizador();
      intervalTimer = setInterval(() => {
        if (jogoEncerrado) return;
        if (jogadorAtual === 2) tempoBrancas++;
        else tempoPretas++;
        atualizarDisplayRelogio();
      }, 1000);
    }

    function pararTemporizador() {
      if (intervalTimer) clearInterval(intervalTimer);
    }

    function formatarTempo(segundos) {
      const min = Math.floor(segundos / 60).toString().padStart(2, '0');
      const seg = (segundos % 60).toString().padStart(2, '0');
      return `${min}:${seg}`;
    }

    function atualizarDisplayRelogio() {
      tempoBrancasElem.textContent = formatarTempo(tempoBrancas);
      tempoPretasElem.textContent = formatarTempo(tempoPretas);

      if (jogadorAtual === 2) {
        timerBrancasElem.classList.add('ativo');
        timerPretasElem.classList.remove('ativo');
      } else {
        timerPretasElem.classList.add('ativo');
        timerBrancasElem.classList.remove('ativo');
      }
    }

    // ==================== RENDER ====================
    function renderizarTabuleiro() {
      tabuleiroElem.innerHTML = '';
      for (let l = 0; l < 8; l++) {
        for (let c = 0; c < 8; c++) {
          const casa = document.createElement('div');
          casa.classList.add('casa', (l + c) % 2 === 0 ? 'clara' : 'escura');
          casa.dataset.l = l;
          casa.dataset.c = c;

          const valor = tabuleiro[l][c];

          if (pecaSelecionada) {
            const mov = pecaSelecionada.movimentosValidos.find(m => m.l === l && m.c === c);
            if (mov) {
              casa.classList.add(mov.captura ? 'destino-captura' : 'destino-valido');
              casa.addEventListener('click', () => { if (!animando) moverPeca(l, c); });
            } else {
              casa.addEventListener('click', () => { if (!animando) limparSelecao(); });
            }
          } else {
            casa.addEventListener('click', () => { if (!animando) limparSelecao(); });
          }

          if (valor !== 0) {
            const peca = document.createElement('div');
            peca.classList.add('peca');
            if (valor === 1 || valor === 11) peca.classList.add('peca-preta');
            if (valor === 2 || valor === 22) peca.classList.add('peca-branca');
            if (valor === 11 || valor === 22) {
              peca.classList.add('dama');
              peca.innerHTML = COROA_SVG;
            }

            if (pecaSelecionada && pecaSelecionada.linha === l && pecaSelecionada.coluna === c) {
              peca.classList.add('selecionada');
            }

            peca.addEventListener('click', (e) => {
              e.stopPropagation();
              if (animando || jogoEncerrado) return;
              if (modoJogo === 'pve' && jogadorAtual === 1) return;
              if (ehPecaDoJogadorAtual(valor)) selecionarPeca(l, c);
            });

            casa.appendChild(peca);
          }

          tabuleiroElem.appendChild(casa);
        }
      }
    }

    // ==================== LÓGICA ====================
    function ehPecaDoJogadorAtual(valor) {
      return (jogadorAtual === 2 && (valor === 2 || valor === 22)) ||
             (jogadorAtual === 1 && (valor === 1 || valor === 11));
    }

    function ehPecaInimiga(valor) {
      return (jogadorAtual === 2 && (valor === 1 || valor === 11)) ||
             (jogadorAtual === 1 && (valor === 2 || valor === 22));
    }

    function verificarCapturaObrigatoria() {
      deveCapturar = false;
      for (let l = 0; l < 8; l++) {
        for (let c = 0; c < 8; c++) {
          if (ehPecaDoJogadorAtual(tabuleiro[l][c])) {
            const movs = calcularMovimentosValidos(l, c, true);
            if (movs.length > 0) {
              deveCapturar = true;
              return;
            }
          }
        }
      }
    }

    function selecionarPeca(linha, coluna) {
      let movimentos = calcularMovimentosValidos(linha, coluna);

      if (deveCapturar) {
        movimentos = movimentos.filter(m => m.captura);
        if (movimentos.length === 0) return;
      }

      pecaSelecionada = { linha, coluna, movimentosValidos: movimentos };
      renderizarTabuleiro();
    }

    function limparSelecao() {
      pecaSelecionada = null;
      renderizarTabuleiro();
    }

    function calcularMovimentosValidos(l, c, soCapturas = false) {
      const valor = tabuleiro[l][c];
      const movimentos = [];
      const ehDama = valor === 11 || valor === 22;
      const direcoes = [
        { dl: -1, dc: -1 }, { dl: -1, dc: 1 },
        { dl: 1, dc: -1 }, { dl: 1, dc: 1 }
      ];

      if (ehDama) {
        // Dama voadora (estilo brasileiro)
        direcoes.forEach(({ dl, dc }) => {
          let capturou = null;
          for (let passo = 1; passo < 8; passo++) {
            const destL = l + dl * passo;
            const destC = c + dc * passo;
            if (destL < 0 || destL >= 8 || destC < 0 || destC >= 8) break;

            const conteudo = tabuleiro[destL][destC];

            if (conteudo === 0) {
              if (!soCapturas || capturou) {
                movimentos.push({
                  l: destL, c: destC,
                  captura: capturou ? { ...capturou } : null
                });
              }
              if (capturou) break;
            } else if (ehPecaDoJogadorAtual(conteudo)) {
              break;
            } else {
              if (capturou) break;
              capturou = { l: destL, c: destC };
            }
          }
        });
      } else {
        // Peça normal - SÓ PARA FRENTE
        const direcoesPermitidas = valor === 2
          ? [{ dl: -1, dc: -1 }, { dl: -1, dc: 1 }]
          : [{ dl: 1, dc: -1 }, { dl: 1, dc: 1 }];

        if (!soCapturas) {
          direcoesPermitidas.forEach(({ dl, dc }) => {
            const destL = l + dl, destC = c + dc;
            if (destL >= 0 && destL < 8 && destC >= 0 && destC < 8 && tabuleiro[destL][destC] === 0) {
              movimentos.push({ l: destL, c: destC, captura: null });
            }
          });
        }

        // Capturas só para frente
        direcoesPermitidas.forEach(({ dl, dc }) => {
          const midL = l + dl, midC = c + dc;
          const destL = l + dl * 2, destC = c + dc * 2;

          if (destL >= 0 && destL < 8 && destC >= 0 && destC < 8 &&
              tabuleiro[destL][destC] === 0 &&
              ehPecaInimiga(tabuleiro[midL][midC])) {
            movimentos.push({
              l: destL, c: destC,
              captura: { l: midL, c: midC }
            });
          }
        });
      }

      return movimentos;
    }

    function animarMovimento(origL, origC, destL, destC, callback) {
      const casas = tabuleiroElem.querySelectorAll('.casa');
      const casaOrig = [...casas].find(c => +c.dataset.l === origL && +c.dataset.c === origC);
      const casaDest = [...casas].find(c => +c.dataset.l === destL && +c.dataset.c === destC);
      if (!casaOrig || !casaDest) { callback(); return; }

      const peca = casaOrig.querySelector('.peca');
      if (!peca) { callback(); return; }

      const rectOrig = casaOrig.getBoundingClientRect();
      const rectDest = casaDest.getBoundingClientRect();
      const rectTab = tabuleiroElem.getBoundingClientRect();
      const pecaSize = peca.offsetWidth || 52;
      const offset = (casaOrig.offsetWidth - pecaSize) / 2;

      const clone = peca.cloneNode(true);
      clone.classList.add('peca-animando');
      clone.style.left = (rectOrig.left - rectTab.left + offset) + 'px';
      clone.style.top  = (rectOrig.top  - rectTab.top  + offset) + 'px';
      clone.style.width = pecaSize + 'px';
      clone.style.height = pecaSize + 'px';

      peca.style.opacity = '0';
      tabuleiroElem.appendChild(clone);

      requestAnimationFrame(() => {
        clone.classList.add('pulando');
        const offsetDest = (casaDest.offsetWidth - pecaSize) / 2;
        clone.style.left = (rectDest.left - rectTab.left + offsetDest) + 'px';
        clone.style.top  = (rectDest.top  - rectTab.top  + offsetDest) + 'px';
      });

      setTimeout(() => {
        clone.classList.remove('pulando');
      }, 190);

      setTimeout(() => {
        clone.remove();
        callback();
      }, 400);
    }

    function moverPeca(destinoL, destinoC) {
      if (animando || !pecaSelecionada || jogoEncerrado) return;

      const { linha: origL, coluna: origC, movimentosValidos } = pecaSelecionada;
      const movimento = movimentosValidos.find(m => m.l === destinoL && m.c === destinoC);
      if (!movimento) return;

      animando = true;

      animarMovimento(origL, origC, destinoL, destinoC, () => {
        let valorPeca = tabuleiro[origL][origC];
        tabuleiro[destinoL][destinoC] = valorPeca;
        tabuleiro[origL][origC] = 0;

        let foiCaptura = false;
        if (movimento.captura) {
          tabuleiro[movimento.captura.l][movimento.captura.c] = 0;
          foiCaptura = true;
        }

        // Promoção
        let promoveu = false;
        if (valorPeca === 2 && destinoL === 0) {
          tabuleiro[destinoL][destinoC] = 22;
          valorPeca = 22;
          promoveu = true;
        }
        if (valorPeca === 1 && destinoL === 7) {
          tabuleiro[destinoL][destinoC] = 11;
          valorPeca = 11;
          promoveu = true;
        }

        // Sons
        if (promoveu) tocarSom('promo');
        else if (foiCaptura) tocarSom('captura');
        else tocarSom('move');

        // Multi-captura
        if (movimento.captura) {
          const maisCapturas = calcularMovimentosValidos(destinoL, destinoC, true);
          if (maisCapturas.length > 0) {
            pecaSelecionada = {
              linha: destinoL,
              coluna: destinoC,
              movimentosValidos: maisCapturas
            };
            animando = false;
            renderizarTabuleiro();

            // Se for a vez do robô, continua a multi-captura automaticamente
            if (modoJogo === 'pve' && jogadorAtual === 1) {
              setTimeout(() => {
                if (jogoEncerrado || !pecaSelecionada) return;
                // escolhe a melhor captura disponível (ou a primeira)
                const prox = pecaSelecionada.movimentosValidos[0];
                if (prox) moverPeca(prox.l, prox.c);
              }, 420);
            }
            return;
          }
        }

        // Troca de turno
        jogadorAtual = jogadorAtual === 2 ? 1 : 2;
        pecaSelecionada = null;

        verificarCapturaObrigatoria();
        atualizarDisplayRelogio();
        renderizarTabuleiro();

        // Animação de promoção
        if (promoveu) {
          const casas = tabuleiroElem.querySelectorAll('.casa');
          const casaPromo = [...casas].find(c => +c.dataset.l === destinoL && +c.dataset.c === destinoC);
          if (casaPromo) {
            const pecaEl = casaPromo.querySelector('.peca');
            if (pecaEl) {
              pecaEl.classList.add('promovendo');
              setTimeout(() => pecaEl.classList.remove('promovendo'), 900);
            }
          }
          // espera a animação de promoção antes de liberar
          setTimeout(() => {
            animando = false;
            if (verificarFimDeJogo()) return;
            if (modoJogo === 'pve' && jogadorAtual === 1) {
              setTimeout(jogadaRobo, 400);
            }
          }, 700);
          return;
        }

        animando = false;

        if (verificarFimDeJogo()) return;

        if (modoJogo === 'pve' && jogadorAtual === 1) {
          setTimeout(jogadaRobo, 450);
        }
      });
    }

    // ==================== IA MELHORADA (Minimax) ====================
    function avaliarTabuleiro() {
      let score = 0;
      for (let l = 0; l < 8; l++) {
        for (let c = 0; c < 8; c++) {
          const v = tabuleiro[l][c];
          if (v === 0) continue;

          let val = 0;
          if (v === 1) val = -100;
          else if (v === 2) val = 100;
          else if (v === 11) val = -280;
          else if (v === 22) val = 280;

          const centro = 3.5;
          const distCentro = Math.abs(l - centro) + Math.abs(c - centro);
          const bonusCentro = (7 - distCentro) * 3;

          if (v === 1 || v === 11) score -= bonusCentro;
          else score += bonusCentro;

          if (v === 1) score -= (l * 4);
          if (v === 2) score += ((7 - l) * 4);

          score += val;
        }
      }
      return score;
    }

    function gerarTodasJogadas(jogador) {
      const jogadas = [];
      const antigoJogador = jogadorAtual;
      jogadorAtual = jogador;

      verificarCapturaObrigatoria();
      const soCaptura = deveCapturar;

      for (let l = 0; l < 8; l++) {
        for (let c = 0; c < 8; c++) {
          const v = tabuleiro[l][c];
          const ehMinha = (jogador === 1 && (v === 1 || v === 11)) ||
                          (jogador === 2 && (v === 2 || v === 22));
          if (!ehMinha) continue;

          let movs = calcularMovimentosValidos(l, c);
          if (soCaptura) movs = movs.filter(m => m.captura);

          movs.forEach(m => {
            jogadas.push({
              origL: l, origC: c,
              destL: m.l, destC: m.c,
              captura: m.captura
            });
          });
        }
      }

      jogadorAtual = antigoJogador;
      return jogadas;
    }

    function fazerJogadaTemp(jogada) {
      const valor = tabuleiro[jogada.origL][jogada.origC];
      tabuleiro[jogada.destL][jogada.destC] = valor;
      tabuleiro[jogada.origL][jogada.origC] = 0;

      let capturado = null;
      if (jogada.captura) {
        capturado = tabuleiro[jogada.captura.l][jogada.captura.c];
        tabuleiro[jogada.captura.l][jogada.captura.c] = 0;
      }

      let promoveu = false;
      if (valor === 1 && jogada.destL === 7) {
        tabuleiro[jogada.destL][jogada.destC] = 11;
        promoveu = true;
      } else if (valor === 2 && jogada.destL === 0) {
        tabuleiro[jogada.destL][jogada.destC] = 22;
        promoveu = true;
      }

      return { valor, capturado, promoveu, capturaPos: jogada.captura };
    }

    function desfazerJogadaTemp(jogada, info) {
      tabuleiro[jogada.origL][jogada.origC] = info.valor;
      tabuleiro[jogada.destL][jogada.destC] = 0;
      if (info.capturaPos) {
        tabuleiro[info.capturaPos.l][info.capturaPos.c] = info.capturado;
      }
    }

    function minimax(profundidade, maximizando, alpha, beta) {
      if (profundidade === 0) {
        return avaliarTabuleiro();
      }

      const jogador = maximizando ? 2 : 1;
      const jogadas = gerarTodasJogadas(jogador);

      if (jogadas.length === 0) {
        return maximizando ? -99999 : 99999;
      }

      if (maximizando) {
        let maxEval = -Infinity;
        for (const j of jogadas) {
          const info = fazerJogadaTemp(j);
          const avaliacao = minimax(profundidade - 1, false, alpha, beta);
          desfazerJogadaTemp(j, info);
          maxEval = Math.max(maxEval, avaliacao);
          alpha = Math.max(alpha, avaliacao);
          if (beta <= alpha) break;
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (const j of jogadas) {
          const info = fazerJogadaTemp(j);
          const avaliacao = minimax(profundidade - 1, true, alpha, beta);
          desfazerJogadaTemp(j, info);
          minEval = Math.min(minEval, avaliacao);
          beta = Math.min(beta, avaliacao);
          if (beta <= alpha) break;
        }
        return minEval;
      }
    }

    function jogadaRobo() {
      if (animando || jogoEncerrado) return;

      const jogadas = gerarTodasJogadas(1);
      if (jogadas.length === 0) {
        verificarFimDeJogo();
        return;
      }

      let melhorJogada = null;
      let melhorScore = Infinity;

      const jogadasEmbaralhadas = [...jogadas].sort(() => Math.random() - 0.5);

      for (const j of jogadasEmbaralhadas) {
        const info = fazerJogadaTemp(j);
        const score = minimax(2, true, -Infinity, Infinity);
        desfazerJogadaTemp(j, info);

        if (score < melhorScore) {
          melhorScore = score;
          melhorJogada = j;
        }
      }

      if (!melhorJogada) melhorJogada = jogadas[0];

      pecaSelecionada = {
        linha: melhorJogada.origL,
        coluna: melhorJogada.origC,
        movimentosValidos: [{
          l: melhorJogada.destL,
          c: melhorJogada.destC,
          captura: melhorJogada.captura
        }]
      };

      moverPeca(melhorJogada.destL, melhorJogada.destC);
    }

    // ==================== FIM DE JOGO ====================
    function verificarFimDeJogo() {
      let pretas = 0, brancas = 0;
      let movsPretas = 0, movsBrancas = 0;

      const antigo = jogadorAtual;

      for (let l = 0; l < 8; l++) {
        for (let c = 0; c < 8; c++) {
          const v = tabuleiro[l][c];
          if (v === 1 || v === 11) {
            pretas++;
            jogadorAtual = 1;
            movsPretas += calcularMovimentosValidos(l, c).length;
          }
          if (v === 2 || v === 22) {
            brancas++;
            jogadorAtual = 2;
            movsBrancas += calcularMovimentosValidos(l, c).length;
          }
        }
      }
      jogadorAtual = antigo;

      // Vitória das Brancas
      if (pretas === 0) {
        mostrarFimDeJogo('Brancas venceram!', 'As pretas não têm mais peças.');
        return true;
      }
      if (movsPretas === 0) {
        mostrarFimDeJogo('Brancas venceram!', 'As pretas não têm mais movimentos.');
        return true;
      }

      // Vitória das Pretas
      if (brancas === 0) {
        mostrarFimDeJogo('Pretas venceram!', 'As brancas não têm mais peças.');
        return true;
      }
      if (movsBrancas === 0) {
        mostrarFimDeJogo('Pretas venceram!', 'As brancas não têm mais movimentos.');
        return true;
      }

      return false;
    }

    function mostrarFimDeJogo(titulo, msg) {
      jogoEncerrado = true;
      pararTemporizador();
      tocarSom('vitoria');
      tituloFim.textContent = titulo;
      mensagemFim.textContent = msg;
      telaFim.classList.remove('escondido');
    }