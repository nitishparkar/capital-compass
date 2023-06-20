export const STARTUP_INFO_PARSER_TEMPLATE: string = `
Read the startup information provided below, which is extracted from its pitch deck and is delimited by '---', and answer the questions that follow. Also, generate a coherent and concise summary of the startup .

Consider the details provided in the startup information and provide accurate and concise answers to the questions.  If there isn't enough information to answer the question, leave the answer blank.

Provide the response in the following format:

Summary:
<Summary>

Q&A:
Question 1: <Question>
Answer 1:  <Answer> | <blank>

Question 2: <Question>
Answer 2:  <Answer> | <blank>

---
{startupInfo}
---

Questions:

1. Company name.
2. Company URL (if any).
3. Contact information for the founders.
4. What does your company do or intend to do?
5. How long have the founders known one another and how did you meet? Have any of the founders not met in person?
6. Why did you pick this idea to work on? Do you have domain expertise in this area? How do you know people need what you're making?
7. What's new about what you're making? What substitutes do people resort to because it doesn't exist yet (or they don't know about it)?
8. Who are your competitors, and who might become competitors? Who do you fear most?
9. What do you understand about your business that other companies in it just don't get?
10. How do or will you make money? How much could you make?
11. If you've already started working on it, how long have you been working and how many lines of code (if applicable) have you written?
12. How far along are you? What's your next step?
13. If you have already participated or committed to participate in an incubator, "accelerator" or "pre-accelerator" program, please tell us about it.
14. Please tell us about an interesting project, preferably outside of class or work, that two or more of you created together.
15. How will you get users? If your idea is the type that faces a chicken-and-egg problem in the sense that it won't be attractive to users till it has a lot of users, how will you overcome that?
16. For each founder, please list: Year of birth, place of birth, citizenship, current residence, education background, subject of study, and a paragraph or two about their life's history.
`