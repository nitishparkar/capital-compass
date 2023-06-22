export const EMAIL_COMPOSER_TEMPLATE: string = `
Your task is to analyze the provided startup and investor information and draft a double opt-in email. The founder of the startup will send this email to their mutual connection with the investor, who will then forward it to the investor, asking if they would like an introduction. If the investor agrees, an introduction will be made.

Startup information:
{startupInfo}

Investor information:
{investorInfo}

Please write a concise and compelling email that includes the following elements:
- What the startup does
- What makes it special or different than the existing solutions
- A "hook" to get the investor interested in learning more.
All three elements should be covered in maximum three paragraphs.

Please ensure that the email is professionally written, concise, and engaging. Consider the provided startup and investor information to personalize the email as much as possible.
`