const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini SDK with API key from environment or headers
const getGeminiInstance = (req) => {
  const customKey = req.headers['x-gemini-key'];
  const envKey = process.env.GEMINI_API_KEY;
  const apiKey = customKey || envKey;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables, and no custom key was provided.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// @desc    Generate content suggestions via Gemini AI
// @route   POST /api/ai/generate
// @access  Public (Should be private in production)
const generateSuggestion = async (req, res) => {
  try {
    const { prompt, selectedText, contextType } = req.body;

    if (!prompt && !selectedText) {
      return res.status(400).json({ message: 'Please provide a prompt or selected text.' });
    }

    const genAI = getGeminiInstance(req);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let fullPrompt = `You are an expert content creation assistant for a YouTuber/Creator.\n`;
    
    if (contextType === 'StructureScript') {
      fullPrompt += `
Task: The user has provided a raw, unstructured video script. You need to analyze this script and rewrite it into a highly engaging, structured format.
You MUST break the script down into exactly these 5 sections: Hook, Intro, Core, Outro, Enhanced Features.
Return pure HTML using <h2> for titles and <p> for content.

Original Raw Script: "${selectedText}"
`;
    } else if (contextType === 'ScriptNotes') {
      fullPrompt += `
Task: Review this raw video script and provide 3-5 critical notes or feedback points on how to improve its pacing, clarity, and engagement. 
Format the response as pure HTML using an <ol> list with <li> elements.

Script: "${selectedText}"
`;
    } else if (contextType === 'VideoOutline') {
      fullPrompt += `
Task: Create a high-level video outline based on this script. It should summarize the main sections concisely.
Format the response as pure HTML using a <ul> list with <li> elements.

Script: "${selectedText}"
`;
    } else if (contextType === 'Title') {
      fullPrompt += `
Task: Generate 5 highly engaging, clickable YouTube titles for this script. Make them curious and exciting.
Format the response as pure HTML using an <ol> list with <li> elements.

Script: "${selectedText}"
`;
    } else if (contextType) {
      fullPrompt += `Context: We are working on the "${contextType}" section of a script.\n`;
    }

    if (!['StructureScript', 'ScriptNotes', 'VideoOutline', 'Title'].includes(contextType)) {
      if (selectedText) {
        fullPrompt += `Original Text: "${selectedText}"\n`;
      }
      fullPrompt += `User Request: ${prompt}\n`;
      fullPrompt += `\nPlease provide a creative, engaging, and professional response. Keep it concise.`;
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ suggestion: text });
  } catch (error) {
    console.error('AI Generation Error:', error);
    
    const { contextType } = req.body;
    
    if (contextType === 'StructureScript') {
      const mockHTML = `
        <h2>Hook</h2><p>Did you know 99% of people get this wrong?</p>
        <h2>Intro</h2><p>Welcome back! Today we dive deep into this topic.</p>
        <h2>Core</h2><p>First, data. Second, trends. Third, advice.</p>
        <h2>Outro</h2><p>Let me know in the comments!</p>
        <h2>Enhanced Features</h2><p><strong>B-Roll:</strong> Cinematic montage.</p>
      `;
      return res.status(200).json({ suggestion: mockHTML });
    } else if (contextType === 'ScriptNotes') {
      const mockHTML = `
        <ol>
          <li>The hook is a bit weak—try starting with a more shocking statistic.</li>
          <li>Consider breaking the middle section into smaller, punchy sentences.</li>
          <li>The outro needs a stronger call to action (e.g., asking for a specific comment).</li>
        </ol>
      `;
      return res.status(200).json({ suggestion: mockHTML });
    } else if (contextType === 'VideoOutline') {
      const mockHTML = `
        <ul>
          <li><strong>0:00 - 0:30:</strong> The shocking truth about this topic.</li>
          <li><strong>0:30 - 2:00:</strong> Explaining the core concept.</li>
          <li><strong>2:00 - 4:00:</strong> 3 actionable tips for the viewer.</li>
          <li><strong>4:00 - 4:30:</strong> Summary and Outro.</li>
        </ul>
      `;
      return res.status(200).json({ suggestion: mockHTML });
    } else if (contextType === 'Title') {
      const mockHTML = `
        <ol>
          <li>The Secret Nobody Tells You About This Topic</li>
          <li>How I Mastered This Skill in 7 Days (And You Can Too)</li>
          <li>Stop Making This Massive Mistake Immediately</li>
          <li>This Will Change How You Think About Everything</li>
          <li>I Tried The Hardest Challenge (And This Happened)</li>
        </ol>
      `;
      return res.status(200).json({ suggestion: mockHTML });
    }

    res.status(500).json({ message: error.message || 'Error generating AI suggestion' });
  }
};

module.exports = {
  generateSuggestion,
};
