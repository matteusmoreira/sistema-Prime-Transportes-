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
    const { phoneNumber, message } = await req.json();

    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({ success: false, message: 'PhoneNumber e message são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Get Evolution API configurations
    const { data: configuracoes, error: configError } = await supabase
      .from('configuracoes')
      .select('*')
      .single();

    if (configError || !configuracoes) {
      console.error('Erro ao buscar configurações:', configError);
      return new Response(
        JSON.stringify({ success: false, message: 'Configurações da Evolution API não encontradas' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Enviando WhatsApp para:', phoneNumber, 'Mensagem:', message);
    console.log('Configurações Evolution API:', {
      url: configuracoes.evolution_api_url,
      instanceId: configuracoes.evolution_instance_id
    });

    // Send WhatsApp message using Evolution API
    const response = await fetch(`${configuracoes.evolution_api_url}/message/sendText/${configuracoes.evolution_instance_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': configuracoes.evolution_api_key,
      },
      body: JSON.stringify({
        number: phoneNumber,
        text: message,
      }),
    });

    console.log('Evolution API response status:', response.status);
    const responseData = await response.json();
    console.log('Evolution API response data:', responseData);

    if (response.ok) {
      return new Response(
        JSON.stringify({ success: true, message: 'Mensagem enviada com sucesso' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: responseData.message || 'Erro ao enviar mensagem' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Erro na função send-whatsapp-message:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});