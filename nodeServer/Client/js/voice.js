const startButton = document.getElementById('startButton');
const outputDiv = document.getElementById('output');
const chatTextInput = document.querySelector(".text_input");

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
recognition.lang = 'en-US';

recognition.onstart = () => {
    startButton.classList.remove('material-symbols-outlined');
    startButton.classList.add('material-symbols-outlined'); 
    startButton.textContent = 'mic'; 
};

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    chatTextInput.value = transcript;
};

recognition.onend = () => {
    startButton.classList.remove('material-symbols-outlined'); 
    startButton.classList.add('material-symbols-outlined'); 
    startButton.textContent = 'mic_off';
}

startButton.addEventListener('click', () => {
    recognition.start();
});
