 // Função para alternar visibilidade da senha
        document.querySelectorAll('.password-toggle').forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const icon = button.querySelector('.material-symbols-rounded');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.textContent = 'visibility_off';
                } else {
                    input.type = 'password';
                    icon.textContent = 'visibility';
                }
            });
        });

        // Função para salvar alterações
        function salvarAlteracoes() {
            // Aqui você pode adicionar a lógica para salvar as alterações
            alert('Alterações salvas com sucesso!');
        }