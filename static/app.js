document.addEventListener('DOMContentLoaded', function() {
    const tg = window.Telegram.WebApp;
    const verifyBtn = document.getElementById('verify-btn');
    
    // Initialize Telegram Web App - Keep it open!
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    
    // Show user info (optional)
    console.log('User data:', tg.initDataUnsafe);
    
    // Verify button click
    verifyBtn.addEventListener('click', function() {
        if (tg) {
            tg.MainButton.setText('Verifying...');
            tg.MainButton.show();
            tg.MainButton.disable();
            
            // Send verification to bot (we can send user data or just a confirmation)
            tg.sendData('verified:' + (tg.initDataUnsafe.user?.id || 'unknown'));
            
            // Optionally close the mini app after a delay
            setTimeout(() => {
                tg.close();
            }, 1500);
        }
    });
});
