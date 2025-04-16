import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { MoodType } from '@shared/schema';

// Initialize the Gemini API with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Configure safety settings to ensure appropriate content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Define model configuration
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 500,
};

// Gemini model to use
const MODEL_NAME = 'gemini-1.5-pro';

export interface ActivitySuggestion {
  activities: string[];
  message: string;
}

/**
 * Generates activity suggestions based on the user's mood
 * @param mood - The user's current mood
 * @param notes - Optional notes provided by the user
 * @returns A list of suggested activities and a supportive message
 */
export async function getActivitySuggestions(mood: MoodType, notes?: string): Promise<ActivitySuggestion> {
  try {
    // Create a prompt based on the user's mood and notes
    let prompt = `I'm feeling ${mood}`;
    if (notes) {
      prompt += ` and here's why: ${notes}`;
    }
    
    prompt += `\n\nPlease suggest 5 activities that might help me feel better or maintain my current mood if it's positive. Format your response as a JSON object with two properties: "activities" (an array of 5 activity suggestions) and "message" (a brief supportive message based on my mood).`;

    // Get the model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      generationConfig,
    });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Parse the JSON response
      const jsonResponse = JSON.parse(text);
      return {
        activities: jsonResponse.activities || [],
        message: jsonResponse.message || ''
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback with default suggestions based on mood
      return getFallbackSuggestions(mood);
    }
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return getFallbackSuggestions(mood);
  }
}

/**
 * Provides fallback suggestions if the AI service fails
 */
function getFallbackSuggestions(mood: MoodType): ActivitySuggestion {
  const suggestions: Record<MoodType, ActivitySuggestion> = {
    "great": {
      activities: [
        "Journal about what made today great",
        "Share your positive energy with friends or family",
        "Try a new challenging activity",
        "Make a gratitude list",
        "Plan something exciting for the future"
      ],
      message: "Wonderful! Harness this positive energy for something meaningful."
    },
    "good": {
      activities: [
        "Go for a walk outside",
        "Call a friend",
        "Do something creative",
        "Practice mindfulness meditation",
        "Cook a healthy meal"
      ],
      message: "Great to hear you are feeling good! Keep the positive momentum going."
    },
    "neutral": {
      activities: [
        "Try a new hobby",
        "Watch an inspiring documentary",
        "Organize your space",
        "Listen to uplifting music",
        "Learn something new"
      ],
      message: "A neutral mood is a perfect canvas for new experiences."
    },
    "bad": {
      activities: [
        "Take a relaxing shower or bath",
        "Practice deep breathing for 5 minutes",
        "Go for a gentle walk outside",
        "Listen to calming music",
        "Reach out to a supportive friend"
      ],
      message: "I am sorry you are not feeling great. Be gentle with yourself today."
    },
    "terrible": {
      activities: [
        "Focus on basic self-care like hydrating and eating",
        "Use the 5-4-3-2-1 grounding technique",
        "Watch something comforting and familiar",
        "Practice gentle stretching",
        "Consider talking to a mental health professional"
      ],
      message: "I am sorry you are having such a difficult day. Remember that this feeling is temporary."
    }
  };
  
  return suggestions[mood];
}