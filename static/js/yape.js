const mercadoPagoPublicKey = document.getElementById('mercado-pago-public-key').value;
const mp = new MercadoPago(mercadoPagoPublicKey);

let yapePagingForm = null;

function initializeYapeForm() {
    const productCost = document.getElementById('amount').value;
    const productDescription = document.getElementById('description').value;
    const payButton = document.getElementById("form-checkout__submit");
    const validationErrorMessages = document.getElementById('validation-error-messages');
    const loadingMessage = document.getElementById('loading-message');

    // Set up form event listener
    document.getElementById('form-checkout').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Show loading message
        loadingMessage.style.display = 'block';
        payButton.disabled = true;
        
        try {
            // Get form data
            const phoneNumber = document.getElementById('form-checkout__payerPhone').value;
            const otp = document.getElementById('form-checkout__payerOTP').value;
            const email = document.getElementById('form-checkout__payerEmail').value;
            
            // Validate required fields
            clearValidationErrors();
            
            if (!phoneNumber || !otp || !email) {
                throw new Error('Please fill all required fields');
            }
            
            if (otp.length !== 6) {
                throw new Error('OTP must be 6 digits');
            }
            
            // Generate Yape token
            console.log('Creating Yape token...');
            const yapeOptions = {
                otp: otp,
                phoneNumber: phoneNumber
            };
            
            const yape = mp.yape(yapeOptions);
            const yapeTokenResponse = await yape.create();
            
            console.log('Yape token created:', yapeTokenResponse);
            
            if (!yapeTokenResponse || !yapeTokenResponse.id) {
                throw new Error('Failed to generate Yape token');
            }
            
            // Create payment
            const paymentData = {
                token: yapeTokenResponse.id,
                transaction_amount: Number(productCost),
                description: productDescription,
                installments: 1,
                payment_method_id: 'yape',
                payer: {
                    email: email
                }
            };
            
            console.log('Creating payment with data:', paymentData);
            
            const response = await fetch('/process_payment_yape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showPaymentResult(true, result);
            } else {
                throw new Error(result.error_message || 'Payment failed');
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            showValidationError(error.message);
            showPaymentResult(false, { error_message: error.message });
        } finally {
            loadingMessage.style.display = 'none';
            payButton.disabled = false;
        }
    });
}

function showValidationError(message) {
    const validationErrorMessages = document.getElementById('validation-error-messages');
    clearValidationErrors();
    
    const errorElement = document.createElement('p');
    errorElement.className = 'text-danger';
    errorElement.textContent = message;
    validationErrorMessages.appendChild(errorElement);
}

function clearValidationErrors() {
    const validationErrorMessages = document.getElementById('validation-error-messages');
    validationErrorMessages.innerHTML = '';
}

function showPaymentResult(success, data) {
    // Hide payment form
    $('.container__payment').fadeOut(500);
    
    setTimeout(() => {
        if (success) {
            // Show success
            document.getElementById('payment-id').textContent = data.id || '';
            document.getElementById('payment-status').textContent = data.status || '';
            document.getElementById('payment-detail').textContent = data.detail || '';
            document.getElementById('success-response').style.display = 'block';
            document.getElementById('fail-response').style.display = 'none';
        } else {
            // Show error
            document.getElementById('error-message').textContent = data.error_message || 'Unknown error occurred';
            document.getElementById('fail-response').style.display = 'block';
            document.getElementById('success-response').style.display = 'none';
        }
        
        // Show result section
        $('.container__result').show(500).fadeIn();
    }, 500);
}

// Handle transitions
document.getElementById('checkout-btn').addEventListener('click', function(){
    $('.container__cart').fadeOut(500);
    setTimeout(() => {
        initializeYapeForm();
        $('.container__payment').show(500).fadeIn();
    }, 500);
});

document.getElementById('go-back').addEventListener('click', function(){
    $('.container__payment').fadeOut(500);
    setTimeout(() => { 
        $('.container__cart').show(500).fadeIn(); 
        clearValidationErrors();
    }, 500);
});

// Handle price update
function updatePrice(){
    let quantity = document.getElementById('quantity').value;
    let unitPrice = document.getElementById('unit-price').innerText;
    let amount = parseInt(unitPrice) * parseInt(quantity);

    document.getElementById('cart-total').innerText = '$ ' + amount;
    document.getElementById('summary-price').innerText = '$ ' + unitPrice;
    document.getElementById('summary-quantity').innerText = quantity;
    document.getElementById('summary-total').innerText = '$ ' + amount;
    document.getElementById('amount').value = amount;
    document.getElementById('description').value = `${document.getElementById('product-description').innerText} x ${quantity}`;
}

// Initialize
document.getElementById('quantity').addEventListener('change', updatePrice);
updatePrice();

// Form validation helpers
document.getElementById('form-checkout__payerOTP').addEventListener('input', function(e) {
    // Only allow numbers
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    
    if (e.target.value.length > 6) {
        e.target.value = e.target.value.slice(0, 6);
    }
});

document.getElementById('form-checkout__payerPhone').addEventListener('input', function(e) {
    // Only allow numbers
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// Auto-format phone number
document.getElementById('form-checkout__payerPhone').addEventListener('blur', function(e) {
    const phone = e.target.value;
    if (phone.length < 9) {
        showValidationError('Phone number must be at least 9 digits');
    } else {
        clearValidationErrors();
    }
});

console.log('Yape payment form initialized'); 