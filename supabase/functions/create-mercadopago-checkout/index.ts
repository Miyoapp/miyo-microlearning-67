
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { courseId, amount, currency = 'ARS' } = await req.json()
    
    // 🔍 Debug: Log received headers and authentication
    const authHeader = req.headers.get('Authorization')
    console.log('🔐 Backend Auth Debug:', {
      hasAuthHeader: !!authHeader,
      authHeaderFormat: authHeader ? authHeader.substring(0, 20) + '...' : 'None',
      userAgent: req.headers.get('User-Agent'),
      origin: req.headers.get('origin')
    })
    
    if (!authHeader) {
      console.error('❌ No Authorization header found in request')
      throw new Error('Authorization header requerido')
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    console.log('👤 User authentication result:', {
      hasUser: !!user,
      userId: user?.id,
      userError: userError?.message
    })
    
    if (!user) {
      console.error('❌ Usuario no autenticado:', userError)
      throw new Error('Usuario no autenticado')
    }

    // Get course details
    const { data: course, error: courseError } = await supabaseClient
      .from('cursos')
      .select('titulo, precio, moneda')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      console.error('❌ Course not found:', { courseId, courseError })
      throw new Error('Curso no encontrado')
    }

    console.log('📚 Course found:', { courseId, title: course.titulo, price: course.precio })

    // Create preference with Mercado Pago
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    console.log('💳 MercadoPago token check:', {
      hasToken: !!accessToken,
      tokenLength: accessToken ? accessToken.length : 0
    })
    
    if (!accessToken) {
      console.error('❌ MercadoPago token not configured')
      throw new Error('Token de Mercado Pago no configurado')
    }

    const preference = {
      items: [{
        title: course.titulo,
        quantity: 1,
        unit_price: amount || course.precio,
        currency_id: currency
      }],
      back_urls: {
        success: `${req.headers.get('origin')}/payment/success`,
        failure: `${req.headers.get('origin')}/payment/failure`,
        pending: `${req.headers.get('origin')}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: `${user.id}|${courseId}`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-mercadopago-payment`
    }

    console.log('💳 Creating MercadoPago preference:', {
      external_reference: preference.external_reference,
      amount: preference.items[0].unit_price,
      currency: preference.items[0].currency_id
    })

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    })

    if (!mpResponse.ok) {
      const error = await mpResponse.text()
      console.error('❌ Error creating MP preference:', error)
      throw new Error('Error al crear preferencia de pago')
    }

    const preferenceData = await mpResponse.json()
    console.log('✅ MercadoPago preference created:', {
      preferenceId: preferenceData.id,
      initPoint: preferenceData.init_point
    })

    // Save transaction in database
    const { error: dbError } = await supabaseClient
      .from('mercadopago_transactions')
      .insert({
        user_id: user.id,
        course_id: courseId,
        preference_id: preferenceData.id,
        amount: amount || course.precio,
        currency: currency,
        status: 'pending'
      })

    if (dbError) {
      console.error('❌ Error saving transaction:', dbError)
      throw new Error('Error al guardar transacción')
    }

    console.log('✅ Transaction saved successfully')

    return new Response(
      JSON.stringify({
        success: true,
        init_point: preferenceData.init_point,
        preference_id: preferenceData.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
