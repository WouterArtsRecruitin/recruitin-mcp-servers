const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');

class JobDiggerFileWatcher {
  constructor() {
    this.uploadDir = '/Users/wouterarts/mcp-servers/recruitment-orchestrator/data/uploads/';
    this.supportedFiles = ['.csv', '.xlsx', '.json', '.txt'];
    this.processedFiles = new Set();
    
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`📁 Created upload directory: ${this.uploadDir}`);
    }
  }

  startWatching() {
    console.log(`🚀 JobDigger File Watcher started`);
    console.log(`📁 Watching: ${this.uploadDir}`);
    console.log(`📋 Supported formats: ${this.supportedFiles.join(', ')}`);
    
    fs.watch(this.uploadDir, (eventType, filename) => {
      if (eventType === 'rename' && filename && this.isSupported(filename)) {
        const filePath = path.join(this.uploadDir, filename);
        
        // Check if file exists and hasn't been processed
        if (fs.existsSync(filePath) && !this.processedFiles.has(filename)) {
          console.log(`🚀 JobDigger trigger detected: ${filename}`);
          this.processedFiles.add(filename);
          
          // Small delay to ensure file is fully written
          setTimeout(() => {
            this.processVacancyFile(filename);
          }, 1000);
        }
      }
    });
    
    console.log(`✅ File watcher active. Upload vacancy files to trigger automation.`);
  }

  isSupported(filename) {
    const ext = path.extname(filename).toLowerCase();
    return this.supportedFiles.includes(ext);
  }

  async processVacancyFile(filename) {
    const filePath = path.join(this.uploadDir, filename);
    
    try {
      console.log(`📊 Processing: ${filename}`);
      
      // 1. Parse vacancy data based on file type
      const vacancies = await this.parseVacancyFile(filePath);
      console.log(`📋 Found ${vacancies.length} vacancies`);
      
      // 2. Extract unique companies
      const companies = this.extractCompanies(vacancies);
      console.log(`🏢 Identified ${companies.length} unique companies`);
      
      // 3. Trigger JobDigger QuickScan for each company
      for (const company of companies) {
        console.log(`🎯 Starting workflow for: ${company.name}`);
        await this.triggerJobDiggerFlow(company, vacancies);
      }
      
      // 4. Move processed file to archive
      await this.archiveFile(filename);
      
      console.log(`✅ Successfully processed ${filename} - ${companies.length} companies triggered`);
      
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error.message);
    }
  }

  async parseVacancyFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.csv':
        return await this.parseCSV(filePath);
      case '.xlsx':
        return await this.parseExcel(filePath);
      case '.json':
        return await this.parseJSON(filePath);
      case '.txt':
        return await this.parseText(filePath);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const vacancies = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          vacancies.push(this.normalizeVacancyData(row));
        })
        .on('end', () => {
          resolve(vacancies);
        })
        .on('error', reject);
    });
  }

  async parseExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data.map(row => this.normalizeVacancyData(row));
  }

  async parseJSON(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Handle different JSON structures
    if (data.vacancies && Array.isArray(data.vacancies)) {
      return data.vacancies.map(row => this.normalizeVacancyData(row));
    } else if (Array.isArray(data)) {
      return data.map(row => this.normalizeVacancyData(row));
    } else {
      throw new Error('Invalid JSON structure. Expected array or object with "vacancies" array.');
    }
  }

  async parseText(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Simple text parsing - assumes company names one per line
    return lines.map(line => ({
      company_name: line.trim(),
      contact_email: '',
      contact_name: '',
      position: 'Multiple positions',
      location: 'Netherlands',
      source: 'text_file'
    }));
  }

  normalizeVacancyData(row) {
    return {
      company_name: row.company_name || row.Company || row['Company Name'] || '',
      contact_email: row.contact_email || row.email || row.Email || '',
      contact_name: row.contact_name || row.contact || row.Contact || '',
      phone: row.phone || row.Phone || '',
      position: row.position || row.Position || row.job_title || '',
      location: row.location || row.Location || 'Netherlands',
      salary_min: row.salary_min || row['Salary Min'] || '',
      salary_max: row.salary_max || row['Salary Max'] || '',
      skills: row.skills || row.Skills || '',
      urgency: row.urgency || row.Urgency || 'Medium',
      source: 'jobdigger_upload'
    };
  }

  extractCompanies(vacancies) {
    const companyMap = new Map();
    
    vacancies.forEach(vacancy => {
      if (vacancy.company_name && vacancy.company_name.trim()) {
        const companyName = vacancy.company_name.trim();
        
        if (!companyMap.has(companyName)) {
          companyMap.set(companyName, {
            name: companyName,
            email: vacancy.contact_email || '',
            contact_person: vacancy.contact_name || '',
            phone: vacancy.phone || '',
            vacancies_count: 1,
            positions: [vacancy.position].filter(p => p),
            priority: this.calculatePriority(vacancy)
          });
        } else {
          const company = companyMap.get(companyName);
          company.vacancies_count++;
          if (vacancy.position && !company.positions.includes(vacancy.position)) {
            company.positions.push(vacancy.position);
          }
        }
      }
    });
    
    return Array.from(companyMap.values());
  }

  calculatePriority(vacancy) {
    if (vacancy.urgency && vacancy.urgency.toLowerCase() === 'high') {
      return 'high';
    }
    if (vacancy.salary_max && parseInt(vacancy.salary_max) > 80000) {
      return 'high';
    }
    return 'medium';
  }

  async triggerJobDiggerFlow(company, vacancies) {
    const companyVacancies = vacancies.filter(v => v.company_name === company.name);
    
    const workflow = {
      type: 'jobdigger-quickscan',
      trigger: 'vacancy-upload',
      timestamp: new Date().toISOString(),
      data: {
        company: company,
        vacancies: companyVacancies,
        pipeline_id: 11, // JobDigger QuickScan Pipeline
        stage_id: 74,    // Nieuwe Lead
        estimated_value: 1500
      }
    };

    console.log(`🔄 Executing workflow for ${company.name}...`);
    
    // Execute workflow via MCP (this would integrate with your recruitment-orchestrator)
    await this.executeWorkflow(workflow);
  }

  async executeWorkflow(workflow) {
    // This is where you'd integrate with your MCP servers
    // For now, we'll simulate the workflow and log the actions
    
    console.log(`📋 Workflow Details:`);
    console.log(`   Company: ${workflow.data.company.name}`);
    console.log(`   Vacancies: ${workflow.data.vacancies.length}`);
    console.log(`   Priority: ${workflow.data.company.priority}`);
    
    try {
      // Simulate Pipedrive deal creation
      const dealData = {
        title: `JobDigger QuickScan: ${workflow.data.company.name}`,
        pipeline_id: workflow.data.pipeline_id,
        stage_id: workflow.data.stage_id,
        value: workflow.data.estimated_value,
        currency: 'EUR',
        person_name: workflow.data.company.contact_person,
        person_email: workflow.data.company.email,
        org_name: workflow.data.company.name,
        origin: 'JobDigger File Upload'
      };
      
      console.log(`📊 Would create Pipedrive deal with data:`, JSON.stringify(dealData, null, 2));
      
      // Simulate company research trigger
      console.log(`🔍 Would trigger company research for ${workflow.data.company.name}`);
      
      // Simulate email automation
      if (workflow.data.company.email) {
        console.log(`📧 Would send initial outreach to ${workflow.data.company.email}`);
      }
      
      console.log(`✅ Workflow completed for ${workflow.data.company.name}`);
      
    } catch (error) {
      console.error(`❌ Workflow error for ${workflow.data.company.name}:`, error.message);
    }
  }

  async archiveFile(filename) {
    const sourcePath = path.join(this.uploadDir, filename);
    const archiveDir = path.join(this.uploadDir, 'processed');
    
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivePath = path.join(archiveDir, `${timestamp}_${filename}`);
    
    fs.renameSync(sourcePath, archivePath);
    console.log(`📁 Archived: ${filename} → processed/${timestamp}_${filename}`);
  }

  // Health check endpoint data
  getStatus() {
    return {
      status: 'active',
      upload_directory: this.uploadDir,
      supported_formats: this.supportedFiles,
      processed_files_count: this.processedFiles.size,
      last_check: new Date().toISOString()
    };
  }
}

// Start the file watcher
const watcher = new JobDiggerFileWatcher();
watcher.startWatching();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 JobDigger File Watcher stopped');
  process.exit(0);
});

module.exports = JobDiggerFileWatcher;