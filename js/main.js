let dadosFuncionario = {
    nome: '',
    dataAdmissao: null,
    feriastiradas: [],
    diasvendidos: []
};

let indiceEdicaoFerias = -1;
let indiceEdicaoVendidos = -1;
let flatpickrAdmissao, flatpickrRange, flatpickrModal;

window.addEventListener('load', function() {
    flatpickrAdmissao = flatpickr("#dataAdmissao", {
        locale: "pt",
        dateFormat: "d/m/Y",
        allowInput: true
    });

    const rangeFeriasInput = document.getElementById('rangeFerias');
    
    flatpickrRange = flatpickr("#rangeFerias", {
        mode: "range",
        locale: "pt",
        dateFormat: "d/m/Y",
        allowInput: true,
        conjunction: " - ",
        clickOpens: true,
        onReady: function(selectedDates, dateStr, instance) {
            instance.config.allowInput = true;
        }
    });
    
    let digitandoRange = false;
    
    rangeFeriasInput.addEventListener('keydown', function(e) {
        if (e.key >= '0' && e.key <= '9') {
            digitandoRange = true;
            flatpickrRange.close();
        }
    });
    
    rangeFeriasInput.addEventListener('keypress', function(e) {
        const char = e.key;
        if (char < '0' || char > '9') {
            e.preventDefault();
        }
    });
    
    rangeFeriasInput.addEventListener('paste', function(e) {
        e.preventDefault();
        const textoColado = (e.clipboardData || window.clipboardData).getData('text');
        processarTextoColado(textoColado);
    });
    
    rangeFeriasInput.addEventListener('input', function(e) {
        if (digitandoRange) {
            autoFormatarDataRange(e);
        }
    });
    
    rangeFeriasInput.addEventListener('blur', function(e) {
        if (digitandoRange) {
            setTimeout(function() {
                processarDataDigitada();
                digitandoRange = false;
            }, 200);
        }
    });
    
    rangeFeriasInput.addEventListener('click', function(e) {
        digitandoRange = false;
    });

    carregarDadosSalvos();
});

function processarTextoColado(texto) {
    const textoLimpo = texto.replace(/[^\d\/]/g, '');
    const numeros = textoLimpo.replace(/\D/g, '');
    
    if (numeros.length >= 16) {
        const formatado = numeros.substring(0, 2) + '/' + 
                        numeros.substring(2, 4) + '/' + 
                        numeros.substring(4, 8) + ' - ' + 
                        numeros.substring(8, 10) + '/' + 
                        numeros.substring(10, 12) + '/' + 
                        numeros.substring(12, 16);
        
        document.getElementById('rangeFerias').value = formatado;
        processarDataDigitada();
    } else {
        const regex = /(\d{2})\/(\d{2})\/(\d{4})[^\d]+(\d{2})\/(\d{2})\/(\d{4})/;
        const match = texto.match(regex);
        
        if (match) {
            const formatado = match[1] + '/' + match[2] + '/' + match[3] + ' - ' +
                            match[4] + '/' + match[5] + '/' + match[6];
            document.getElementById('rangeFerias').value = formatado;
            processarDataDigitada();
        }
    }
}

function autoFormatarDataRange(e) {
    const input = e.target;
    let valor = input.value;
    
    const numeros = valor.replace(/\D/g, '');
    
    if (e.inputType === 'deleteContentBackward') {
        let formatado = '';
        if (numeros.length > 0) {
            formatado = numeros.substring(0, 2);
            if (numeros.length > 2) {
                formatado += '/' + numeros.substring(2, 4);
            }
            if (numeros.length > 4) {
                formatado += '/' + numeros.substring(4, 8);
            }
            if (numeros.length > 8) {
                formatado += ' - ' + numeros.substring(8, 10);
            }
            if (numeros.length > 10) {
                formatado += '/' + numeros.substring(10, 12);
            }
            if (numeros.length > 12) {
                formatado += '/' + numeros.substring(12, 16);
            }
        }
        input.value = formatado;
        return;
    }
    
    let formatado = '';
    
    if (numeros.length > 0) {
        formatado = numeros.substring(0, 2);
        if (numeros.length > 2) {
            formatado += '/' + numeros.substring(2, 4);
        }
        if (numeros.length > 4) {
            formatado += '/' + numeros.substring(4, 8);
        }
        if (numeros.length > 8) {
            formatado += ' - ' + numeros.substring(8, 10);
        }
        if (numeros.length > 10) {
            formatado += '/' + numeros.substring(10, 12);
        }
        if (numeros.length > 12) {
            formatado += '/' + numeros.substring(12, 16);
        }
    }
    
    if (numeros.length > 16) {
        formatado = formatado.substring(0, formatado.length - (numeros.length - 16));
    }
    
    input.value = formatado;
}

function processarDataDigitada() {
    const rangeFeriasInput = document.getElementById('rangeFerias');
    const valor = rangeFeriasInput.value;
    
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = valor.match(regex);
    
    if (match) {
        const diaInicio = match[1];
        const mesInicio = match[2];
        const anoInicio = match[3];
        const diaFim = match[4];
        const mesFim = match[5];
        const anoFim = match[6];
        
        const dataInicio = new Date(anoInicio, mesInicio - 1, diaInicio);
        const dataFim = new Date(anoFim, mesFim - 1, diaFim);
        
        if (!isNaN(dataInicio.getTime()) && !isNaN(dataFim.getTime())) {
            flatpickrRange.setDate([dataInicio, dataFim], true);
        }
    }
}

function abrirModalFerias() {
    document.getElementById('tituloModalFerias').textContent = '➕ Adicionar Férias';
    document.getElementById('btnSalvarFerias').textContent = '💾 Salvar';
    document.getElementById('modalFerias').style.display = 'block';
    
    const dataAdmissao = new Date(dadosFuncionario.dataAdmissao + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const periodos = calcularPeriodosAquisitivos(dataAdmissao, hoje);
    atualizarSelectPeriodos(periodos);
}

function fecharModalFerias() {
    document.getElementById('modalFerias').style.display = 'none';
    limparFormularioFerias();
    indiceEdicaoFerias = -1;
}

function abrirModalVendidos() {
    document.getElementById('tituloModalVendidos').textContent = '➕ Adicionar Venda';
    document.getElementById('btnSalvarVendidos').textContent = '💾 Salvar';
    document.getElementById('modalVendidos').style.display = 'block';
    
    const dataAdmissao = new Date(dadosFuncionario.dataAdmissao + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const periodos = calcularPeriodosAquisitivos(dataAdmissao, hoje);
    atualizarSelectPeriodos(periodos);
}

function fecharModalVendidos() {
    document.getElementById('modalVendidos').style.display = 'none';
    limparFormularioVendidos();
    indiceEdicaoVendidos = -1;
}

function fecharModalCalendario() {
    document.getElementById('modalCalendario').style.display = 'none';
    if (flatpickrModal) {
        flatpickrModal.destroy();
        flatpickrModal = null;
    }
}

function calcularFerias() {
    const nome = document.getElementById('nomeFuncionario').value.trim();
    const dataAdmissaoStr = document.getElementById('dataAdmissao').value;

    if (!nome || !dataAdmissaoStr) {
        alert('Por favor, preencha o nome e a data de admissão.');
        return;
    }

    const partes = dataAdmissaoStr.split('/');
    if (partes.length !== 3) {
        alert('Data inválida. Use o formato dd/mm/aaaa');
        return;
    }

    const dataAdmissao = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    const dataObj = new Date(dataAdmissao + 'T00:00:00');
    
    if (isNaN(dataObj.getTime())) {
        alert('Data de admissão inválida.');
        return;
    }

    dadosFuncionario.nome = nome;
    dadosFuncionario.dataAdmissao = dataAdmissao;

    atualizarInterface();
}

function atualizarInterface() {
    const dataAdmissao = new Date(dadosFuncionario.dataAdmissao + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let meses = 0;
    let tempData = new Date(dataAdmissao);
    while (tempData <= hoje) {
        tempData.setMonth(tempData.getMonth() + 1);
        if (tempData <= hoje) meses++;
    }

    document.getElementById('tempoEmpresa').textContent = meses;

    const periodosAquisitivos = calcularPeriodosAquisitivos(dataAdmissao, hoje);
    document.getElementById('periodosAquisitivos').textContent = periodosAquisitivos.length;

    const { disponivel, vencido } = calcularDiasDisponiveis(periodosAquisitivos);
    document.getElementById('diasDisponiveis').textContent = disponivel;
    document.getElementById('diasVencidos').textContent = vencido;

    document.getElementById('resumoSection').style.display = 'block';
    document.getElementById('periodosSection').style.display = 'block';
    document.getElementById('feriasListaSection').style.display = 'block';
    document.getElementById('vendidasListaSection').style.display = 'block';

    renderizarPeriodos(periodosAquisitivos);
    renderizarFeriasTiradas();
    renderizarDiasVendidos();
    atualizarSelectPeriodos(periodosAquisitivos);
}

function calcularPeriodosAquisitivos(dataAdmissao, dataReferencia) {
    const periodos = [];
    let inicioperiodo = new Date(dataAdmissao);
    
    while (inicioperiodo < dataReferencia) {
        const fimPeriodo = new Date(inicioperiodo);
        fimPeriodo.setFullYear(fimPeriodo.getFullYear() + 1);
        fimPeriodo.setDate(fimPeriodo.getDate() - 1);

        const limiteConcessivo = new Date(fimPeriodo);
        limiteConcessivo.setFullYear(limiteConcessivo.getFullYear() + 1);

        if (fimPeriodo <= dataReferencia) {
            periodos.push({
                inicio: new Date(inicioperiodo),
                fim: new Date(fimPeriodo),
                limiteConcessivo: limiteConcessivo,
                diasDireito: 30
            });
        }

        inicioperiodo.setFullYear(inicioperiodo.getFullYear() + 1);
    }

    return periodos;
}

function calcularDiasDisponiveis(periodos) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const feriasOrdenadas = [...dadosFuncionario.feriastiradas].sort((a, b) => {
        return new Date(a.dataInicio + 'T00:00:00') - new Date(b.dataInicio + 'T00:00:00');
    });

    const saldos = periodos.map(p => ({ ...p, saldo: p.diasDireito }));
    
    dadosFuncionario.diasvendidos.forEach(venda => {
        if (venda.periodoIndex !== undefined && saldos[venda.periodoIndex]) {
            saldos[venda.periodoIndex].saldo -= venda.diasVendidos;
        }
    });
    
    feriasOrdenadas.forEach(ferias => {
        let diasParaDescontar = ferias.diasTirados;
        
        for (let i = 0; i < saldos.length && diasParaDescontar > 0; i++) {
            if (saldos[i].saldo > 0) {
                const descontado = Math.min(saldos[i].saldo, diasParaDescontar);
                saldos[i].saldo -= descontado;
                diasParaDescontar -= descontado;
            }
        }
    });

    let totalDisponivel = 0;
    let totalVencido = 0;

    saldos.forEach(periodo => {
        if (periodo.saldo > 0) {
            if (hoje > periodo.limiteConcessivo) {
                totalVencido += periodo.saldo;
            } else {
                totalDisponivel += periodo.saldo;
            }
        }
    });

    return { disponivel: totalDisponivel, vencido: totalVencido };
}

function renderizarPeriodos(periodos) {
    const container = document.getElementById('periodosContainer');
    
    if (periodos.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum período aquisitivo completado ainda.</div>';
        return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const feriasOrdenadas = [...dadosFuncionario.feriastiradas].sort((a, b) => {
        return new Date(a.dataInicio + 'T00:00:00') - new Date(b.dataInicio + 'T00:00:00');
    });

    const saldos = periodos.map(p => ({ 
        saldo: p.diasDireito, 
        diasTirados: 0, 
        diasVendidos: 0 
    }));
    
    dadosFuncionario.diasvendidos.forEach(venda => {
        if (venda.periodoIndex !== undefined && saldos[venda.periodoIndex]) {
            saldos[venda.periodoIndex].saldo -= venda.diasVendidos;
            saldos[venda.periodoIndex].diasVendidos += venda.diasVendidos;
        }
    });
    
    feriasOrdenadas.forEach(ferias => {
        let diasTiradosRestantes = ferias.diasTirados;
        
        for (let i = 0; i < saldos.length && diasTiradosRestantes > 0; i++) {
            if (saldos[i].saldo > 0) {
                const descontado = Math.min(saldos[i].saldo, diasTiradosRestantes);
                saldos[i].saldo -= descontado;
                saldos[i].diasTirados += descontado;
                diasTiradosRestantes -= descontado;
            }
        }
    });

    let html = '<div class="periods-table"><table><thead><tr>';
    html += '<th>Período</th>';
    html += '<th>Início</th>';
    html += '<th>Fim</th>';
    html += '<th>Limite Concessivo</th>';
    html += '<th>Dias Tirados</th>';
    html += '<th>Dias Vendidos</th>';
    html += '<th>Saldo</th>';
    html += '<th>Status</th>';
    html += '</tr></thead><tbody>';

    periodos.forEach((periodo, index) => {
        const saldo = saldos[index].saldo;
        const diasTirados = saldos[index].diasTirados;
        const diasVendidos = saldos[index].diasVendidos;
        
        let status = '';
        let statusClass = '';

        if (saldo === 0) {
            status = 'Utilizado';
            statusClass = 'disponivel';
        } else if (hoje > periodo.limiteConcessivo) {
            status = 'Vencido';
            statusClass = 'vencido';
        } else if (diasTirados > 0 || diasVendidos > 0) {
            status = 'Parcial';
            statusClass = 'parcial';
        } else {
            status = 'Disponível';
            statusClass = 'disponivel';
        }

        html += '<tr>';
        html += `<td>Período ${index + 1}</td>`;
        html += `<td>${formatarData(periodo.inicio)}</td>`;
        html += `<td>${formatarData(periodo.fim)}</td>`;
        html += `<td>${formatarData(periodo.limiteConcessivo)}</td>`;
        html += `<td>${diasTirados} dias</td>`;
        html += `<td>${diasVendidos} dias</td>`;
        html += `<td><strong>${saldo} dias</strong></td>`;
        html += `<td><span class="status-badge ${statusClass}">${status}</span></td>`;
        html += '</tr>';
    });

    const dataAdmissao = new Date(dadosFuncionario.dataAdmissao + 'T00:00:00');
    const ultimoPeriodoFim = periodos.length > 0 ? periodos[periodos.length - 1].fim : new Date(dataAdmissao);
    const inicioParcial = new Date(ultimoPeriodoFim);
    inicioParcial.setDate(inicioParcial.getDate() + 1);

    if (inicioParcial < hoje) {
        const diasDecorridos = Math.floor((hoje - inicioParcial) / (1000 * 60 * 60 * 24));
        const diasProporcional = Math.floor((diasDecorridos / 365) * 30);
        
        const fimParcialProjetado = new Date(inicioParcial);
        fimParcialProjetado.setFullYear(fimParcialProjetado.getFullYear() + 1);
        fimParcialProjetado.setDate(fimParcialProjetado.getDate() - 1);

        html += '<tr class="periodo-parcial">';
        html += `<td>Período Parcial *</td>`;
        html += `<td>${formatarData(inicioParcial)}</td>`;
        html += `<td>${formatarData(hoje)} (hoje)</td>`;
        html += `<td>-</td>`;
        html += `<td>-</td>`;
        html += `<td>-</td>`;
        html += `<td><strong>${diasProporcional} dias</strong></td>`;
        html += `<td><span class="status-badge indisponivel">Indisponível</span></td>`;
        html += '</tr>';
    }

    html += '</tbody></table>';
    
    if (inicioParcial < hoje) {
        html += '<div style="margin-top: 10px; padding: 10px; background: #f9f9f9; border-left: 3px solid #667eea; border-radius: 5px;">';
        html += '<small><strong>* Período Parcial:</strong> Dias proporcionais acumulados até hoje. ';
        html += 'Estes dias só estarão disponíveis em caso de rescisão de contrato.</small>';
        html += '</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function atualizarSelectPeriodos(periodos) {
    const select = document.getElementById('periodoVendido');
    select.innerHTML = '<option value="">Selecione o período aquisitivo</option>';
    
    periodos.forEach((periodo, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Período ${index + 1} (${formatarData(periodo.inicio)} - ${formatarData(periodo.fim)})`;
        select.appendChild(option);
    });
}

function salvarFerias() {
    const rangeFeriasStr = document.getElementById('rangeFerias').value;
    const observacoes = document.getElementById('observacoesFerias').value;

    if (!rangeFeriasStr) {
        alert('Por favor, selecione o período das férias.');
        return;
    }

    let partes = rangeFeriasStr.split(' - ');
    
    if (partes.length !== 2) {
        const regex = /(\d{2})\/(\d{2})\/(\d{4})[^\d]+(\d{2})\/(\d{2})\/(\d{4})/;
        const match = rangeFeriasStr.match(regex);
        
        if (match) {
            partes = [
                match[1] + '/' + match[2] + '/' + match[3],
                match[4] + '/' + match[5] + '/' + match[6]
            ];
        } else {
            alert('Por favor, selecione um período válido (data início e data fim).');
            return;
        }
    }

    const inicioPartes = partes[0].trim().split('/');
    const fimPartes = partes[1].trim().split('/');

    if (inicioPartes.length !== 3 || fimPartes.length !== 3) {
        alert('Formato de data inválido.');
        return;
    }

    const dataInicio = `${inicioPartes[2]}-${inicioPartes[1].padStart(2, '0')}-${inicioPartes[0].padStart(2, '0')}`;
    const dataFim = `${fimPartes[2]}-${fimPartes[1].padStart(2, '0')}-${fimPartes[0].padStart(2, '0')}`;

    const inicio = new Date(dataInicio + 'T00:00:00');
    const fim = new Date(dataFim + 'T00:00:00');

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
        alert('Datas inválidas.');
        return;
    }

    if (inicio > fim) {
        alert('A data de início não pode ser posterior à data de fim.');
        return;
    }

    const diasTirados = Math.floor((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;

    const feriasData = {
        dataInicio,
        dataFim,
        diasTirados,
        observacoes
    };

    if (indiceEdicaoFerias >= 0) {
        dadosFuncionario.feriastiradas[indiceEdicaoFerias] = feriasData;
        indiceEdicaoFerias = -1;
    } else {
        dadosFuncionario.feriastiradas.push(feriasData);
    }

    fecharModalFerias();
    atualizarInterface();
}

function limparFormularioFerias() {
    flatpickrRange.clear();
    document.getElementById('observacoesFerias').value = '';
}

function editarFerias(index) {
    const ferias = dadosFuncionario.feriastiradas[index];
    
    const dataInicio = new Date(ferias.dataInicio + 'T00:00:00');
    const dataFim = new Date(ferias.dataFim + 'T00:00:00');

    flatpickrRange.setDate([dataInicio, dataFim]);
    document.getElementById('observacoesFerias').value = ferias.observacoes || '';

    indiceEdicaoFerias = index;
    document.getElementById('tituloModalFerias').textContent = '✏️ Editar Férias';
    document.getElementById('btnSalvarFerias').textContent = '💾 Salvar Edição';
    
    abrirModalFerias();
}

function cancelarEdicaoFerias() {
    fecharModalFerias();
}

function salvarDiasVendidos() {
    const periodoIndex = parseInt(document.getElementById('periodoVendido').value);
    const diasVendidos = parseInt(document.getElementById('diasVendidos').value) || 0;
    const observacoes = document.getElementById('observacoesVendidas').value;

    if (isNaN(periodoIndex) || periodoIndex === '') {
        alert('Por favor, selecione o período aquisitivo.');
        return;
    }

    if (diasVendidos <= 0) {
        alert('Por favor, informe a quantidade de dias vendidos.');
        return;
    }

    const vendaData = {
        periodoIndex,
        diasVendidos,
        observacoes
    };

    if (indiceEdicaoVendidos >= 0) {
        dadosFuncionario.diasvendidos[indiceEdicaoVendidos] = vendaData;
        indiceEdicaoVendidos = -1;
    } else {
        dadosFuncionario.diasvendidos.push(vendaData);
    }

    fecharModalVendidos();
    atualizarInterface();
}

function limparFormularioVendidos() {
    document.getElementById('periodoVendido').value = '';
    document.getElementById('diasVendidos').value = '0';
    document.getElementById('observacoesVendidas').value = '';
}

function editarDiasVendidos(index) {
    const venda = dadosFuncionario.diasvendidos[index];
    
    document.getElementById('periodoVendido').value = venda.periodoIndex;
    document.getElementById('diasVendidos').value = venda.diasVendidos;
    document.getElementById('observacoesVendidas').value = venda.observacoes || '';

    indiceEdicaoVendidos = index;
    document.getElementById('tituloModalVendidos').textContent = '✏️ Editar Venda';
    document.getElementById('btnSalvarVendidos').textContent = '💾 Salvar Edição';
    
    abrirModalVendidos();
}

function cancelarEdicaoVendidos() {
    fecharModalVendidos();
}

function visualizarPeriodo(dataInicio, dataFim, diasTirados) {
    const inicio = new Date(dataInicio + 'T00:00:00');
    const fim = new Date(dataFim + 'T00:00:00');

    document.getElementById('modalDataInicio').textContent = formatarData(inicio);
    document.getElementById('modalDataFim').textContent = formatarData(fim);
    document.getElementById('modalTotalDias').textContent = diasTirados;

    const modalContainer = document.getElementById('modalCalendarioContainer');
    modalContainer.innerHTML = '<input type="text" id="modalCalendarInput" style="display:none">';

    if (flatpickrModal) {
        flatpickrModal.destroy();
    }

    flatpickrModal = flatpickr("#modalCalendarInput", {
        mode: "range",
        locale: "pt",
        inline: true,
        defaultDate: [inicio, fim],
        static: true,
        clickOpens: false,
        allowInput: false
    });

    document.getElementById('modalCalendario').style.display = 'block';
}

function fecharModalCalendario() {
    document.getElementById('modalCalendario').style.display = 'none';
    if (flatpickrModal) {
        flatpickrModal.destroy();
        flatpickrModal = null;
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        if (event.target.id === 'modalCalendario') {
            fecharModalCalendario();
        } else if (event.target.id === 'modalFerias') {
            fecharModalFerias();
        } else if (event.target.id === 'modalVendidos') {
            fecharModalVendidos();
        }
    }
}

function renderizarFeriasTiradas() {
    const container = document.getElementById('feriasListaContainer');

    if (dadosFuncionario.feriastiradas.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma féria registrada ainda.</div>';
        return;
    }

    const feriasComIndice = dadosFuncionario.feriastiradas.map((ferias, index) => ({
        ferias,
        indexOriginal: index
    }));
    
    feriasComIndice.sort((a, b) => {
        const dataA = new Date(a.ferias.dataInicio + 'T00:00:00');
        const dataB = new Date(b.ferias.dataInicio + 'T00:00:00');
        return dataA - dataB;
    });

    let html = '<table><thead><tr>';
    html += '<th>Data Início</th>';
    html += '<th>Data Fim</th>';
    html += '<th>Dias Tirados</th>';
    html += '<th>Observações</th>';
    html += '<th>Ações</th>';
    html += '</tr></thead><tbody>';

    feriasComIndice.forEach(({ferias, indexOriginal}) => {
        html += '<tr>';
        html += `<td>${formatarData(new Date(ferias.dataInicio + 'T00:00:00'))}</td>`;
        html += `<td>${formatarData(new Date(ferias.dataFim + 'T00:00:00'))}</td>`;
        html += `<td>${ferias.diasTirados} dias</td>`;
        html += `<td>${ferias.observacoes || '-'}</td>`;
        html += `<td>`;
        html += `<button class="btn-view" onclick="visualizarPeriodo('${ferias.dataInicio}', '${ferias.dataFim}', ${ferias.diasTirados})">👁</button>`;
        html += `<button class="btn-edit" onclick="editarFerias(${indexOriginal})">Editar</button>`;
        html += `<button class="btn-delete" onclick="removerFerias(${indexOriginal})">-</button>`;
        html += `</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderizarDiasVendidos() {
    const container = document.getElementById('vendidasListaContainer');

    if (dadosFuncionario.diasvendidos.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma venda registrada ainda.</div>';
        return;
    }

    const dataAdmissao = new Date(dadosFuncionario.dataAdmissao + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const periodos = calcularPeriodosAquisitivos(dataAdmissao, hoje);

    const vendasComIndice = dadosFuncionario.diasvendidos.map((venda, index) => ({
        venda,
        indexOriginal: index
    }));
    
    vendasComIndice.sort((a, b) => {
        return (a.venda.periodoIndex || 0) - (b.venda.periodoIndex || 0);
    });

    let html = '<table><thead><tr>';
    html += '<th>Período Aquisitivo</th>';
    html += '<th>Dias Vendidos</th>';
    html += '<th>Observações</th>';
    html += '<th>Ações</th>';
    html += '</tr></thead><tbody>';

    vendasComIndice.forEach(({venda, indexOriginal}) => {
        const periodo = periodos[venda.periodoIndex];
        const periodoNome = periodo ? `Período ${venda.periodoIndex + 1}` : 'N/A';
        
        html += '<tr>';
        html += `<td>${periodoNome}</td>`;
        html += `<td>${venda.diasVendidos} dias</td>`;
        html += `<td>${venda.observacoes || '-'}</td>`;
        html += `<td>`;
        html += `<button class="btn-edit" onclick="editarDiasVendidos(${indexOriginal})">Editar</button>`;
        html += `<button class="btn-delete" onclick="removerDiasVendidos(${indexOriginal})">-</button>`;
        html += `</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function removerFerias(index) {
    if (confirm('Deseja realmente remover este registro de férias?')) {
        dadosFuncionario.feriastiradas.splice(index, 1);
        
        if (indiceEdicaoFerias === index) {
            cancelarEdicaoFerias();
        } else if (indiceEdicaoFerias > index) {
            indiceEdicaoFerias--;
        }
        
        atualizarInterface();
    }
}

function removerDiasVendidos(index) {
    if (confirm('Deseja realmente remover este registro de venda?')) {
        dadosFuncionario.diasvendidos.splice(index, 1);
        
        if (indiceEdicaoVendidos === index) {
            cancelarEdicaoVendidos();
        } else if (indiceEdicaoVendidos > index) {
            indiceEdicaoVendidos--;
        }
        
        atualizarInterface();
    }
}

function formatarData(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function exportarDados() {
    if (!dadosFuncionario.nome || !dadosFuncionario.dataAdmissao) {
        alert('Não há dados para exportar.');
        return;
    }

    const dataStr = JSON.stringify(dadosFuncionario, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ferias_${dadosFuncionario.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importarDados(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (!dados.nome || !dados.dataAdmissao) {
                alert('Arquivo inválido.');
                return;
            }

            dadosFuncionario = dados;
            
            if (!dadosFuncionario.diasvendidos) {
                dadosFuncionario.diasvendidos = [];
            }
            
            document.getElementById('nomeFuncionario').value = dados.nome;
            
            const dataAdmissao = new Date(dados.dataAdmissao + 'T00:00:00');
            flatpickrAdmissao.setDate(dataAdmissao);
            
            atualizarInterface();
            alert('Dados importados com sucesso!');
        } catch (error) {
            alert('Erro ao importar arquivo. Verifique se o formato está correto.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function carregarDadosSalvos() {
    const dadosSalvos = localStorage.getItem('dadosFeriasApp');
    if (dadosSalvos) {
        try {
            dadosFuncionario = JSON.parse(dadosSalvos);
            
            if (!dadosFuncionario.diasvendidos) {
                dadosFuncionario.diasvendidos = [];
            }
            
            document.getElementById('nomeFuncionario').value = dadosFuncionario.nome;
            
            if (dadosFuncionario.dataAdmissao) {
                const dataAdmissao = new Date(dadosFuncionario.dataAdmissao + 'T00:00:00');
                flatpickrAdmissao.setDate(dataAdmissao);
            }
            
            if (dadosFuncionario.nome && dadosFuncionario.dataAdmissao) {
                atualizarInterface();
            }
        } catch (e) {
            console.error('Erro ao carregar dados salvos', e);
        }
    }
}

function salvarNoLocalStorage() {
    if (dadosFuncionario.nome && dadosFuncionario.dataAdmissao) {
        localStorage.setItem('dadosFeriasApp', JSON.stringify(dadosFuncionario));
    }
}

const calcularFeriasOriginal = calcularFerias;
calcularFerias = function() {
    calcularFeriasOriginal();
    salvarNoLocalStorage();
};

const salvarFeriasOriginal = salvarFerias;
salvarFerias = function() {
    salvarFeriasOriginal();
    salvarNoLocalStorage();
};

const salvarDiasVendidosOriginal = salvarDiasVendidos;
salvarDiasVendidos = function() {
    salvarDiasVendidosOriginal();
    salvarNoLocalStorage();
};

const removerFeriasOriginal = removerFerias;
removerFerias = function(index) {
    removerFeriasOriginal(index);
    salvarNoLocalStorage();
};

const removerDiasVendidosOriginal = removerDiasVendidos;
removerDiasVendidos = function(index) {
    removerDiasVendidosOriginal(index);
    salvarNoLocalStorage();
};
