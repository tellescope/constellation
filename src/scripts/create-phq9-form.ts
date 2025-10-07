import * as dotenv from 'dotenv';
import { Session } from '@tellescope/sdk';

// Load environment variables from .env file
dotenv.config();

/**
 * PHQ-9 (Patient Health Questionnaire-9) Depression Screening Form
 *
 * This script creates a standardized mental health screening tool with proper scoring.
 * Total score range: 0-27 (each of 9 questions scores 0-3)
 *
 * Score interpretation:
 *   0-4: Minimal depression
 *   5-9: Mild depression
 *   10-14: Moderate depression
 *   15-19: Moderately severe depression
 *   20-27: Severe depression
 *
 * Environment variables required:
 * - TELLESCOPE_HOST: The API host (e.g., https://api.tellescope.com)
 * - TELLESCOPE_API_KEY: Your API key for authentication
 */

// Validate required environment variables
if (!process.env.TELLESCOPE_API_KEY) {
  console.error('Error: TELLESCOPE_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize Session with environment variables
const session = new Session({
  host: process.env.TELLESCOPE_HOST,
  apiKey: process.env.TELLESCOPE_API_KEY,
});

async function run(): Promise<void> {
  try {
    // Create the PHQ-9 Form
    const form = await session.api.forms.createOne({
      title: 'PHQ-9 Depression Screening',
      displayTitle: 'Patient Health Questionnaire-9 (PHQ-9)',
      description: 'A brief questionnaire to screen for depression severity',
      allowPublicURL: true,

      // Intake field requirements
      intakeEmailRequired: true,
      intakePhone: 'optional',
      intakeDateOfBirth: 'optional',

      // Thank you message
      thanksMessage: 'Thank you for completing the PHQ-9 screening. Your responses have been recorded and will be reviewed by your healthcare provider.',

      // Portal settings
      allowPortalSubmission: true,

      // Tags for organization
      tags: ['Mental Health', 'Depression Screening', 'PHQ-9', 'Clinical Assessment'],

      // Form type
      type: 'enduserFacing',
      version: 'v2',
    })

    // Welcome/Description Field
    const welcomeField = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'About the PHQ-9',
      type: 'description',
      htmlDescription: '<p>The PHQ-9 is a brief questionnaire used to screen for depression. It asks about common symptoms of depression and how often you have experienced them over the past two weeks.</p><p>Your responses will help your healthcare provider understand your current mental health and determine if further evaluation or treatment may be beneficial.</p>',
      previousFields: [{ type: 'root', info: {} }],
    })

    // Instructions Field
    const instructionsField = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'Instructions',
      type: 'description',
      htmlDescription: '<p><strong>Over the last 2 weeks, how often have you been bothered by any of the following problems?</strong></p><p>Please select one answer for each question.</p>',
      previousFields: [{ type: 'after', info: { fieldId: welcomeField.id } }],
    })

    // Question 1: Little interest or pleasure
    const question1 = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'Little interest or pleasure in doing things',
      type: 'multiple_choice',
      previousFields: [{ type: 'after', info: { fieldId: instructionsField.id } }],
      options: {
        choices: [
          'Not at all',
          'Several days',
          'More than half the days',
          'Nearly every day',
        ],
        radio: true,
        other: false,
      },
      isOptional: false,
    })

    // Question 2: Feeling down, depressed, or hopeless
    const question2 = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'Feeling down, depressed, or hopeless',
      type: 'multiple_choice',
      previousFields: [{ type: 'after', info: { fieldId: question1.id } }],
      options: {
        choices: [
          'Not at all',
          'Several days',
          'More than half the days',
          'Nearly every day',
        ],
        radio: true,
        other: false,
      },
      isOptional: false,
    })

    // Question 3: Trouble with sleep
    const question3 = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'Trouble falling or staying asleep, or sleeping too much',
      type: 'multiple_choice',
      previousFields: [{ type: 'after', info: { fieldId: question2.id } }],
      options: {
        choices: [
          'Not at all',
          'Several days',
          'More than half the days',
          'Nearly every day',
        ],
        radio: true,
        other: false,
      },
      isOptional: false,
    })

    // Question 4: Feeling tired or having little energy
    const question4 = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'Feeling tired or having little energy',
      type: 'multiple_choice',
      previousFields: [{ type: 'after', info: { fieldId: question3.id } }],
      options: {
        choices: [
          'Not at all',
          'Several days',
          'More than half the days',
          'Nearly every day',
        ],
        radio: true,
        other: false,
      },
      isOptional: false,
    })

    // Question 5: Poor appetite or overeating
    const question5 = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'Poor appetite or overeating',
      type: 'multiple_choice',
      previousFields: [{ type: 'after', info: { fieldId: question4.id } }],
      options: {
        choices: [
          'Not at all',
          'Several days',
          'More than half the days',
          'Nearly every day',
        ],
        radio: true,
        other: false,
      },
      isOptional: false,
    })

    // Question 6: Feeling bad about yourself
    const question6 = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
      type: 'multiple_choice',
      previousFields: [{ type: 'after', info: { fieldId: question5.id } }],
      options: {
        choices: [
          'Not at all',
          'Several days',
          'More than half the days',
          'Nearly every day',
        ],
        radio: true,
        other: false,
      },
      isOptional: false,
    })

    // Question 7: Trouble concentrating
    const question7 = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'Trouble concentrating on things, such as reading the newspaper or watching television',
      type: 'multiple_choice',
      previousFields: [{ type: 'after', info: { fieldId: question6.id } }],
      options: {
        choices: [
          'Not at all',
          'Several days',
          'More than half the days',
          'Nearly every day',
        ],
        radio: true,
        other: false,
      },
      isOptional: false,
    })

    // Question 8: Moving or speaking slowly or being fidgety
    const question8 = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
      type: 'multiple_choice',
      previousFields: [{ type: 'after', info: { fieldId: question7.id } }],
      options: {
        choices: [
          'Not at all',
          'Several days',
          'More than half the days',
          'Nearly every day',
        ],
        radio: true,
        other: false,
      },
      isOptional: false,
    })

    // Question 9: Thoughts of being better off dead or hurting yourself
    const question9 = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'Thoughts that you would be better off dead or of hurting yourself in some way',
      type: 'multiple_choice',
      previousFields: [{ type: 'after', info: { fieldId: question8.id } }],
      options: {
        choices: [
          'Not at all',
          'Several days',
          'More than half the days',
          'Nearly every day',
        ],
        radio: true,
        other: false,
      },
      isOptional: false,
    })

    // Difficulty question (only shown if at least one problem was reported)
    const difficultyQuestion = await session.api.form_fields.createOne({
      formId: form.id,
      title: 'If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?',
      type: 'multiple_choice',
      previousFields: [{ type: 'after', info: { fieldId: question9.id } }],
      options: {
        choices: [
          'Not difficult at all',
          'Somewhat difficult',
          'Very difficult',
          'Extremely difficult',
        ],
        radio: true,
        other: false,
      },
      isOptional: true,
      description: 'This question helps us understand the impact of these problems on your daily life.',
    })

    // Update the form's scoring configuration with the actual field IDs
    await session.api.forms.updateOne(form.id, {
      scoring: [
        {
          title: 'PHQ-9 Total Score',
          fieldId: question1.id,
          response: 'Not at all',
          score: '0',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question1.id,
          response: 'Several days',
          score: '1',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question1.id,
          response: 'More than half the days',
          score: '2',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question1.id,
          response: 'Nearly every day',
          score: '3',
        },
        // Repeat for questions 2-9
        {
          title: 'PHQ-9 Total Score',
          fieldId: question2.id,
          response: 'Not at all',
          score: '0',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question2.id,
          response: 'Several days',
          score: '1',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question2.id,
          response: 'More than half the days',
          score: '2',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question2.id,
          response: 'Nearly every day',
          score: '3',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question3.id,
          response: 'Not at all',
          score: '0',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question3.id,
          response: 'Several days',
          score: '1',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question3.id,
          response: 'More than half the days',
          score: '2',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question3.id,
          response: 'Nearly every day',
          score: '3',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question4.id,
          response: 'Not at all',
          score: '0',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question4.id,
          response: 'Several days',
          score: '1',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question4.id,
          response: 'More than half the days',
          score: '2',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question4.id,
          response: 'Nearly every day',
          score: '3',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question5.id,
          response: 'Not at all',
          score: '0',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question5.id,
          response: 'Several days',
          score: '1',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question5.id,
          response: 'More than half the days',
          score: '2',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question5.id,
          response: 'Nearly every day',
          score: '3',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question6.id,
          response: 'Not at all',
          score: '0',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question6.id,
          response: 'Several days',
          score: '1',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question6.id,
          response: 'More than half the days',
          score: '2',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question6.id,
          response: 'Nearly every day',
          score: '3',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question7.id,
          response: 'Not at all',
          score: '0',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question7.id,
          response: 'Several days',
          score: '1',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question7.id,
          response: 'More than half the days',
          score: '2',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question7.id,
          response: 'Nearly every day',
          score: '3',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question8.id,
          response: 'Not at all',
          score: '0',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question8.id,
          response: 'Several days',
          score: '1',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question8.id,
          response: 'More than half the days',
          score: '2',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question8.id,
          response: 'Nearly every day',
          score: '3',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question9.id,
          response: 'Not at all',
          score: '0',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question9.id,
          response: 'Several days',
          score: '1',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question9.id,
          response: 'More than half the days',
          score: '2',
        },
        {
          title: 'PHQ-9 Total Score',
          fieldId: question9.id,
          response: 'Nearly every day',
          score: '3',
        },
      ],
    })

    console.log('PHQ-9 form created successfully!')
    console.log('Form ID:', form.id)
    console.log('Score interpretation:')
    console.log('  0-4: Minimal depression')
    console.log('  5-9: Mild depression')
    console.log('  10-14: Moderate depression')
    console.log('  15-19: Moderately severe depression')
    console.log('  20-27: Severe depression')

  } catch (error) {
    console.error('Failed to create PHQ-9 form:', error)
    throw error
  }
}

// Execute the script
run()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
