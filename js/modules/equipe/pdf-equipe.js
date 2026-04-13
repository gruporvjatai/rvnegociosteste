// js/modules/equipe/pdf-equipe.js

// COLE SUAS FUNÇÕES DE PDF E IMPRESSÃO AQUI

async function gerarPdfMedicao(idMembro) {
    mostrarLoading();
    try {
        // 1. Busca os dados do membro no Supabase
        const { data: t, error } = await supabase
            .from('jsp_equipe')
            .select('*')
            .eq('id', idMembro)
            .single();

        if (error) throw error;

        // 2. Monta o HTML ou a estrutura do PDF (Aqui está o seu código fiel)
        const hoje = new Date().toLocaleDateString('pt-BR');
        
        const conteudoRecibo = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="text-align: center; color: #1e293b;">Demonstrativo de Medição</h2>
                <div style="display: flex; justify-content: space-between; margin-top: 80px;">
                    <div style="text-align: center; width: 45%; border-top: 1px solid #94a3b8; padding-top: 10px;">
                        <strong style="font-size: 13px; color: #0f172a;">RV NEGÓCIOS E COMPANHIA</strong><br>
                        <span style="font-size: 11px; color: #64748b;">Contratante</span>
                    </div>
                    <div style="text-align: center; width: 45%; border-top: 1px solid #94a3b8; padding-top: 10px;">
                        <strong style="font-size: 13px; color: #0f172a;">${t.nome.toUpperCase()}</strong><br>
                        <span style="font-size: 11px; color: #64748b;">Profissional Contratado</span>
                    </div>
                </div>
                
                <div style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; border-top: 1px dashed #e2e8f0; padding-top: 15px;">
                    Declaro para os devidos fins que o demonstrativo acima confere com a medição de serviços prestados.<br>
                    Jataí - GO, ${hoje}.
                </div>
            </div>
        `;

        // 3. Lógica para abrir a janela de impressão ou gerar o PDFMake
        const janelaImpressao = window.open('', '', 'width=800,height=600');
        janelaImpressao.document.write(conteudoRecibo);
        janelaImpressao.document.close();
        janelaImpressao.focus();
        setTimeout(() => {
            janelaImpressao.print();
            janelaImpressao.close();
        }, 500);

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        mostrarToast("Erro ao gerar documento", "erro");
    } finally {
        esconderLoading();
    }
}
