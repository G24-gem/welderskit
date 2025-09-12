  // Global variables
        let invoiceHistory = JSON.parse(localStorage.getItem('welderInvoices') || '[]');

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadBusinessInfo();
            displayInvoiceHistory();
            
            // Add Item functionality
            document.getElementById("addItem").addEventListener("click", function() {
                const itemsContainer = document.getElementById("items");
                const newItem = document.createElement("div");
                newItem.className = "item";
                newItem.innerHTML = `
                    <input type="text" name="description" placeholder="Material (e.g. 3'' Pipe)" required>
                    <input type="number" name="quantity" placeholder="Qty" min="1" required>
                    <input type="number" name="price" placeholder="Unit Price (₦)" min="0" step="0.01" required>
                    <button type="button" class="remove-item" onclick="removeItem(this)">Remove</button>
                `;
                itemsContainer.appendChild(newItem);
            });

            // Form submission
            document.getElementById("invoiceForm").addEventListener("submit", handleFormSubmit);
            
            // Save business info when changed
            const businessInputs = document.querySelectorAll('[name^="business"]');
            businessInputs.forEach(input => {
                input.addEventListener('change', saveBusinessInfo);
            });
        });

        // Tab switching
        function switchTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById(tabName + 'Tab').classList.add('active');
            event.target.classList.add('active');
            
            if (tabName === 'history') {
                displayInvoiceHistory();
            }
        }

        // Save business info to localStorage
        function saveBusinessInfo() {
            const businessInfo = {
                name: document.querySelector('[name="businessName"]').value,
                email: document.querySelector('[name="businessEmail"]').value,
                phone: document.querySelector('[name="businessPhone"]').value,
                address: document.querySelector('[name="businessAddress"]').value
            };
            localStorage.setItem('welderBusinessInfo', JSON.stringify(businessInfo));
        }

        // Load business info from localStorage
        function loadBusinessInfo() {
            const savedInfo = JSON.parse(localStorage.getItem('welderBusinessInfo') || '{}');
            if (savedInfo.name) document.querySelector('[name="businessName"]').value = savedInfo.name;
            if (savedInfo.email) document.querySelector('[name="businessEmail"]').value = savedInfo.email;
            if (savedInfo.phone) document.querySelector('[name="businessPhone"]').value = savedInfo.phone;
            if (savedInfo.address) document.querySelector('[name="businessAddress"]').value = savedInfo.address;
        }

        // Handle form submission
        async function handleFormSubmit(e) {
            e.preventDefault();
            
            const submitBtn = document.querySelector('.generate-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Generating...';
            submitBtn.classList.add('loading');

            try {
                const formData = new FormData(e.target);
                const invoiceData = await generateInvoiceData(formData);
                
                // Call InvoiceGenerator API
                const pdfUrl = await callInvoiceGeneratorAPI(invoiceData);
                
                if (pdfUrl) {
                    // Save to history
                    const invoiceRecord = {
                        id: Date.now(),
                        date: new Date().toISOString(),
                        customerName: formData.get("customerName"),
                        type: formData.get("type"),
                        total: invoiceData.total,
                        pdfUrl: pdfUrl,
                        status: 'success',
                        data: invoiceData
                    };
                    
                    invoiceHistory.unshift(invoiceRecord);
                    localStorage.setItem('welderInvoices', JSON.stringify(invoiceHistory));
                    
                    // Download PDF
                    window.open(pdfUrl, '_blank');
                    
                    showStatus('Invoice generated successfully!', 'success');
                    
                    // Reset form
                    document.getElementById('invoiceForm').reset();
                    loadBusinessInfo();
                } else {
                    throw new Error('Failed to generate invoice');
                }

            } catch (error) {
                console.error('Error generating invoice:', error);
                showStatus('Error generating invoice: ' + error.message, 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('loading');
            }
        }

        // Generate invoice data structure
        async function generateInvoiceData(formData) {
            // Collect all items
            const items = Array.from(document.querySelectorAll("#items .item")).map(item => {
                const description = item.querySelector("[name=description]").value.trim();
                const quantity = parseInt(item.querySelector("[name=quantity]").value);
                const price = parseFloat(item.querySelector("[name=price]").value);
                
                return {
                    name: description,
                    quantity: quantity,
                    unit_cost: price
                };
            }).filter(item => item.name && !isNaN(item.quantity) && !isNaN(item.unit_cost));

            if (items.length === 0) {
                throw new Error('Please add at least one valid item.');
            }

            const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

            return {
                from: formData.get("businessName"),
                to: formData.get("customerName"),
                logo: "", // You can add logo URL here
                number: Math.floor(Math.random() * 10000) + 1000,
                date: new Date().toISOString().split('T')[0],
                due_date: formData.get("dueDate") || null,
                items: items,
                notes: formData.get("notes") || "",
                terms: "Payment is due within 30 days",
                total: total,
                currency: "NGN",
                business_info: {
                    name: formData.get("businessName"),
                    email: formData.get("businessEmail"),
                    phone: formData.get("businessPhone"),
                    address: formData.get("businessAddress")
                },
                customer_info: {
                    name: formData.get("customerName"),
                    email: formData.get("customerEmail"),
                    address: formData.get("customerAddress")
                }
            };
        }

      // Call InvoiceGenerator.com API
async function callInvoiceGeneratorAPI(invoiceData) {
    try {
        const API_KEY = "sk_Xh3mghsV7p4Evpudq6VZ1OTqRuZ2rxU0"; // replace with your actual API key

        const response = await fetch("https://invoice-generator.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(invoiceData)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        return pdfUrl; // returns the actual PDF blob
    } catch (error) {
        console.error("API Error:", error);
        throw error; // don’t fallback, fail if API fails
    }
}

        // Display invoice history
        function displayInvoiceHistory() {
            const historyContainer = document.getElementById('invoiceHistory');
            
            if (invoiceHistory.length === 0) {
                historyContainer.innerHTML = '<p>No invoices found. Create your first invoice!</p>';
                return;
            }

            const historyHTML = invoiceHistory.map(invoice => `
                <div class="invoice-item">
                    <div>
                        <strong>${invoice.customerName}</strong>
                        <span class="status-indicator status-${invoice.status}">${invoice.status}</span>
                        <br>
                        <small>${new Date(invoice.date).toLocaleDateString()} - ${invoice.type} - ₦${invoice.total.toFixed(2)}</small>
                    </div>
                    <div class="invoice-actions">
                        <button class="download-btn" onclick="downloadInvoice('${invoice.pdfUrl}')">Download</button>
                        <button class="delete-btn" onclick="deleteInvoice(${invoice.id})">Delete</button>
                    </div>
                </div>
            `).join('');

            historyContainer.innerHTML = historyHTML;
        }

        // Download invoice
        function downloadInvoice(pdfUrl) {
            window.open(pdfUrl, '_blank');
        }

        // Delete invoice
        function deleteInvoice(invoiceId) {
            if (confirm('Are you sure you want to delete this invoice?')) {
                invoiceHistory = invoiceHistory.filter(invoice => invoice.id !== invoiceId);
                localStorage.setItem('welderInvoices', JSON.stringify(invoiceHistory));
                displayInvoiceHistory();
            }
        }

        // Clear all history
        function clearHistory() {
            if (confirm('Are you sure you want to clear all invoice history?')) {
                localStorage.removeItem('welderInvoices');
                invoiceHistory = [];
                displayInvoiceHistory();
            }
        }

        // Remove item function
        function removeItem(button) {
            const item = button.closest('.item');
            const itemsContainer = document.getElementById('items');
            
            if (itemsContainer.children.length > 1) {
                item.remove();
            } else {
                alert('You must have at least one item.');
            }
        }

        // Show status message
        function showStatus(message, type) {
            const statusDiv = document.getElementById('apiStatus');
            statusDiv.className = `api-status status-${type}`;
            statusDiv.textContent = message;
            statusDiv.style.display = 'block';
            
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }

        // WhatsApp sharing function
        function sendWhatsApp() {
            const phone = prompt("Enter client WhatsApp number (e.g. 2348012345678):");
            if (phone) {
                const text = "Hello, here is your quotation/invoice. Please check the attached file.";
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
            }
        }

        // Email sharing function
        function sendEmail() {
            const email = prompt("Enter client email:");
            if (email) {
                const subject = "Your Welding Quotation/Invoice";
                const body = "Hello, please find attached your quotation/invoice.";
                window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
            }
        }
