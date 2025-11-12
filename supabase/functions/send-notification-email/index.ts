import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email templates
const getEmailTemplate = (type: string, data: any): string => {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://digiproplat.com'
  
  switch (type) {
    case 'order_confirmation': {
      const { productName, orderId, amount, downloadLinks } = data
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Thank you for your purchase!</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Product:</strong> ${productName}</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            </div>
            ${downloadLinks && downloadLinks.length > 0 ? `
              <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Download Links:</h3>
                ${downloadLinks.map((link: string, index: number) => `
                  <p><a href="${link}" style="color: #667eea; text-decoration: none;">Download File ${index + 1}</a></p>
                `).join('')}
                <p style="font-size: 12px; color: #666; margin-top: 15px;">
                  Note: Download links expire in 7 days and have a maximum of 5 downloads.
                </p>
              </div>
            ` : ''}
            <p style="margin-top: 30px;">
              <a href="${baseUrl}/orders" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Order History
              </a>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} DigiProPlat. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    }
    
    case 'download_links': {
      const { productName, downloadLinks } = data
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Download Links</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
            <h2>Your Download Links</h2>
            <p>Here are your download links for <strong>${productName}</strong>:</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              ${downloadLinks.map((link: string, index: number) => `
                <p><a href="${link}" style="color: #667eea; text-decoration: none; font-weight: bold;">Download File ${index + 1}</a></p>
              `).join('')}
            </div>
            <p style="font-size: 12px; color: #666;">
              Links expire in 7 days. Maximum 5 downloads per link.
            </p>
          </div>
        </body>
        </html>
      `
    }
    
    case 'welcome': {
      const { userName } = data
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to DigiProPlat</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to DigiProPlat!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${userName || 'there'},</p>
            <p>Welcome to DigiProPlat! We're excited to have you join our community of digital product creators and buyers.</p>
            <p>Get started by:</p>
            <ul>
              <li>Exploring our marketplace for amazing digital products</li>
              <li>Creating and selling your own digital products</li>
              <li>Building beautiful landing pages for your products</li>
            </ul>
            <p style="margin-top: 30px;">
              <a href="${baseUrl}/marketplace" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Explore Marketplace
              </a>
            </p>
          </div>
        </body>
        </html>
      `
    }
    
    case 'payment_receipt': {
      const { orderId, amount, productName, paymentDate } = data
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Receipt</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
            <h2>Payment Receipt</h2>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Product:</strong> ${productName}</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Date:</strong> ${new Date(paymentDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span style="color: green;">Paid</span></p>
            </div>
            <p>Thank you for your purchase!</p>
          </div>
        </body>
        </html>
      `
    }
    
    case 'sale_notification': {
      const { productName, buyerName, amount } = data
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Sale!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎉 New Sale!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Congratulations! You have a new sale:</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Product:</strong> ${productName}</p>
              <p><strong>Buyer:</strong> ${buyerName}</p>
              <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
              <p><strong>Your Earnings:</strong> $${(amount * 0.9).toFixed(2)} (90% after platform fee)</p>
            </div>
            <p style="margin-top: 30px;">
              <a href="${baseUrl}/dashboard" style="background: #11998e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Dashboard
              </a>
            </p>
          </div>
        </body>
        </html>
      `
    }
    
    default:
      return html || `<p>${data.message || 'You have a new notification from DigiProPlat.'}</p>`
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, type, data = {} } = await req.json()

    if (!to || !subject) {
      throw new Error('Missing required fields: to and subject')
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not set. Email will not be sent.')
      // In development, log the email instead
      console.log('Would send email:', { to, subject, type })
      return new Response(
        JSON.stringify({ success: false, message: 'RESEND_API_KEY not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    // Generate HTML from template if type is provided
    const emailHtml = type ? getEmailTemplate(type, data) : html

    if (!emailHtml) {
      throw new Error('Missing email content (html or type required)')
    }

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DigiProPlat <noreply@digiproplat.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(errorData.message || `Resend API error: ${response.status}`)
    }

    const result = await response.json()

    console.log('Email sent successfully:', { to, subject, type, id: result.id })

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully', id: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send email' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})