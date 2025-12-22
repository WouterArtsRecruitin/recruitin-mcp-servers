import nodemailer from 'nodemailer';

interface EmailData {
  subject: string;
  body: string;
  framework: string;
  tone: string;
  effectiveness_score: number;
}

interface SendEmailParams {
  to_email: string;
  to_name: string;
  from_name?: string;
  from_email?: string;
  subject: string;
  body: string;
  schedule_date?: string; // ISO date string for scheduling
}

interface EmailSendResult {
  success: boolean;
  message_id?: string;
  error?: string;
  scheduled?: boolean;
  delivery_time?: string;
}

export class EmailSender {
  private transporter: any;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Use environment variables for email configuration
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || process.env.GOOGLE_EMAIL,
        pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD,
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendEmailSequence(
    deal_id: string,
    emailSequence: EmailData[],
    recipient: { email: string; name: string; company: string },
    sender: { name: string; email: string },
    send_immediately: boolean = false
  ): Promise<{ success: boolean; results: EmailSendResult[]; errors: string[] }> {
    const results: EmailSendResult[] = [];
    const errors: string[] = [];

    try {
      // If send_immediately is true, send first email now, schedule others
      // If false, just schedule all emails according to strategy timing
      
      for (let i = 0; i < emailSequence.length; i++) {
        const email = emailSequence[i];
        const emailNumber = i + 1;
        
        // Calculate schedule time based on email sequence timing
        const scheduleDate = this.calculateScheduleDate(emailNumber, send_immediately);
        
        try {
          if (send_immediately && emailNumber === 1) {
            // Send first email immediately
            const result = await this.sendEmail({
              to_email: recipient.email,
              to_name: recipient.name,
              from_email: sender.email,
              from_name: sender.name,
              subject: email.subject,
              body: email.body
            });
            results.push(result);
          } else {
            // Schedule email for later (in a real system, this would use a job queue)
            const result = await this.scheduleEmail({
              to_email: recipient.email,
              to_name: recipient.name,
              from_email: sender.email,
              from_name: sender.name,
              subject: email.subject,
              body: email.body,
              schedule_date: scheduleDate
            });
            results.push(result);
          }
        } catch (error: any) {
          errors.push(`Email ${emailNumber}: ${error.message}`);
          results.push({
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: errors.length === 0,
        results,
        errors
      };

    } catch (error: any) {
      return {
        success: false,
        results,
        errors: [error.message]
      };
    }
  }

  async sendEmail(params: SendEmailParams): Promise<EmailSendResult> {
    try {
      const mailOptions = {
        from: `${params.from_name || 'Wouter van der Linden'} <${params.from_email || process.env.EMAIL_USER}>`,
        to: `${params.to_name} <${params.to_email}>`,
        subject: params.subject,
        html: this.formatEmailHTML(params.body),
        text: this.formatEmailText(params.body)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        message_id: info.messageId,
        delivery_time: new Date().toISOString()
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async scheduleEmail(params: SendEmailParams): Promise<EmailSendResult> {
    // In a production system, this would use a job queue like Bull, Agenda, or cloud scheduling
    // For now, we'll simulate scheduling by logging the intention
    
    try {
      const scheduleTime = params.schedule_date ? new Date(params.schedule_date) : new Date();
      
      // Log the scheduled email (in production, this would be stored in a queue)
      console.log(`📅 Email scheduled for ${scheduleTime.toISOString()}`);
      console.log(`   To: ${params.to_name} <${params.to_email}>`);
      console.log(`   Subject: ${params.subject}`);
      
      return {
        success: true,
        scheduled: true,
        delivery_time: scheduleTime.toISOString()
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private calculateScheduleDate(emailNumber: number, sendFirstImmediately: boolean): string {
    const now = new Date();
    
    // Standard timing based on your proven sequence strategy
    const dayDelays = {
      1: 0,   // immediate
      2: 7,   // 7 days
      3: 14,  // 14 days 
      4: 21,  // 21 days
      5: 35,  // 35 days
      6: 49   // 49 days
    };

    const delay = dayDelays[emailNumber as keyof typeof dayDelays] || 0;
    
    if (emailNumber === 1 && sendFirstImmediately) {
      return now.toISOString();
    }
    
    const scheduleDate = new Date(now.getTime() + (delay * 24 * 60 * 60 * 1000));
    return scheduleDate.toISOString();
  }

  private formatEmailHTML(body: string): string {
    // Convert plain text body to HTML with basic formatting
    return body
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  private formatEmailText(body: string): string {
    // Clean up any HTML and return plain text
    return body
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}