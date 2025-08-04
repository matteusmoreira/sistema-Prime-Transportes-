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

    // 1. Check if motorista already exists
    const { data: existingMotorista } = await supabaseAdmin
      .from('motoristas')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingMotorista) {
      console.log('Motorista already exists:', existingMotorista.id)
      return new Response(
        JSON.stringify({ 
          error: 'Já existe um motorista cadastrado com este email',
          success: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // 2. Check if user exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    let userId = null

    if (existingProfile) {
      console.log('Found existing profile, reusing user_id:', existingProfile.id)
      userId = existingProfile.id
    } else {
      // 3. Create new auth user
      console.log('Creating new auth user...')
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
        throw new Error(`Erro ao criar usuário de autenticação: ${authError.message}`)
      }

      userId = authUser.user.id
      console.log('New auth user created:', userId)
    }

    // 4. Create motorista record
    console.log('Creating motorista record with user_id:', userId)
    const { data: motorista, error: motoristaError } = await supabaseAdmin
      .from('motoristas')
      .insert({
        nome,
        email,
        cpf,
        telefone,
        cnh,
        validade_cnh: validadeCnh,
        user_id: userId,
        status: 'Pendente'
      })
      .select()
      .single()

    if (motoristaError) {
      console.error('Motorista creation error:', motoristaError)
      
      // If motorista creation fails and we created a new user, clean up
      if (!existingProfile) {
        console.log('Cleaning up created auth user due to motorista creation failure')
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      
      throw new Error(`Erro ao criar registro do motorista: ${motoristaError.message}`)
    }

    console.log('Motorista created successfully:', motorista.id)

    const message = existingProfile 
      ? 'Motorista criado com sucesso usando conta existente'
      : 'Conta do motorista criada com sucesso. Senha padrão: @prime2025'

    return new Response(
      JSON.stringify({ 
        success: true, 
        motorista,
        message,
        wasExistingUser: !!existingProfile
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