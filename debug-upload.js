// Script para debugar o problema de upload de documentos na OS

// Simular a estrutura de dados que está sendo enviada
const comprovantes = {
  pedagio: new File(['test'], 'comprovante-pedagio.pdf', { type: 'application/pdf' }),
  estacionamento: null,
  hospedagem: new File(['test'], 'comprovante-hospedagem.jpg', { type: 'image/jpeg' })
};

const documentos = [];

// Simular o processamento que acontece no OSForm
const documentosProcessados = [...documentos, ...Object.entries(comprovantes)
  .filter(([_, file]) => file !== null)
  .map(([tipo, file]) => ({
    id: `${tipo}-${Date.now()}`,
    nome: `Comprovante ${tipo}`,
    descricao: `Comprovante de ${tipo}`,
    arquivo: file
  }))];

console.log('Comprovantes originais:', comprovantes);
console.log('Documentos processados:', documentosProcessados);
console.log('Número de documentos:', documentosProcessados.length);

// Verificar se os arquivos estão sendo passados corretamente
documentosProcessados.forEach((doc, index) => {
  console.log(`Documento ${index + 1}:`);
  console.log('  Nome:', doc.nome);
  console.log('  Descrição:', doc.descricao);
  console.log('  Arquivo:', doc.arquivo);
  console.log('  É File?', doc.arquivo instanceof File);
  console.log('  Tamanho:', doc.arquivo?.size);
  console.log('  Tipo:', doc.arquivo?.type);
});