import nodemailer from 'nodemailer';

// Configurar transporte de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Enviar notificação de login
export const sendLoginNotification = async (
  email: string,
  username: string,
  role: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"CINEMA FODÁSTICO" <noreply@cinemafodastico.com>',
    to: email,
    subject: '🎬 Notificação de Login - CINEMA FODÁSTICO',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px 20px;
          }
          .info-box {
            background: #f9fafb;
            border-left: 4px solid #9333ea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box p {
            margin: 5px 0;
          }
          .info-label {
            font-weight: bold;
            color: #7e22ce;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            background: ${role === 'admin' ? '#ef4444' : '#3b82f6'};
            color: white;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 CINEMA FODÁSTICO</h1>
            <p style="margin-top: 10px; font-size: 16px;">Notificação de Acesso</p>
          </div>
          
          <div class="content">
            <p>Olá, <strong>${username}</strong>!</p>
            
            <p>Um login foi realizado na sua conta do CINEMA FODÁSTICO.</p>
            
            <div class="info-box">
              <p><span class="info-label">👤 Usuário:</span> ${username}</p>
              <p><span class="info-label">📧 E-mail:</span> ${email}</p>
              <p><span class="info-label">🎭 Perfil:</span> <span class="badge">${role === 'admin' ? 'Administrador' : 'Usuário Comum'}</span></p>
              <p><span class="info-label">🕐 Data/Hora:</span> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
            </div>
            
            <p><strong>Se você não reconhece este acesso</strong>, entre em contato com o suporte imediatamente.</p>
            
            <p style="margin-top: 30px;">Aproveite sua experiência!</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} CINEMA FODÁSTICO - Todos os direitos reservados</p>
            <p>Esta é uma mensagem automática, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    // Não lança erro para não bloquear o login se o e-mail falhar
  }
};
