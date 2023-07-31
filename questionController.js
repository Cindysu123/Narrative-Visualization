let currentQuestionIndex = 0;

function showQuestion() {
    const questions = document.querySelectorAll('.question-container');
    questions.forEach((question) => question.style.display = 'none');
  
    questions[currentQuestionIndex].style.display = 'block';
  
    const circles = document.querySelectorAll('.navbar ul li');
    circles.forEach((circle) => circle.style.backgroundColor = '#696969');
    circles[currentQuestionIndex].style.backgroundColor = '#fdc072';
  
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
  
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= document.querySelectorAll('.question-container').length) {
    currentQuestionIndex = 0;
  }
  showQuestion();
}

function previousQuestion() {
  currentQuestionIndex--;
  if (currentQuestionIndex < 0) {
    currentQuestionIndex = document.querySelectorAll('.question-container').length - 1;
  }
  showQuestion();
}

function goToQuestion(index) {
    currentQuestionIndex = index;
    showQuestion();
  }

showQuestion();
