function submitQuiz() {
  document.getElementById('screen-quiz').classList.remove('active');
  document.getElementById('screen-score').classList.add('active');
  document.getElementById('timer').textContent = '⏱ Done';
  document.getElementById('topbar-center').innerHTML = '<div class="quiz-title">Quiz Complete</div>';
  clearInterval(timerInterval);
}

if (!window.location.search.includes('demo')) {
  var demoToggle = document.getElementById('demo-toggle');
  if (demoToggle) demoToggle.style.display = 'none';
}