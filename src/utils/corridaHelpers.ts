import { Corrida } from '@/types/corridas';

export const getCorridasByMotorista = (corridas: Corrida[], motoristaEmail: string, motoristas: any[]): Corrida[] => {
  console.log('=== GET CORRIDAS BY MOTORISTA DEBUG ===');
  console.log('Email do motorista logado:', motoristaEmail);
  console.log('Tipo do email:', typeof motoristaEmail);
  
  // Verificar se corridas está definido e tem dados
  console.log('Array de corridas recebido:', corridas);
  console.log('Tipo das corridas:', typeof corridas);
  console.log('É array?', Array.isArray(corridas));
  console.log('Quantidade de corridas:', corridas ? corridas.length : 'undefined');
  
  // Buscar motorista pelo email para obter o nome
  console.log('Todos os motoristas recebidos:', motoristas);
  console.log('Emails dos motoristas cadastrados:', motoristas.map((m: any) => m.email));
  
  const motorista = motoristas.find((m: any) => {
    console.log(`Comparando emails: "${m.email}" === "${motoristaEmail}"`);
    return m.email === motoristaEmail;
  });
  console.log('Motorista encontrado:', motorista);
  
  if (!motorista) {
    console.log('ERRO: Motorista não encontrado para email:', motoristaEmail);
    return [];
  }
  
  console.log('Nome do motorista encontrado:', motorista.nome);
  console.log('Tipo do nome:', typeof motorista.nome);
  console.log('Total de corridas disponíveis:', corridas.length);
  console.log('Todas as corridas:', corridas);
  
  // Filtrar corridas pelo nome do motorista
  const corridasDoMotorista = corridas.filter((corrida, index) => {
    console.log(`--- Corrida ${index + 1} ---`);
    console.log('ID da corrida:', corrida.id);
    console.log('Motorista na corrida:', corrida.motorista);
    console.log('Tipo do motorista na corrida:', typeof corrida.motorista);
    console.log('Nome do motorista buscado:', motorista.nome);
    console.log('Comparação:', `"${corrida.motorista}" === "${motorista.nome}"`);
    
    const match = corrida.motorista === motorista.nome;
    console.log('Match result:', match);
    return match;
  });
  
  console.log('RESULTADO FINAL:');
  console.log('Corridas filtradas para o motorista:', corridasDoMotorista);
  console.log('Quantidade de corridas do motorista:', corridasDoMotorista.length);
  console.log('=== FIM GET CORRIDAS BY MOTORISTA DEBUG ===');
  
  return corridasDoMotorista;
};