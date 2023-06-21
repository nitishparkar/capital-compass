export const MATCHMAKER_TEMPLATE: string = `
Based on the provided information about the startup, your task is to order the investors from most suitable to least suitable.
Startup information:
{startupInfo}.

Please return a JSON array of investor details, where each investor detail should have the follwing key-value pairs:
"name": "<name of the investor>",
"reason_for_matching": "<reason why this investor is suitable for the startup>",
"compatibility_score": "<compatibility score on a scale of 1 to 10, with 10 being the most suitable match>"

Consider the details provided about the startup to determine the suitability of each investor. Ensure that your ordering is based on their compatibility with the startup. The JSON array should be organized with the most suitable investor first and the least suitable investor last.
`