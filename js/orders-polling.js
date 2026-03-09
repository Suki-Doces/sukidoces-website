document.addEventListener('DOMContentLoaded', function () {
    if (typeof BASE_URL === 'undefined') {
        console.warn('BASE_URL is not defined; orders polling disabled.');
        return;
    }

    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    // determine last id from table if present
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
            const res = await fetch(`${BASE_URL}/pages/order/fetch_orders.php?last_id=${lastId}`, { credentials: 'same-origin' });
            if (!res.ok) return;
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) return;

            data.forEach(order => {
                appendOrderRow(order);
                lastId = Math.max(lastId, parseInt(order.id_pedido, 10) || lastId);
            });
        } catch (err) {
            console.error('Error fetching new orders:', err);
        }
    }

    function formatCurrency(value) {
        // Expecting a numeric value in order.valor_total or order.total
        const num = parseFloat(value) || 0;
        return 'R$' + num.toFixed(2).replace('.', ',');
    }

    function appendOrderRow(order) {
        const tr = document.createElement('tr');

        // ID
        const tdId = document.createElement('td');
        tdId.textContent = order.id_pedido;
        tr.appendChild(tdId);

        // Cliente
        const tdCliente = document.createElement('td');
        tdCliente.textContent = order.cliente_nome || order.cliente || '';
        tr.appendChild(tdCliente);

        // Endereço
        const tdEndereco = document.createElement('td');
        tdEndereco.textContent = order.endereco || order.cliente_endereco || '';
        tr.appendChild(tdEndereco);

        // Data
        const tdData = document.createElement('td');
        tdData.textContent = order.data_pedido || order.data || order.created_at || '';
        tr.appendChild(tdData);

        // Status
        const tdStatus = document.createElement('td');
        const pStatus = document.createElement('p');
        const statusVal = (order.status || '').toString().toLowerCase();
        pStatus.className = 'status ' + (statusVal || 'pendente');
        pStatus.textContent = statusVal ? (statusVal.charAt(0).toUpperCase() + statusVal.slice(1)) : 'Pendente';
        tdStatus.appendChild(pStatus);
        tr.appendChild(tdStatus);

        // Valor
        const tdValor = document.createElement('td');
        tdValor.innerHTML = '<strong>' + formatCurrency(order.valor_total || order.total || order.valor || order.price || 0) + '</strong>';
        tr.appendChild(tdValor);

        tbody.appendChild(tr);
    }

    // fetch initially and then poll every 10 seconds
    fetchNew();
    setInterval(fetchNew, 10000);
});
