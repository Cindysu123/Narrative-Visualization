// questionController.js

// Global variable to keep track of the current question index
let currentQuestionIndex = 0;

// Function to show the current question based on the index
function showQuestion() {
  // Hide all questions
  const questions = document.querySelectorAll('.question-container');
  questions.forEach((question) => question.style.display = 'none');

  // Show the question with the current index
  questions[currentQuestionIndex].style.display = 'block';

  // Disable/Enable previous and next buttons based on the current question index
  const previousButton = document.getElementById('previousButton');
  const nextButton = document.getElementById('nextButton');

  if (currentQuestionIndex === 0) {
    previousButton.disabled = true;
  } else {
    previousButton.disabled = false;
  }

  if (currentQuestionIndex === questions.length - 1) {
    nextButton.disabled = true;
  } else {
    nextButton.disabled = false;
  }
}

// Function to handle the click event when the user wants to switch to the next question
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= document.querySelectorAll('.question-container').length) {
    // If there are no more questions, reset the index to 0
    currentQuestionIndex = 0;
  }
  showQuestion();
}

// Function to handle the click event when the user wants to switch to the previous question
function previousQuestion() {
  currentQuestionIndex--;
  if (currentQuestionIndex < 0) {
    // If the user is at the first question, loop back to the last question
    currentQuestionIndex = document.querySelectorAll('.question-container').length - 1;
  }
  showQuestion();
}

// Show the first question on page load
showQuestion();
