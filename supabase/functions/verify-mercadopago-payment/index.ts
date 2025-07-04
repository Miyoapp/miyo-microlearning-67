
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
    const { payment_id, preference_id } = await req.json()
    
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      throw new Error('Token de Mercado Pago no configurado')
    }

    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let paymentStatus = 'pending'
    let paymentId = payment_id

    // If we have a payment_id, get payment details from Mercado Pago
    if (payment_id) {
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (mpResponse.ok) {
        const paymentData = await mpResponse.json()
        paymentStatus = paymentData.status
      }
    }

    // Update transaction in database
    const { data: transaction, error: updateError } = await supabaseClient
      .from('mercadopago_transactions')
      .update({
        payment_id: paymentId,
        status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('preference_id', preference_id)
      .select('user_id, course_id, amount')
      .single()

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      throw new Error('Error al actualizar transacción')
    }

    // If payment is approved, create course purchase record
    if (paymentStatus === 'approved' && transaction) {
      const { error: purchaseError } = await supabaseClient
        .from('compras_cursos')
        .upsert({
          user_id: transaction.user_id,
          curso_id: transaction.course_id,
          monto_pagado: transaction.amount,
          estado_pago: 'completado',
          fecha_compra: new Date().toISOString()
        })

      if (purchaseError) {
        console.error('Error creating purchase record:', purchaseError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentStatus
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
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
