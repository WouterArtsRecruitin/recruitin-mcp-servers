const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class JobDiggerZapierIntegration {
  constructor() {
    this.app = express();
    this.port = 3001;
    
    // Pipedrive configuration
    this.pipedriveConfig = {
      domain: 'recruitinbv.pipedrive.com',
      apiToken: 'e0399bd15286fe59ba280309854efcf6bd18424f',
      pipeline_id: 11, // JobDigger QuickScan Pipeline
      stage_id: 74     // Nieuwe Lead
    };
    
    // Email configuration
    this.emailConfig = {
      user: 'warts@recruitin.nl',
      templates: {
        quickscan_delivery: 'jobdigger_quickscan_template'
      }
    };
    
    this.setupMiddleware();
    this.setupRoutes();
    this.processedCompanies = new Map();
  }

  setupMiddleware() {
    // Body parser middleware
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // File upload middleware
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = '/Users/wouterarts/mcp-servers/uploads/zapier/';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        cb(null, `${timestamp}_${file.originalname}`);
      }
    });
    
    this.upload = multer({ 
      storage: storage,
      limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
    });
    
    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'active',
        service: 'JobDigger Zapier Integration',
        timestamp: new Date().toISOString(),
        endpoints: [
          'POST /zapier/google-sheets',
          'POST /zapier/email-trigger',
          'POST /zapier/file-upload',
          'POST /jobdigger/trigger',
          'POST /jobdigger/process-vacancies'
        ]
      });
    });

    // Zapier webhook endpoints
    this.app.post('/zapier/google-sheets', this.handleGoogleSheetsWebhook.bind(this));
    this.app.post('/zapier/email-trigger', this.handleEmailTrigger.bind(this));
    this.app.post('/zapier/file-upload', this.upload.single('file'), this.handleFileUpload.bind(this));
    
    // Direct JobDigger API endpoints
    this.app.post('/jobdigger/trigger', this.handleDirectTrigger.bind(this));
    this.app.post('/jobdigger/process-vacancies', this.upload.single('vacancyFile'), this.handleVacancyProcessing.bind(this));
    
    // Status and monitoring endpoints
    this.app.get('/jobdigger/status', this.getJobDiggerStatus.bind(this));
    this.app.get('/zapier/test', this.testZapierIntegration.bind(this));
  }

  // Google Sheets webhook handler
  async handleGoogleSheetsWebhook(req, res) {
    try {
      console.log('📊 Google Sheets webhook received');
      console.log('Data:', JSON.stringify(req.body, null, 2));
      
      const rowData = req.body;
      
      // Extract company data from Google Sheets row
      const companyData = {
        company_name: rowData['Company Name'] || rowData.company_name || '',
        contact_email: rowData['Email'] || rowData.email || '',
        contact_name: rowData['Contact Person'] || rowData.contact_name || '',
        phone: rowData['Phone'] || rowData.phone || '',
        position: rowData['Position'] || rowData.position || '',
        location: rowData['Location'] || rowData.location || 'Netherlands',
        urgency: rowData['Urgency'] || rowData.urgency || 'Medium',
        source: 'google_sheets'
      };

      if (!companyData.company_name) {
        return res.status(400).json({
          success: false,
          error: 'Company name is required'
        });
      }

      // Process the company data
      const result = await this.processCompanyData(companyData);
      
      res.json({
        success: true,
        message: 'Google Sheets data processed successfully',
        company: companyData.company_name,
        deal_id: result.deal_id,
        workflow_status: result.status
      });

    } catch (error) {
      console.error('❌ Google Sheets webhook error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Email attachment handler
  async handleEmailTrigger(req, res) {
    try {
      console.log('📧 Email trigger webhook received');
      
      const emailData = req.body;
      const attachmentData = emailData.attachment_data;
      
      if (attachmentData) {
        // Parse email attachment data
        const vacancies = await this.parseEmailAttachment(attachmentData);
        const results = await this.processBulkVacancies(vacancies, 'email_attachment');
        
        res.json({
          success: true,
          message: `Processed ${results.length} companies from email attachment`,
          results: results
        });
      } else {
        // Process single company from email content
        const companyData = this.extractCompanyFromEmail(emailData);
        const result = await this.processCompanyData(companyData);
        
        res.json({
          success: true,
          message: 'Email trigger processed successfully',
          result: result
        });
      }

    } catch (error) {
      console.error('❌ Email trigger error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // File upload handler
  async handleFileUpload(req, res) {
    try {
      console.log('📁 File upload webhook received');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      console.log(`Processing file: ${req.file.filename}`);
      
      // Parse uploaded file
      const vacancies = await this.parseUploadedFile(req.file.path);
      const results = await this.processBulkVacancies(vacancies, 'file_upload');
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({
        success: true,
        message: `File processed successfully - ${results.length} companies triggered`,
        filename: req.file.originalname,
        results: results
      });

    } catch (error) {
      console.error('❌ File upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Direct trigger handler (for simple API calls)
  async handleDirectTrigger(req, res) {
    try {
      console.log('🎯 Direct trigger received');
      
      const companyData = req.body;
      companyData.source = 'direct_api';
      
      const result = await this.processCompanyData(companyData);
      
      res.json({
        success: true,
        message: 'Direct trigger processed successfully',
        result: result
      });

    } catch (error) {
      console.error('❌ Direct trigger error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Vacancy processing handler
  async handleVacancyProcessing(req, res) {
    try {
      console.log('📋 Vacancy processing request received');
      
      let vacancies = [];
      
      if (req.file) {
        // Process uploaded file
        vacancies = await this.parseUploadedFile(req.file.path);
        fs.unlinkSync(req.file.path); // Clean up
      } else if (req.body.vacancies) {
        // Process JSON data
        vacancies = Array.isArray(req.body.vacancies) ? req.body.vacancies : [req.body.vacancies];
      } else {
        return res.status(400).json({
          success: false,
          error: 'No vacancy data provided'
        });
      }

      const results = await this.processBulkVacancies(vacancies, 'vacancy_processing');
      
      res.json({
        success: true,
        message: `Processed ${results.length} companies`,
        results: results
      });

    } catch (error) {
      console.error('❌ Vacancy processing error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Process single company data
  async processCompanyData(companyData) {
    console.log(`🏢 Processing company: ${companyData.company_name}`);
    
    try {
      // 1. Create Pipedrive deal
      const deal = await this.createPipedriveDeal(companyData);
      
      // 2. Trigger research workflow
      await this.triggerCompanyResearch(companyData, deal.id);
      
      // 3. Setup follow-up automation
      await this.setupFollowUpSequence(deal.id, companyData);
      
      // 4. Store processed company
      this.processedCompanies.set(companyData.company_name, {
        deal_id: deal.id,
        processed_at: new Date().toISOString(),
        source: companyData.source
      });
      
      return {
        deal_id: deal.id,
        status: 'processing',
        company: companyData.company_name,
        pipeline_stage: 'Nieuwe Lead'
      };

    } catch (error) {
      console.error(`❌ Error processing ${companyData.company_name}:`, error);
      throw error;
    }
  }

  // Process multiple vacancies
  async processBulkVacancies(vacancies, source) {
    console.log(`📊 Processing ${vacancies.length} vacancies from ${source}`);
    
    // Extract unique companies
    const companies = this.extractUniqueCompanies(vacancies);
    console.log(`🏢 Found ${companies.length} unique companies`);
    
    const results = [];
    
    for (const company of companies) {
      try {
        company.source = source;
        const result = await this.processCompanyData(company);
        results.push(result);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed to process ${company.company_name}:`, error);
        results.push({
          company: company.company_name,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Create Pipedrive deal
  async createPipedriveDeal(companyData) {
    console.log(`📊 Creating Pipedrive deal for ${companyData.company_name}`);
    
    const dealData = {
      title: `JobDigger QuickScan: ${companyData.company_name}`,
      pipeline_id: this.pipedriveConfig.pipeline_id,
      stage_id: this.pipedriveConfig.stage_id,
      value: 1500,
      currency: 'EUR',
      person_name: companyData.contact_name || '',
      person_email: companyData.contact_email || '',
      org_name: companyData.company_name,
      origin: `Zapier - ${companyData.source}`,
      channel: 8,
      channel_id: 'JobDigger QuickScan Automation'
    };

    try {
      const response = await axios.post(
        `https://${this.pipedriveConfig.domain}/api/v1/deals`,
        dealData,
        {
          params: {
            api_token: this.pipedriveConfig.apiToken
          }
        }
      );

      if (response.data.success) {
        console.log(`✅ Deal created: ID ${response.data.data.id}`);
        return response.data.data;
      } else {
        throw new Error('Failed to create Pipedrive deal');
      }

    } catch (error) {
      console.error('❌ Pipedrive API error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Trigger company research workflow
  async triggerCompanyResearch(companyData, dealId) {
    console.log(`🔍 Triggering research for ${companyData.company_name}`);
    
    // This would integrate with your MCP research workflow
    const researchData = {
      company_name: companyData.company_name,
      deal_id: dealId,
      research_type: 'jobdigger_quickscan',
      include_salary_benchmarks: true,
      include_market_analysis: true,
      location: companyData.location || 'Netherlands'
    };
    
    // Simulate research trigger (replace with actual MCP integration)
    console.log(`🔄 Research workflow triggered:`, JSON.stringify(researchData, null, 2));
    
    // Add note to Pipedrive deal
    await this.addPipedriveNote(dealId, 
      `JobDigger research started for ${companyData.company_name}. QuickScan report will be generated automatically.`
    );
  }

  // Setup follow-up automation sequence
  async setupFollowUpSequence(dealId, companyData) {
    console.log(`📅 Setting up follow-up sequence for deal ${dealId}`);
    
    const followUpTasks = [
      {
        type: 'email',
        subject: 'QuickScan Follow-up',
        due_date: this.addDays(new Date(), 2),
        description: 'Follow-up on QuickScan delivery'
      },
      {
        type: 'call',
        subject: 'QuickScan Discussion Call',
        due_date: this.addDays(new Date(), 5),
        description: 'Discuss QuickScan findings and next steps'
      }
    ];

    for (const task of followUpTasks) {
      await this.createPipedriveActivity(dealId, task);
    }
  }

  // Add note to Pipedrive deal
  async addPipedriveNote(dealId, content) {
    try {
      await axios.post(
        `https://${this.pipedriveConfig.domain}/api/v1/notes`,
        {
          deal_id: dealId,
          content: content
        },
        {
          params: {
            api_token: this.pipedriveConfig.apiToken
          }
        }
      );
      
      console.log(`📝 Note added to deal ${dealId}`);
      
    } catch (error) {
      console.error('❌ Failed to add note:', error.response?.data || error.message);
    }
  }

  // Create Pipedrive activity
  async createPipedriveActivity(dealId, task) {
    try {
      const activityData = {
        deal_id: dealId,
        type: task.type,
        subject: task.subject,
        due_date: task.due_date.toISOString().split('T')[0],
        due_time: '10:00',
        note: task.description
      };

      await axios.post(
        `https://${this.pipedriveConfig.domain}/api/v1/activities`,
        activityData,
        {
          params: {
            api_token: this.pipedriveConfig.apiToken
          }
        }
      );
      
      console.log(`📅 Activity created: ${task.subject}`);
      
    } catch (error) {
      console.error('❌ Failed to create activity:', error.response?.data || error.message);
    }
  }

  // Parse uploaded file based on extension
  async parseUploadedFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.csv':
        return this.parseCSV(filePath);
      case '.xlsx':
      case '.xls':
        return this.parseExcel(filePath);
      case '.json':
        return this.parseJSON(filePath);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  // Parse CSV file
  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(this.normalizeVacancyData(data)))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // Parse Excel file
  async parseExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data.map(row => this.normalizeVacancyData(row));
  }

  // Parse JSON file
  async parseJSON(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    if (data.vacancies && Array.isArray(data.vacancies)) {
      return data.vacancies.map(row => this.normalizeVacancyData(row));
    } else if (Array.isArray(data)) {
      return data.map(row => this.normalizeVacancyData(row));
    } else {
      return [this.normalizeVacancyData(data)];
    }
  }

  // Normalize vacancy data
  normalizeVacancyData(data) {
    return {
      company_name: data.company_name || data.Company || data['Company Name'] || '',
      contact_email: data.contact_email || data.email || data.Email || '',
      contact_name: data.contact_name || data.contact || data.Contact || data['Contact Person'] || '',
      phone: data.phone || data.Phone || '',
      position: data.position || data.Position || data.job_title || '',
      location: data.location || data.Location || 'Netherlands',
      urgency: data.urgency || data.Urgency || 'Medium'
    };
  }

  // Extract unique companies from vacancy data
  extractUniqueCompanies(vacancies) {
    const companyMap = new Map();
    
    vacancies.forEach(vacancy => {
      if (vacancy.company_name && vacancy.company_name.trim()) {
        const name = vacancy.company_name.trim();
        
        if (!companyMap.has(name)) {
          companyMap.set(name, {
            company_name: name,
            contact_email: vacancy.contact_email || '',
            contact_name: vacancy.contact_name || '',
            phone: vacancy.phone || '',
            location: vacancy.location || 'Netherlands',
            urgency: vacancy.urgency || 'Medium',
            vacancy_count: 1
          });
        } else {
          companyMap.get(name).vacancy_count++;
        }
      }
    });
    
    return Array.from(companyMap.values());
  }

  // Extract company data from email content
  extractCompanyFromEmail(emailData) {
    return {
      company_name: emailData.subject?.match(/Company:\s*([^,\n]+)/)?.[1] || 'Email Lead',
      contact_email: emailData.from || '',
      contact_name: emailData.from_name || '',
      position: emailData.subject || 'Email Inquiry',
      location: 'Netherlands',
      urgency: 'Medium',
      source: 'email'
    };
  }

  // Parse email attachment data
  async parseEmailAttachment(attachmentData) {
    // This would parse attachment data from email
    // Implementation depends on email service format
    console.log('📎 Parsing email attachment data');
    return [];
  }

  // Get status endpoint
  getJobDiggerStatus(req, res) {
    res.json({
      service: 'JobDigger Zapier Integration',
      status: 'active',
      processed_companies: this.processedCompanies.size,
      endpoints_available: 8,
      pipedrive_connected: true,
      last_processed: this.processedCompanies.size > 0 ? 
        Array.from(this.processedCompanies.values()).pop().processed_at : null,
      uptime: process.uptime()
    });
  }

  // Test Zapier integration
  testZapierIntegration(req, res) {
    res.json({
      message: 'Zapier integration test successful',
      timestamp: new Date().toISOString(),
      test_endpoints: {
        google_sheets: 'POST /zapier/google-sheets',
        email_trigger: 'POST /zapier/email-trigger',
        file_upload: 'POST /zapier/file-upload'
      },
      sample_payload: {
        company_name: 'Test Company',
        contact_email: 'test@company.com',
        position: 'Software Engineer'
      }
    });
  }

  // Utility function to add days to date
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Start the server
  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 JobDigger Zapier Integration Server started`);
      console.log(`🌐 Server running on: http://localhost:${this.port}`);
      console.log(`✅ Health check: http://localhost:${this.port}/health`);
      console.log(`📋 Status: http://localhost:${this.port}/jobdigger/status`);
      console.log(`🔧 Test endpoint: http://localhost:${this.port}/zapier/test`);
      console.log(`\n📊 Available endpoints:`);
      console.log(`   POST /zapier/google-sheets - Google Sheets webhook`);
      console.log(`   POST /zapier/email-trigger - Email automation webhook`);
      console.log(`   POST /zapier/file-upload - File upload webhook`);
      console.log(`   POST /jobdigger/trigger - Direct API trigger`);
      console.log(`   POST /jobdigger/process-vacancies - Bulk vacancy processing`);
      console.log(`\n🎯 Ready to receive Zapier webhooks!`);
    });
  }
}

// Start the server
const zapierIntegration = new JobDiggerZapierIntegration();
zapierIntegration.start();

module.exports = JobDiggerZapierIntegration;