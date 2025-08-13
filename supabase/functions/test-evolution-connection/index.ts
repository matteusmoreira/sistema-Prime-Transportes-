import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando teste de conexão com Evolution API...');

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Get Evolution API configurations
    console.log('📡 Buscando configurações do banco...');
    const { data: configuracoes, error: configError } = await supabase
      .from('configuracoes')
      .select('*')
      .single();

    if (configError || !configuracoes) {
      console.error('❌ Erro ao buscar configurações:', configError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Configurações da Evolution API não encontradas',
          error: configError
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✅ Configurações encontradas:', {
      url: configuracoes.evolution_api_url,
      instanceId: configuracoes.evolution_instance_id,
      hasApiKey: !!configuracoes.evolution_api_key
    });

    // Test connection to Evolution API
    console.log('🧪 Testando conexão com Evolution API...');
    const testUrl = `${configuracoes.evolution_api_url}/instance/fetchInstances`;
    
    console.log('🔗 URL de teste:', testUrl);
    console.log('🔑 API Key (primeiros 10 chars):', configuracoes.evolution_api_key?.substring(0, 10) + '...');

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': configuracoes.evolution_api_key,
      },
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers da resposta:', Object.fromEntries(response.headers));

    const responseData = await response.text();
    console.log('📄 Resposta completa:', responseData);

    let parsedData;
    try {
      parsedData = JSON.parse(responseData);
    } catch (e) {
      console.error('❌ Erro ao fazer parse da resposta JSON:', e);
      parsedData = { raw: responseData };
    }

    if (response.ok) {
      console.log('✅ Conexão com Evolution API bem-sucedida!');
      
      // Test specific instance
      if (configuracoes.evolution_instance_id) {
        console.log('🔍 Testando instância específica...');
        const instanceUrl = `${configuracoes.evolution_api_url}/instance/connect/${configuracoes.evolution_instance_id}`;
        
        const instanceResponse = await fetch(instanceUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': configuracoes.evolution_api_key,
          },
        });

        console.log('📊 Status da instância:', instanceResponse.status);
        const instanceData = await instanceResponse.text();
        console.log('📄 Dados da instância:', instanceData);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Conexão com Evolution API bem-sucedida',
            generalTest: {
              status: response.status,
              data: parsedData
            },
            instanceTest: {
              status: instanceResponse.status,
              data: instanceData
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Conexão com Evolution API bem-sucedida',
          data: parsedData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.error('❌ Erro na conexão com Evolution API');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Erro na conexão com Evolution API: ${response.status}`,
          responseData: parsedData,
          status: response.status
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('💥 Erro crítico na função:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Erro interno do servidor',
        error: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});