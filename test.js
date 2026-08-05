
        // 1. ANIMAÇÃO DE SCROLL (REVEAL)
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });
        
        revealElements.forEach(el => revealObserver.observe(el));

        // 2. EFEITO SPOTLIGHT NOS CARDS (MOUSE TRACKING)
        const cards = document.querySelectorAll('.spotlight');
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });

        // 3. LÓGICA DE ABAS E CÁLCULOS
        let abaAtiva = 'macro';

        function openTab(evt, tabName) {
            abaAtiva = tabName;
            document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
            document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
            
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
            calcularTotal();
        }

        const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        function calcularTotal() {
            if(abaAtiva === 'macro') {
                let qtd = parseInt(document.getElementById('qtdLocais').value) || 20;
                if(qtd < 20) qtd = 20;

                let total = 35000 + (qtd > 20 ? (qtd - 20) * 1800 : 0);

                if(document.getElementById('addPostagem').checked) total += (qtd * 600);
                if(document.getElementById('addOtimizacao').checked) total += (qtd * 300);
                if(document.getElementById('addMaterial').checked) total += (qtd * 1500);
                if(document.getElementById('addOffline').checked) total += 3500;

                document.getElementById('valorTotalMacro').innerText = formatCurrency(total);
            } else {
                let porte = document.getElementById('porteEmpresa').value;
                let total = porte === 'pequena' ? 1200 : (porte === 'media' ? 1800 : 2500);
                let valorFotoVideo = porte === 'grande' ? 2500 : 1500;

                if(document.getElementById('empOtimizacao').checked) total += 300;
                if(document.getElementById('empMaterial').checked) total += valorFotoVideo;

                document.getElementById('valorTotalMicro').innerText = formatCurrency(total);
            }
        }

        // 4. GERAÇÃO DO PDF
        function gerarPDF() {
            let tbodyHTML = '';
            let totalFinal = 0;

            const tdS = 'border: 1px solid #ddd; padding: 10px; font-size: 12px; color: #000;';
            const tdS_C = tdS + ' text-align: center;';
            const tdS_R = tdS + ' text-align: right;';
            
            if(abaAtiva === 'macro') {
                let qtd = Math.max(parseInt(document.getElementById('qtdLocais').value) || 20, 20);
                
                tbodyHTML += `<tr><td style="${tdS}">Tour Virtual Interativo - Base (Até 20 locais)</td><td style="${tdS_C}">1</td><td style="${tdS_R}">${formatCurrency(35000)}</td></tr>`;
                totalFinal += 35000;

                if(qtd > 20) {
                    let custoExtra = (qtd - 20) * 1800;
                    tbodyHTML += `<tr><td style="${tdS}">Locais Adicionais (${qtd - 20}x)</td><td style="${tdS_C}">${qtd - 20}</td><td style="${tdS_R}">${formatCurrency(custoExtra)}</td></tr>`;
                    totalFinal += custoExtra;
                }
                if(document.getElementById('addPostagem').checked) {
                    tbodyHTML += `<tr><td style="${tdS}">Postagem individual Google Ficha</td><td style="${tdS_C}">${qtd}</td><td style="${tdS_R}">${formatCurrency(qtd * 600)}</td></tr>`;
                    totalFinal += qtd * 600;
                }
                if(document.getElementById('addOtimizacao').checked) {
                    tbodyHTML += `<tr><td style="${tdS}">Otimização de Ficha Google</td><td style="${tdS_C}">${qtd}</td><td style="${tdS_R}">${formatCurrency(qtd * 300)}</td></tr>`;
                    totalFinal += qtd * 300;
                }
                if(document.getElementById('addMaterial').checked) {
                    tbodyHTML += `<tr><td style="${tdS}">Produção de Foto/Vídeo</td><td style="${tdS_C}">${qtd}</td><td style="${tdS_R}">${formatCurrency(qtd * 1500)}</td></tr>`;
                    totalFinal += qtd * 1500;
                }
                if(document.getElementById('addOffline').checked) {
                    tbodyHTML += `<tr><td style="${tdS}">Criação de Tour Offline (Servidor Local)</td><td style="${tdS_C}">1</td><td style="${tdS_R}">${formatCurrency(3500)}</td></tr>`;
                    totalFinal += 3500;
                }
            } else {
                let porte = document.getElementById('porteEmpresa').value;
                let valorBase = porte === 'pequena' ? 1200 : (porte === 'media' ? 1800 : 2500);
                let valorMaterial = porte === 'grande' ? 2500 : 1500;
                let nomePorte = porte.charAt(0).toUpperCase() + porte.slice(1);

                tbodyHTML += `<tr><td style="${tdS}">Tour Virtual Interativo + Postagem (${nomePorte})</td><td style="${tdS_C}">1</td><td style="${tdS_R}">${formatCurrency(valorBase)}</td></tr>`;
                totalFinal += valorBase;

                if(document.getElementById('empOtimizacao').checked) {
                    tbodyHTML += `<tr><td style="${tdS}">Otimização de Ficha Cadastral</td><td style="${tdS_C}">1</td><td style="${tdS_R}">${formatCurrency(300)}</td></tr>`;
                    totalFinal += 300;
                }
                if(document.getElementById('empMaterial').checked) {
                    tbodyHTML += `<tr><td style="${tdS}">Produção de Fotografia e Vídeo</td><td style="${tdS_C}">1</td><td style="${tdS_R}">${formatCurrency(valorMaterial)}</td></tr>`;
                    totalFinal += valorMaterial;
                }
            }

            const dataAtual = 'Data: ' + new Date().toLocaleDateString('pt-BR');
            const thS = 'border: 1px solid #ddd; padding: 10px; font-size: 12px; background: #f5f5f5; color: #000; font-weight: 600;';

            const htmlString = `
            <div style="background: #ffffff; color: #111; padding: 40px; font-family: 'Inter', sans-serif; width: 100%; box-sizing: border-box;">
                <div style="text-align: left; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
                    <div style="font-size: 20px; font-weight: 700; color: #000;">RED WOLF BRAZIL - PROPOSTA COMERCIAL</div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">${dataAtual}</div>
                </div>
                
                <h3 style="font-size: 14px; color: #000; margin-bottom: 10px; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;">Detalhamento do Escopo</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr>
                            <th style="${thS} text-align: left;">Item / Descrição</th>
                            <th style="${thS} text-align: center; width: 50px;">Qtd</th>
                            <th style="${thS} text-align: right; width: 120px;">Valor (R$)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tbodyHTML}
                    </tbody>
                    <tfoot>
                        <tr style="font-weight: 700; background: #e9ecef; font-size: 14px;">
                            <td colspan="2" style="border: 1px solid #ddd; padding: 10px; text-align: left; color: #000;">Investimento Total</td>
                            <td style="border: 1px solid #ddd; padding: 10px; text-align: right; color: #000;">${formatCurrency(totalFinal)}</td>
                        </tr>
                    </tfoot>
                </table>

                <h3 style="font-size: 14px; color: #000; margin-bottom: 10px; margin-top: 30px; text-transform: uppercase; letter-spacing: 1px;">Prazos e Responsabilidades</h3>
                <p style="font-size: 11px; color: #444; line-height: 1.5; margin-bottom: 20px;">Desenvolvimento dividido em Planejamento, Captação e Pós-produção. Prazo base de 60 dias para implantação. É condição obrigatória o acompanhamento de um representante da contratante durante as captações in loco.</p>

                <h3 style="font-size: 14px; color: #000; margin-bottom: 10px; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;">Condições de Pagamento</h3>
                <p style="font-size: 11px; color: #444; line-height: 1.5; margin-bottom: 30px;">Pagamento no ato da assinatura. Modalidades: Dinheiro, PIX, Boleto à vista ou parcelado em até 12x sem juros no cartão de crédito. Financiamento via boleto parcelado sujeito à aprovação de crédito corporativo.</p>

                <div style="margin-top: 40px; font-size: 10px; text-align: center; color: #777; border-top: 1px solid #ddd; padding-top: 15px;">
                    Documento emitido digitalmente | <strong>Red Wolf Brazil</strong> | CNPJ: 16.371.337/0001-45
                </div>
            </div>
            `;

            // Criar um elemento temporário para garantir o parse
            const opt = {
                margin: 15,
                filename: 'Proposta_Red_Wolf.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Convert string to HTML element (html2pdf sometimes works better with an actual DOM node)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString;
            
            html2pdf().set(opt).from(tempDiv).save();
        }
    