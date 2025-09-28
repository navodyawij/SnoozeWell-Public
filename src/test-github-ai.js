import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// This script tests the GitHub AI model integration
async function testGitHubAi() {
  try {
    // Get GitHub token from environment variable
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error("GitHub token not found. Please set the GITHUB_TOKEN environment variable.");
      return;
    }

    console.log("Testing GitHub AI model integration...");
    
    const endpoint = "https://models.github.ai/inference";
    const model = "openai/gpt-4.1";

    // Create the model client
    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token),
    );

    // Simple test prompt
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You are a health and fitness expert." },
          { role: "user", content: "Provide a simple workout routine for beginners." }
        ],
        temperature: 0.7,
        top_p: 1.0,
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    console.log("GitHub AI response:");
    console.log(response.body.choices[0].message.content);
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

// Run the test
testGitHubAi().catch(err => {
  console.error("Unhandled error:", err);
});

// Export the function for potential reuse
export { testGitHubAi }; 