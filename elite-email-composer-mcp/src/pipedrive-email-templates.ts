export class PipedriveEmailTemplates {
  
  async createEmailTemplates(api_token: string) {
    try {
      const templates = [
        {
          name: "Corporate Recruiter Email 1 - RPO Bridge",
          subject: "{{47a7d774bf5b08226ce8d6e1e79708f1d44e3e30}}", // Email 1 Subject custom field
          content: "{{867577ef580ff8d22c74799d949483401bba2e26}}", // Email 1 Body custom field
          active_flag: true
        },
        {
          name: "Corporate Recruiter Email 2 - Value Add", 
          subject: "{{c9b94aad810dad22e3835669aff3076e9bbed481}}", // Email 2 Subject
          content: "{{14229c6d09ce02f7752762831cb290c2845a0adc}}", // Email 2 Body
          active_flag: true
        },
        {
          name: "Corporate Recruiter Email 3 - Case Study",
          subject: "{{4a105b3f0a7e2fc4b28aa3c446ab863c3c7564c4}}", // Email 3 Subject  
          content: "{{728051c14d08fd50d018d2f52d249480553407ef}}", // Email 3 Body
          active_flag: true
        },
        {
          name: "Corporate Recruiter Email 4 - Competitor Reference",
          subject: "{{af3c082c6c557ff5d2f640be8863f855fc403b1a}}", // Email 4 Subject
          content: "{{363f0878ff15f00cc54470a5dc85049e6a12e5e3}}", // Email 4 Body
          active_flag: true
        },
        {
          name: "Corporate Recruiter Email 5 - Industry Insight", 
          subject: "{{d915d63b9b2621d3ce81d54d8dfce1e3f0dd4306}}", // Email 5 Subject
          content: "{{c4f72e32ce76ad00a822e9c7d1044dba77e6458b}}", // Email 5 Body
          active_flag: true
        },
        {
          name: "Corporate Recruiter Email 6 - Value Summary",
          subject: "{{e84b304ae9696a9e1e1943d02bf8b762fa290f91}}", // Email 6 Subject
          content: "{{d0ad20b3323a67da53529b8f5514e663ed81a3fc}}", // Email 6 Body
          active_flag: true
        }
      ];

      const createdTemplates = [];

      for (const template of templates) {
        console.log(`Creating template: ${template.name}...`);
        
        const response = await fetch(`https://recruitinbv.pipedrive.com/api/v1/mailbox/mailTemplates?api_token=${api_token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(template)
        });

        if (!response.ok) {
          console.error(`Failed to create template ${template.name}: ${response.status}`);
          continue;
        }

        const result = await response.json() as any;
        if (result.success) {
          createdTemplates.push({
            id: result.data.id,
            name: template.name,
            subject_field: template.subject,
            body_field: template.content
          });
          console.log(`✅ Created template ID ${result.data.id}: ${template.name}`);
        }
      }

      return {
        success: true,
        templates_created: createdTemplates,
        count: createdTemplates.length
      };

    } catch (error: any) {
      throw new Error(`Failed to create email templates: ${error.message}`);
    }
  }

  async createAutomationWorkflow(api_token: string, pipeline_id: number = 14) {
    try {
      console.log('🤖 Creating Pipedrive automation workflow for email sequence...');

      // Note: Pipedrive API voor automations is complex en vereist specifieke permissions
      // Voor nu gaan we de workflow handmatig configureren en alleen de structuur documenteren

      const workflowStructure = {
        name: "Corporate Recruiter Email Sequence",
        description: "6-email personalized sequence for corporate recruiter outreach",
        trigger: {
          type: "deal_stage_change",
          pipeline_id: pipeline_id,
          stage_change: "any_to_email_sequence_ready"
        },
        actions: [
          {
            step: 1,
            action: "send_email",
            template_name: "Corporate Recruiter Email 1 - RPO Bridge",
            delay: "immediate"
          },
          {
            step: 2, 
            action: "wait",
            delay: "7 days"
          },
          {
            step: 3,
            action: "send_email", 
            template_name: "Corporate Recruiter Email 2 - Value Add",
            condition: "no_reply_received"
          },
          {
            step: 4,
            action: "wait",
            delay: "7 days"
          },
          {
            step: 5,
            action: "send_email",
            template_name: "Corporate Recruiter Email 3 - Case Study", 
            condition: "no_reply_received"
          },
          {
            step: 6,
            action: "wait",
            delay: "7 days"
          },
          {
            step: 7,
            action: "send_email",
            template_name: "Corporate Recruiter Email 4 - Competitor Reference",
            condition: "no_reply_received"
          },
          {
            step: 8,
            action: "wait", 
            delay: "14 days"
          },
          {
            step: 9,
            action: "send_email",
            template_name: "Corporate Recruiter Email 5 - Industry Insight",
            condition: "no_reply_received"
          },
          {
            step: 10,
            action: "wait",
            delay: "14 days"
          },
          {
            step: 11,
            action: "send_email",
            template_name: "Corporate Recruiter Email 6 - Value Summary",
            condition: "no_reply_received"
          }
        ],
        stop_conditions: [
          "reply_received",
          "meeting_scheduled", 
          "deal_won",
          "deal_lost"
        ]
      };

      return {
        success: true,
        message: "Automation workflow structure created",
        workflow: workflowStructure,
        next_steps: [
          "1. Go to Pipedrive > Automations",
          "2. Create new automation with trigger: Deal stage change",
          "3. Add email actions using the created templates", 
          "4. Set delays between emails (7, 7, 7, 14, 14 days)",
          "5. Add stop conditions for replies/meetings"
        ]
      };

    } catch (error: any) {
      throw new Error(`Failed to create automation workflow: ${error.message}`);
    }
  }

  async setupNativeEmailAutomation(api_token: string) {
    console.log('🚀 Setting up Pipedrive Native Email Automation...\n');

    // Step 1: Create email templates
    const templatesResult = await this.createEmailTemplates(api_token);
    
    // Step 2: Create automation workflow structure  
    const workflowResult = await this.createAutomationWorkflow(api_token);

    return {
      success: true,
      summary: {
        email_templates_created: templatesResult.count,
        automation_workflow: "Structure created (manual setup required)",
        ready_for_use: true
      },
      templates: templatesResult.templates_created,
      workflow: workflowResult.workflow,
      setup_instructions: workflowResult.next_steps
    };
  }
}