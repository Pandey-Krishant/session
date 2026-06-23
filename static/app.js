document.addEventListener('DOMContentLoaded', function() {
    const tg = window.Telegram.WebApp;
    const otpBoxes = document.querySelectorAll('.otp-box');
    const keys = document.querySelectorAll('.key');
    const verifyBtn = document.getElementById('verify-btn');
    
    let currentIndex = 0;
    
    // Initialize Telegram Web App - Keep it open!
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    
    function focusNextBox() {
        if (currentIndex < otpBoxes.length - 1) {
            currentIndex++;
            otpBoxes[currentIndex].focus();
        }
    }
    
    function focusPrevBox() {
        if (currentIndex > 0) {
            currentIndex--;
            otpBoxes[currentIndex].focus();
        }
    }
    
    function handleKeyPress(key) {
        if (key === 'backspace') {
            otpBoxes[currentIndex].value = '';
            focusPrevBox();
        } else if (!isNaN(key)) {
            otpBoxes[currentIndex].value = key;
            focusNextBox();
        }
    }
    
    // OTP Input Handlers
    otpBoxes.forEach((box, index) => {
        box.addEventListener('input', function(e) {
            if (this.value.length === 1) {
                focusNextBox();
            }
        });
        
        box.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '') {
                focusPrevBox();
            }
        });
    });
    
    // Keypad Handlers
    keys.forEach(key => {
        key.addEventListener('click', function() {
            const keyValue = this.dataset.key;
            handleKeyPress(keyValue);
        });
    });
    
    // Verify OTP
    verifyBtn.addEventListener('click', function() {
        const otp = Array.from(otpBoxes).map(box => box.value).join('');
        if (otp.length === 5) {
            if (tg) {
                tg.MainButton.setText('Verifying...');
                tg.MainButton.show();
                tg.MainButton.disable();
                tg.sendData('verify_otp:' + otp);
            }
        } else {
            tg.showPopup({
                title: 'Error',
                message: 'Please enter a complete 5-digit OTP!',
                buttons: [{ type: 'ok', text: 'OK' }]
            });
        }
    });
    
    // Focus first input
    otpBoxes[0].focus();
});
