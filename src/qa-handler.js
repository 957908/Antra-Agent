class QAHandler {
  constructor() {
    this.qaDatabase = {
      github: 'GitHub is a platform for version control and collaboration using Git.',
      agent: 'Antra-Agent is your personal AI assistant for managing GitHub tasks and notifications.',
      issues: 'Issues are used to track ideas, bugs, and tasks in your repository.',
      pullrequest: 'A pull request is a request to merge your code changes into the main branch.',
      notification: 'Notifications alert you about activities in your repositories.',
      agenda: 'Your agenda shows today\'s GitHub tasks and activities.',
      suggestion: 'Suggestions are AI-powered recommendations for your work.',
      sms: 'You will receive SMS notifications on your phone about important updates.',
      default: 'That\'s a great question! Let me help you with GitHub and development tasks.'
    };
  }

  // Handle user questions
  async handleQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Search for relevant answer
    for (const [key, answer] of Object.entries(this.qaDatabase)) {
      if (lowerQuestion.includes(key)) {
        return answer;
      }
    }

    // If no match, return helpful response
    return this.getSmartAnswer(question);
  }

  // Generate smart answers based on question type
  getSmartAnswer(question) {
    const responses = {
      how: 'Here\'s how you can approach that: Start by checking your GitHub dashboard for relevant information.',
      what: 'That\'s related to GitHub and development. Check your repositories for more details.',
      why: 'Great question! This helps you manage your work better and stay organized.',
      when: 'You can do this anytime! I recommend scheduling it during your work hours.',
      where: 'You can find this in your GitHub dashboard or repositories.',
      help: '📚 I\'m here to help! Ask me about GitHub, tasks, notifications, or anything development-related.'
    };

    for (const [keyword, response] of Object.entries(responses)) {
      if (question.toLowerCase().startsWith(keyword)) {
        return response;
      }
    }

    return 'I understand your question. Please provide more details or ask about GitHub features.';
  }

  // Get answer confidence
  getConfidence(question) {
    const score = Math.random() * 100;
    return score > 70 ? 'high' : 'medium';
  }
}

module.exports = QAHandler;
