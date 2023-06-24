export const EMAIL_COMPOSER_TEMPLATE: string = `
Your task is to analyze the provided startup and investor information and draft a double opt-in email. The founder of the startup will send this email to their mutual connection with the investor, who will then forward it to the investor, asking if they would like an introduction. If the investor agrees, an introduction will be made.


Startup information:
{startupInfo}


Investor information:
Name: {investorName}
Details:
{investorInfo}
Reason the investor is suitable for the startup:
{investorMatchReason}


Please write a concise and compelling email, addressing it to the investor and writing from the point of view of the mutual connection. The email should cover the following elements in a maximum of three paragraphs:
- What the startup does
- What sets it apart from existing solutions or competitors
- A "hook" to get the investor interested in learning more

Please ensure that the email is professionally written, concise, and engaging. Consider the provided startup and investor information to personalize the email as much as possible.
`