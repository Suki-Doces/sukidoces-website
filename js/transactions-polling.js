document.addEventListener('DOMContentLoaded', function () {
    if (typeof BASE_URL === 'undefined') {
        console.warn('BASE_URL is not defined; transactions polling disabled.');
        return;
    }

    const tbody = document.getElementById('transactions-tbody');
    if (!tbody) return;

    let lastId = 0;
    (function initLastId() {
        const rows = tbody.querySelectorAll('tr');
        if (rows.length === 0) return;
        const lastRow = rows[rows.length - 1];
        const firstCell = lastRow.querySelector('td');
        if (!firstCell) return;
        const raw = firstCell.textContent || firstCell.innerText || '';
        const digits = raw.replace(/[^0-9]/g, '');
        lastId = digits ? parseInt(digits, 10) : 0;
    })();

    async function fetchNew() {
        try {
            const res = await fetch(`${BASE_URL}/pages/dashboard/fetch_transactions.php?last_id=${lastId}`, { credentials: 'same-origin' });
            if (!res.ok) return;
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) return;

            data.forEach(tx => {
                appendRow(tx);
                lastId = Math.max(lastId, parseInt(tx.id_pedido, 10) || lastId);
            });
        } catch (err) {
            console.error('Error fetching transactions:', err);
        }
    }

    function formatCurrency(value) {
        const num = parseFloat(value) || 0;
        return 'R$' + num.toFixed(2).replace('.', ',');
    }

    function appendRow(tx) {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td'); tdId.textContent = tx.id_pedido; tr.appendChild(tdId);
        const tdCliente = document.createElement('td'); tdCliente.textContent = tx.cliente_nome || tx.cliente || ''; tr.appendChild(tdCliente);
        const tdData = document.createElement('td'); tdData.textContent = tx.data_pedido || tx.data || ''; tr.appendChild(tdData);
        const tdStatus = document.createElement('td');
        const span = document.createElement('span');
        span.className = 'status ' + ((tx.status || 'pendente').toString().toLowerCase());
        span.textContent = (tx.status || 'Pendente');
        tdStatus.appendChild(span);
        tr.appendChild(tdStatus);
        const tdValor = document.createElement('td'); tdValor.innerHTML = '<strong>' + formatCurrency(tx.valor_total || tx.total || tx.valor || 0) + '</strong>'; tr.appendChild(tdValor);

        tbody.appendChild(tr);
    }

    fetchNew();
    setInterval(fetchNew, 10000);
});
