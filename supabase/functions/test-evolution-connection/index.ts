import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  url: string;
  instanceId: string;
  apiKey: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, instanceId, apiKey }: RequestBody = await req.json();

    console.log('Testing Evolution API connection...', { url, instanceId });

    // Validar se todos os campos foram fornecidos
    if (!url || !instanceId || !apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'URL, Instance ID e API Key são obrigatórios' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Tentar fazer uma requisição simples para testar a conexão
    const testUrl = `${url}/instance/connectionState/${instanceId}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      }
    });

    console.log('Evolution API response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Evolution API response data:', data);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Conexão estabelecida com sucesso!',
          data 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const errorText = await response.text();
      console.error('Evolution API error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Erro na conexão: ${response.status} - ${errorText}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status 
        }
      );
    }

  } catch (error) {
    console.error('Error testing connection:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Erro interno: ${error.message}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});