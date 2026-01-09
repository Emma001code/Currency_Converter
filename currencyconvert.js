const apiKey = "e081368868ccab84a477d34d"; // Replace with your actual API key
const apiUrl = `https://v6.exchangerate-api.com/v6/e081368868ccab84a477d34d/latest/USD`; // Example API URL

async function fetchCurrencies() {
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.result === 'error') {
            throw new Error(data['error-type'] || 'API returned an error');
        }
        
        const exchangeRates = data.conversion_rates;

        let fromSelect = document.getElementById("fromCurrency");
        let toSelect = document.getElementById("toCurrency");

        // Clear existing options
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';

        // Add base currency (USD) first since it might not be in conversion_rates
        let optionFromUSD = document.createElement("option");
        optionFromUSD.value = "USD";
        optionFromUSD.textContent = "USD";
        fromSelect.appendChild(optionFromUSD);

        let optionToUSD = document.createElement("option");
        optionToUSD.value = "USD";
        optionToUSD.textContent = "USD";
        toSelect.appendChild(optionToUSD);

        // Populate dropdowns with all currency codes
        Object.keys(exchangeRates).forEach(currency => {
            let optionFrom = document.createElement("option");
            optionFrom.value = currency;
            optionFrom.textContent = currency;
            fromSelect.appendChild(optionFrom);

            let optionTo = document.createElement("option");
            optionTo.value = currency;
            optionTo.textContent = currency;
            toSelect.appendChild(optionTo);
        });

    } catch (error) {
        console.error("Error fetching currencies:", error);
        document.getElementById("result").textContent = "Error loading currencies. Please check console for details.";
    }
}

async function convertCurrency() {
    let amount = document.getElementById("amount").value;
    let fromCurrency = document.getElementById("fromCurrency").value;
    let toCurrency = document.getElementById("toCurrency").value;

    if (amount === "" || amount <= 0) {
        document.getElementById("result").textContent = "Please enter a valid amount.";
        return;
    }

    if (!fromCurrency || !toCurrency) {
        document.getElementById("result").textContent = "Please select currencies.";
        return;
    }

    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.result === 'error') {
            throw new Error(data['error-type'] || 'API returned an error');
        }
        
        const exchangeRates = data.conversion_rates;
        const baseCurrency = data.base_code || "USD"; // API base currency

        let convertedAmount;

        // Handle conversion logic based on base currency (USD)
        if (fromCurrency === baseCurrency) {
            // Converting from base currency (USD) to another currency
            if (!exchangeRates[toCurrency]) {
                document.getElementById("result").textContent = "Invalid target currency selection.";
                return;
            }
            convertedAmount = amount * exchangeRates[toCurrency];
        } else if (toCurrency === baseCurrency) {
            // Converting to base currency (USD) from another currency
            if (!exchangeRates[fromCurrency]) {
                document.getElementById("result").textContent = "Invalid source currency selection.";
                return;
            }
            convertedAmount = amount / exchangeRates[fromCurrency];
        } else {
            // Converting between two non-base currencies
            if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
                document.getElementById("result").textContent = "Invalid currency selection.";
                return;
            }
            // Convert from source -> base -> target
            convertedAmount = (amount / exchangeRates[fromCurrency]) * exchangeRates[toCurrency];
        }

        document.getElementById("result").textContent = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
    } catch (error) {
        document.getElementById("result").textContent = "Error fetching exchange rates. Please check console for details.";
        console.error("Error:", error);
    }
}

// Load currencies when the page loads
document.addEventListener("DOMContentLoaded", fetchCurrencies);