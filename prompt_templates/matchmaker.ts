export const MATCHMAKER_TEMPLATE: string = `
Your task is to analyze the provided startup information and order the investors from most suitable to least suitable based on their compatibility.

Startup information:
{startupInfo}

Investors:
{investors}

Please return a JSON array of investor details, where each investor detail should include the following key-value pairs:
"name": "<name of the investor>",
"compatibility_score": "<compatibility score on a scale of 1 to 10, with 10 being the most suitable match>"
"reason_for_matching": "<reason why this investor is suitable for the startup>",

Consider the details provided about the startup to determine the suitability of each investor. Ensure that your ordering is based on their compatibility with the startup. The JSON array should be organized with the most suitable investor first and the least suitable investor last.
`