function openConfirmPay(student, pkg, amount, method, booking) {
  document.getElementById('cf-student').textContent = student;
  document.getElementById('cf-package').textContent = pkg;
  document.getElementById('cf-amount').textContent = amount;
  document.getElementById('cf-method').textContent = method;
  document.getElementById('cf-booking').textContent = booking;
  document.getElementById('modal-confirm').classList.add('open');
}

function openCancel(student, date, inst, pkg) {
  document.getElementById('cx-student').textContent = student;
  document.getElementById('cx-date').textContent = date;
  document.getElementById('cx-inst').textContent = inst;
  document.getElementById('cx-pkg').textContent = pkg;
  document.getElementById('modal-cancel').classList.add('open');
}