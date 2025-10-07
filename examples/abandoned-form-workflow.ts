import * as dotenv from 'dotenv';
import { Session } from '@tellescope/sdk';

if (require.main === module) {
  dotenv.config();
}

/**
 * Sets up an Abandoned Form Follow-Up workflow
 *
 * When an enduser starts a form but doesn't submit it:
 * - Wait 24 hours, send first reminder email with form link
 * - Wait 3 more days, send final follow-up email
 * - Journey auto-exits if form is submitted (using Form Submitted trigger)
 *
 * Workflow:
 *   Form Started (Trigger) → Add to Journey
 *        ↓
 *   Set Status "Awaiting Form Completion"
 *        ↓
 *   Wait 24h → Send First Reminder → Send Form
 *        ↓
 *   Wait 3d → Send Final Follow-Up
 *
 *   Form Submitted (Trigger) → Remove from Journey (exits workflow early)
 *
 * @param formId - ID of the form to track (optional - creates demo form if not provided)
 * @param session - Tellescope Session (optional, will create if not provided)
 */
export async function setupAbandonedFormWorkflow(
  formId?: string,
  session?: Session
): Promise<void> {
  const sess = session ?? new Session({
    host: process.env.TELLESCOPE_HOST,
    apiKey: process.env.TELLESCOPE_API_KEY,
  });

  try {
    console.log('Setting up Abandoned Form Follow-Up workflow...\n');

    // Step 0: Get a user to use as sender
    console.log('Fetching user for sender...');
    const users = await sess.api.users.getSome({
      filter: {
        fname: { _exists: true },
        lname: { _exists: true },
        username: { _exists: true }
      },
      limit: 1
    });

    if (users.length === 0) {
      throw new Error('No users found with fname, lname, and username set. Please create a user first.');
    }

    const senderId = users[0].id;
    console.log(`Using user as sender: ${senderId}\n`);

    // Step 1: Create a simple form if no formId provided
    let targetFormId = formId;
    if (!targetFormId) {
      console.log('No form ID provided - creating a simple demo form...');
      const form = await sess.api.forms.createOne({
        title: 'Demo Contact Form',
        description: 'A simple contact form for testing abandoned form workflows',
        tags: ['abandoned-cart', 'demo']
      });

      await sess.api.form_fields.createOne({
        formId: form.id,
        title: 'What can we help you with?',
        type: 'stringLong',
        isOptional: false,
        previousFields: [{ type: 'root', info: {} }],
        placeholder: 'Tell us about your question or concern...',
        description: 'We\'ll get back to you shortly!'
      });

      targetFormId = form.id;
      console.log(`Demo form created: ${targetFormId}\n`);
    }

    // Step 2: Create Email Templates (in parallel)
    console.log('Creating email templates...');
    const [firstReminderTemplate, finalFollowUpTemplate] = await Promise.all([
      sess.api.templates.createOne({
        title: 'Abandoned Form - First Reminder',
        subject: 'Complete Your Form - Just a Quick Reminder',
        message: `Hi {{enduser.fname}},

We noticed you started filling out a form but didn't finish. No worries—it happens!

We wanted to send you a quick reminder in case you'd like to complete it. It only takes a few minutes, and we're here if you need any help.

Looking forward to hearing from you!

Best regards,
{{sender.fname}}
{{SIGNATURE}}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Complete Your Form - Just a Quick Reminder</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .mobile-padding { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td class="mobile-padding" style="padding: 40px 30px;">
              <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Quick Reminder</h1>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #4a4a4a;">Hi {{enduser.fname}},</p>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #4a4a4a;">We noticed you started filling out a form but didn't finish. No worries—it happens!</p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #4a4a4a;">We wanted to send you a quick reminder in case you'd like to complete it. It only takes a few minutes, and we're here if you need any help.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 24px 0; background-color: #f0f8ff; border-radius: 6px; border-left: 4px solid #007bff;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #1a5490;"><strong>Helpful tip:</strong> It only takes a few minutes to complete!</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px 0; font-size: 16px; line-height: 1.5; color: #4a4a4a;">Looking forward to hearing from you!</p>
              <p style="margin: 0 0 8px 0; font-size: 16px; line-height: 1.5; color: #4a4a4a;">Best regards,<br>{{sender.fname}}</p>
              <div style="margin: 16px 0 0 0; padding-top: 16px; border-top: 1px solid #e0e0e0; font-size: 14px; line-height: 1.5; color: #6a6a6a;">{{SIGNATURE.EMAIL}}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        mode: 'html',
        type: 'enduser',
        forChannels: ['Email'],
        isMarketing: true,
        tags: ['abandoned-cart', 'reminder', 'first', '24h']
      }),
      sess.api.templates.createOne({
        title: 'Abandoned Form - Final Follow-Up',
        subject: 'We\'re Here to Help - Final Reminder',
        message: `Hi {{enduser.fname}},

This is our final reminder about the form you started a few days ago. We understand life gets busy, and we want to make sure you have everything you need to complete it.

If you're having any trouble or have questions, please don't hesitate to reach out. Just reply to this email, and we'll be happy to help!

We'd love to help you get this finished.

Best regards,
{{sender.fname}}
{{SIGNATURE}}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>We're Here to Help - Final Reminder</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .mobile-padding { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td class="mobile-padding" style="padding: 40px 30px;">
              <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">We're Here to Help</h1>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #4a4a4a;">Hi {{enduser.fname}},</p>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #4a4a4a;">This is our <strong>final reminder</strong> about the form you started a few days ago. We understand life gets busy, and we want to make sure you have everything you need to complete it.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 24px 0; background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; line-height: 1.5; color: #856404;">Need help?</p>
                    <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #856404;">If you're having any trouble or have questions, please don't hesitate to reach out. Just <strong>reply to this email</strong>, and we'll be happy to help!</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #4a4a4a;">We'd love to help you get this finished.</p>
              <p style="margin: 0 0 8px 0; font-size: 16px; line-height: 1.5; color: #4a4a4a;">Best regards,<br>{{sender.fname}}</p>
              <div style="margin: 16px 0 0 0; padding-top: 16px; border-top: 1px solid #e0e0e0; font-size: 14px; line-height: 1.5; color: #6a6a6a;">{{SIGNATURE.EMAIL}}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        mode: 'html',
        type: 'enduser',
        forChannels: ['Email'],
        isMarketing: true,
        tags: ['abandoned-cart', 'reminder', 'final', '3d']
      })
    ]);

    const firstReminderTemplateId = firstReminderTemplate.id;
    const finalFollowUpTemplateId = finalFollowUpTemplate.id;
    console.log(`Templates created: ${firstReminderTemplateId}, ${finalFollowUpTemplateId}\n`);

    // Step 3: Create Journey
    console.log('Creating Abandoned Form Follow-Up Journey...');
    const journey = await sess.api.journeys.createOne({
      title: 'Abandoned Form Follow-Up',
      description: 'Re-engage endusers who start but don\'t submit a form',
      defaultState: 'active',
      tags: ['abandoned-cart']
    });
    console.log(`Journey created: ${journey.id}`);

    // Step 4: Create AutomationSteps (linear workflow)
    const step1 = await sess.api.automation_steps.createOne({
      journeyId: journey.id,
      events: [{ type: 'onJourneyStart', info: {} }],
      action: { type: 'setEnduserStatus', info: { status: 'Awaiting Form Completion' } },
      tags: ['abandoned-cart', 'initial']
    });
    console.log(`Step 1: Set initial status (${step1.id})`);

    const step2 = await sess.api.automation_steps.createOne({
      journeyId: journey.id,
      events: [{ type: 'afterAction', info: { automationStepId: step1.id, delayInMS: 86400000, delay: 24, unit: 'Hours' } }],
      action: { type: 'sendEmail', info: { senderId: senderId, templateId: firstReminderTemplateId } },
      continueOnError: true,
      tags: ['abandoned-cart', 'first-reminder', '24h']
    });
    console.log(`Step 2: Send first reminder email after 24h (${step2.id})`);

    const step3 = await sess.api.automation_steps.createOne({
      journeyId: journey.id,
      events: [{ type: 'afterAction', info: { automationStepId: step2.id, delayInMS: 0, delay: 0, unit: 'Minutes' } }],
      action: { type: 'sendForm', info: { formId: targetFormId, senderId: senderId, channel: 'Email' } },
      continueOnError: true,
      tags: ['abandoned-cart', 'send-form']
    });
    console.log(`Step 3: Send form (${step3.id})`);

    const step4 = await sess.api.automation_steps.createOne({
      journeyId: journey.id,
      events: [{ type: 'afterAction', info: { automationStepId: step3.id, delayInMS: 259200000, delay: 3, unit: 'Days' } }],
      action: { type: 'sendEmail', info: { senderId: senderId, templateId: finalFollowUpTemplateId } },
      continueOnError: true,
      tags: ['abandoned-cart', 'final-reminder', '3d']
    });
    console.log(`Step 4: Send final follow-up email after 3d (${step4.id})\n`);

    // Step 5: Create AutomationTriggers
    console.log('Creating Form Started trigger (add to journey)...');
    const formStartedTrigger = await sess.api.automation_triggers.createOne({
      title: 'Form Started - Add to Abandoned Form Journey',
      status: 'Active',
      event: { type: 'Form Started', info: { formIds: [targetFormId] } },
      action: { type: 'Add To Journey', info: { journeyId: journey.id, doNotRestart: true } },
      oncePerEnduser: false,
      tags: ['abandoned-cart', 'entry', 'form-started']
    });
    console.log(`Form Started trigger created: ${formStartedTrigger.id}`);

    console.log('Creating Form Submitted trigger (remove from journey)...');
    const formSubmittedTrigger = await sess.api.automation_triggers.createOne({
      title: 'Form Submitted - Exit Abandoned Form Journey',
      status: 'Active',
      event: { type: 'Form Submitted', info: { formId: targetFormId } },
      action: { type: 'Remove From Journey', info: { journeyId: journey.id } },
      oncePerEnduser: false,
      tags: ['abandoned-cart', 'exit', 'form-submitted']
    });
    console.log(`Form Submitted trigger created: ${formSubmittedTrigger.id}\n`);

    console.log('✓ Abandoned Form Follow-Up workflow setup complete!');
    console.log(`\nCreated resources:`);
    console.log(`  Form ID: ${targetFormId}`);
    console.log(`  Journey: ${journey.id}`);
    console.log(`  Triggers: ${formStartedTrigger.id}, ${formSubmittedTrigger.id}`);
    console.log(`  Templates: ${firstReminderTemplateId}, ${finalFollowUpTemplateId}`);
    console.log(`\nWorkflow activated for form: ${targetFormId}`);
  } catch (error) {
    console.error('Failed to setup abandoned form workflow:', error);
    throw error;
  }
}

if (require.main === module) {
  if (!process.env.TELLESCOPE_API_KEY) {
    console.error('Error: TELLESCOPE_API_KEY environment variable is required');
    process.exit(1);
  }

  // Get form ID from command line argument (optional - will create demo form if not provided)
  const formId = process.argv[2];

  setupAbandonedFormWorkflow(formId)
    .then(() => {
      console.log('\nDone');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
