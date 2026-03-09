console.log('estoque.js carregado');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded disparado no estoque.js');
    
    // Delegated delete handler
    document.addEventListener('click', (e) => {
        console.log('click event detected, target:', e.target);
        let delBtn = e.target.closest('.btn-trash-btn');
        console.log('delBtn found:', delBtn);
        if (!delBtn) return;
        e.preventDefault();
        e.stopPropagation();
        console.log('delete clicked', { delBtn, dataId: delBtn.getAttribute('data-id') });
        const id = delBtn.getAttribute('data-id');
        if (!id) {
            console.error('ID não encontrado no data-id');
            return;
        }
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        console.log('Deletando com ID:', id);
        fetch(`${BASE_URL}/pages/storage/delete_produto.php?id=${id}`, { method: 'GET' })
            .then(r => r.text())
            .then(txt => {
                console.log('Resposta delete:', txt);
                if (txt.trim() === 'OK') {
                    const row = delBtn.closest('tr');
                    if (row) row.remove();
                } else {
                    alert('Erro: ' + txt);
                }
            })
            .catch(err => console.error('Erro fetch delete:', err));
    });

    // Open edit modal when clicking edit buttons
    document.querySelectorAll('.open-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('open-edit clicked', { node: btn });
            const id = btn.getAttribute('data-id');
            if (!id) return;
            const modal = document.getElementById('editModal');
            const body = document.getElementById('editModalBody');
            modal.classList.remove('hidden');
            body.innerHTML = 'Carregando...';

            // Fetch form fragment
            fetch(`${BASE_URL}/pages/storage/editar_produto.php?id=${id}&ajax=1`)
                .then(r => r.text())
                .then(html => {
                    body.innerHTML = html;

                    // Attach submit handler to loaded form
                    const form = body.querySelector('form');
                    if (form) {
                        form.addEventListener('submit', (evt) => {
                            evt.preventDefault();
                            console.log('editProductForm submit', { action: form.action, entries: [...new FormData(form).entries()] });
                            const fd = new FormData(form);
                            // Submit to the action attribute
                            fetch(form.action, { method: 'POST', body: fd })
                                .then(r => r.text())
                                .then(resp => {
                                    if (resp.trim() === 'OK') {
                                        modal.classList.add('hidden');
                                        location.reload();
                                    } else {
                                        // show response inside modal if possible
                                        alert('Erro ao atualizar: ' + resp);
                                    }
                                })
                                .catch(err => alert('Erro: ' + err));
                        });
                    }
                })
                .catch(err => { body.innerHTML = 'Erro ao carregar formulário.'; });
        });
    });

    // Close modal
    const closeBtn = document.getElementById('editModalClose');
    if (closeBtn) closeBtn.addEventListener('click', () => {
        document.getElementById('editModal').classList.add('hidden');
    });
});

