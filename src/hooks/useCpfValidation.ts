import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CpfValidationResult {
  isValid: boolean;
  isDuplicate: boolean;
  isChecking: boolean;
  error?: string;
}

export const useCpfValidation = (cpf: string, currentMotoristaId?: number) => {
  const [validation, setValidation] = useState<CpfValidationResult>({
    isValid: false,
    isDuplicate: false,
    isChecking: false
  });

  // Formatar CPF
  const formatCpf = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  // Validar formato do CPF
  const isValidCpfFormat = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    
    if (numbers.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(10))) return false;
    
    return true;
  };

  // Verificar se CPF já existe no banco
  const checkCpfDuplicate = async (cpfValue: string): Promise<boolean> => {
    if (!cpfValue || cpfValue.length < 14) return false;
    
    const cleanCpf = cpfValue.replace(/\D/g, '');
    
    try {
      const { data, error } = await supabase
        .from('motoristas')
        .select('id, nome')
        .eq('cpf', cleanCpf);
      
      if (error) {
        console.error('Erro ao verificar CPF:', error);
        return false;
      }
      
      // Se estamos editando, ignorar o próprio motorista
      const duplicates = data?.filter(motorista => motorista.id !== currentMotoristaId) || [];
      
      if (duplicates.length > 0) {
        toast.error(`CPF já cadastrado para: ${duplicates[0].nome}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro na verificação de CPF:', error);
      return false;
    }
  };

  useEffect(() => {
    const validateCpf = async () => {
      if (!cpf) {
        setValidation({
          isValid: false,
          isDuplicate: false,
          isChecking: false
        });
        return;
      }

      const cleanCpf = cpf.replace(/\D/g, '');
      
      // Validar formato apenas quando tiver 11 dígitos
      if (cleanCpf.length === 11) {
        const isValidFormat = isValidCpfFormat(cpf);
        
        if (!isValidFormat) {
          setValidation({
            isValid: false,
            isDuplicate: false,
            isChecking: false,
            error: 'CPF inválido'
          });
          return;
        }

        // Verificar duplicata
        setValidation(prev => ({ ...prev, isChecking: true }));
        
        const isDuplicate = await checkCpfDuplicate(cpf);
        
        setValidation({
          isValid: !isDuplicate,
          isDuplicate,
          isChecking: false,
          error: isDuplicate ? 'CPF já cadastrado' : undefined
        });
      } else {
        setValidation({
          isValid: false,
          isDuplicate: false,
          isChecking: false
        });
      }
    };

    const timeoutId = setTimeout(validateCpf, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [cpf, currentMotoristaId]);

  return {
    ...validation,
    formatCpf
  };
};