import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, nome, cpf, telefone, cnh, validadeCnh } = await req.json()

    console.log('Creating motorista account for:', email)

    // Create auth user with default password
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: '@prime2025',
      email_confirm: true,
      user_metadata: {
        nome,
        role: 'Motorista'
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      throw authError
    }

    console.log('Auth user created:', authUser.user?.id)

    // Create motorista record
    const { data: motorista, error: motoristaError } = await supabaseAdmin
      .from('motoristas')
      .insert({
        nome,
        email,
        cpf,
        telefone,
        cnh,
        validade_cnh: validadeCnh,
        user_id: authUser.user.id,
        status: 'Pendente'
      })
      .select()
      .single()

    if (motoristaError) {
      console.error('Motorista creation error:', motoristaError)
      // If motorista creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw motoristaError
    }

    console.log('Motorista created successfully:', motorista.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        motorista,
        message: 'Conta do motorista criada com sucesso. Senha padrão: @prime2025'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error creating motorista account:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})