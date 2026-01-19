import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `Diaconia AD Alpha <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email enviado:', info.messageId);
    } catch (error: any) {
      console.error('❌ Erro ao enviar email:', error.message);
      throw error;
    }
  }

  async sendWelcomeEmail(name: string, email: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🙏 Bem-vindo à Diaconia AD Alpha!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            <p>É com grande alegria que te damos as boas-vindas ao nosso sistema de gestão!</p>
            <p>Agora você tem acesso a:</p>
            <ul>
              <li>📚 Cursos e treinamentos</li>
              <li>📅 Escalas e designações</li>
              <li>💬 Comunicações internas</li>
              <li>📢 Avisos importantes</li>
              <li>👥 Comunidade</li>
            </ul>
            <p>Estamos felizes em tê-lo(a) conosco neste ministério!</p>
            <a href="${process.env.FRONTEND_URL}" class="button">Acessar Plataforma</a>
          </div>
          <div class="footer">
            <p>Diaconia AD Alpha - Servindo com amor e dedicação</p>
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: '🙏 Bem-vindo à Diaconia AD Alpha!',
      html,
    });
  }

  async sendPasswordResetEmail(name: string, email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Recuperação de Senha</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
            <div class="warning">
              <strong>⚠️ Atenção:</strong> Este link é válido por apenas 1 hora. Se você não solicitou esta alteração, ignore este email.
            </div>
            <p>Por segurança, nunca compartilhe sua senha com ninguém.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: '🔐 Recuperação de Senha - Diaconia AD Alpha',
      html,
    });
  }

  async sendScheduleNotification(name: string, email: string, schedule: any): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .schedule-box { background: white; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Nova Escala Designada</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            <p>Você foi designado(a) para uma nova escala:</p>
            <div class="schedule-box">
              <h3>${schedule.title}</h3>
              <p><strong>📅 Data:</strong> ${new Date(schedule.date).toLocaleDateString('pt-BR')}</p>
              <p><strong>⏰ Horário:</strong> ${schedule.startTime} - ${schedule.endTime}</p>
              <p><strong>🎯 Função:</strong> ${schedule.function}</p>
              ${schedule.notes ? `<p><strong>📝 Observações:</strong> ${schedule.notes}</p>` : ''}
            </div>
            <p>Por favor, confirme sua presença o quanto antes.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: '📅 Nova Designação de Escala - Diaconia AD Alpha',
      html,
    });
  }
}

export default new EmailService();
