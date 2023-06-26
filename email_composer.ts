import { Humanloop } from "humanloop";

interface Investor {
  name: string;
  info: string;
  reason_for_matching: string;
}

export async function composeEmail(startupInfo: string, investor: Investor): Promise<string> {
  const humanloop = new Humanloop({
    apiKey: process.env.HUMANLOOP_API_KEY,
  });

  // This throws an error on failure
  const response = await humanloop.completeDeployed({
    project: "Capital Compass",
    inputs: {
      "startupInfo": startupInfo,
      "investorName": investor.name,
      "investorInfo": investor.info,
      "investorMatchReason": investor.reason_for_matching
    },
    provider_api_keys: {
      "openai": process.env.OPENAI_API_KEY
    }
  });
  console.log(response.data);

  return response.data.data[0].output;
}
