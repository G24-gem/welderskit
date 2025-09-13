// ==================== INVOICE HANDLER ====================

const API_BASE_URL = "https://invoice-backend-lh01.onrender.com";

// -------------------- Tab Switching --------------------
function switchTab(tabName) {
  // Remove active class from all tabs and content
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // Add active class to clicked tab and corresponding content
  event.target.classList.add('active');
  document.getElementById(tabName + 'Tab').classList.add('active');
  
  // Load history when switching to history tab
  if (tabName === 'history') {
    loadInvoiceHistory();
  }
}

// -------------------- Form Submit --------------------
document.getElementById("invoiceForm").addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = document.querySelector('.generate-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Generating...';
  submitBtn.classList.add('loading');

  try {
    const formData = new FormData(e.target);
    const invoiceData = prepareInvoiceData(formData);

    // Call your Flask backend
    const response = await fetch(`${API_BASE_URL}/api/invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Backend error ${response.status}: ${errorData}`);
    }

    // Get PDF blob
    const blob = await response.blob();
    const fileName = `${invoiceData.type || 'invoice'}-${invoiceData.number}.pdf`;

    // Download the PDF
    downloadPDF(blob, fileName);

    showStatus('✅ Invoice generated successfully!', 'success');
    e.target.reset();
    
    // Refresh history if we're on the history tab
    if (document.getElementById('historyTab').classList.contains('active')) {
      loadInvoiceHistory();
    }

  } catch (error) {
    console.error('Error generating invoice:', error);
    showStatus('❌ Error: ' + error.message, 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.classList.remove('loading');
  }
}

// -------------------- Prepare Invoice Data --------------------
function prepareInvoiceData(formData) {
  const items = Array.from(document.querySelectorAll("#items .item")).map(item => ({
    name: item.querySelector("[name=description]").value.trim(),
    quantity: parseInt(item.querySelector("[name=quantity]").value) || 1,
    unit_cost: parseFloat(item.querySelector("[name=price]").value) || 0
  })).filter(item => item.name); // Remove empty items

  // Build business info
  const businessInfo = [
    formData.get("businessName"),
    formData.get("businessEmail"),
    formData.get("businessPhone"),
    formData.get("businessAddress")
  ].filter(info => info).join("\\n");

  // Build customer info
  const customerInfo = [
    formData.get("customerName"),
    formData.get("customerEmail"),
    formData.get("customerAddress")
  ].filter(info => info).join("\\n");

  const invoiceNumber = Math.floor(Math.random() * 10000) + 1000;
  const dueDate = formData.get("dueDate") || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];

  return {
    from: businessInfo || "Your Welding Business",
    to: customerInfo || "Customer",
    number: invoiceNumber,
    currency: "NGN",
    date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY format
    due_date: new Date(dueDate).toLocaleDateString('en-GB'),
    payment_terms: "Due on receipt",
    items: items,
    fields: { 
      tax: false,
      discounts: false, 
      shipping: false 
    },
    notes: formData.get("notes") || "Thank you for your business!",
    terms: "Payment due within 30 days."
  };
}

// -------------------- Invoice History Functions --------------------
async function loadInvoiceHistory() {
  const historyContainer = document.getElementById('invoiceHistory');
  
  try {
    historyContainer.innerHTML = '<p>Loading invoice history...</p>';
    
    const response = await fetch(`${API_BASE_URL}/api/invoices`);
    
    if (!response.ok) {
      throw new Error(`Failed to load history: ${response.status}`);
    }
    
    const data = await response.json();
    const invoices = data.invoices || [];
    
    if (invoices.length === 0) {
      historyContainer.innerHTML = '<p>No invoices found. Create your first invoice!</p>';
      return;
    }
    
    const historyHTML = invoices.map(invoice => `
      <div class="invoice-item" data-id="${invoice.id}">
        <div>
          <h4>Invoice #${invoice.invoice_number}</h4>
          <p><strong>Client:</strong> ${invoice.client_name}</p>
          <p><strong>Amount:</strong> ₦${parseFloat(invoice.amount).toLocaleString()}</p>
          <p><strong>Date:</strong> ${new Date(invoice.date_created).toLocaleDateString()}</p>
        </div>
        <div class="invoice-actions">
          <button onclick="viewInvoiceDetails(${invoice.id})" class="download-btn">
            View Details
          </button>
          <button onclick="regenerateInvoice(${invoice.id})" class="download-btn">
            Download PDF
          </button>
          <button onclick="deleteInvoiceItem(${invoice.id})" class="delete-btn">
            Delete
          </button>
        </div>
      </div>
    `).join('');
    
    historyContainer.innerHTML = historyHTML;
    
  } catch (error) {
    console.error('Error loading invoice history:', error);
    historyContainer.innerHTML = `<p style="color: red;">Error loading history: ${error.message}</p>`;
  }
}

// View invoice details
async function viewInvoiceDetails(invoiceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`);
    
    if (!response.ok) {
      throw new Error('Failed to load invoice details');
    }
    
    const invoice = await response.json();
    
    // Create a simple modal or alert with invoice details
    const details = `
Invoice #${invoice.invoice_number}
Client: ${invoice.client_name}
Amount: ₦${parseFloat(invoice.amount).toLocaleString()}
Date: ${new Date(invoice.date_created).toLocaleDateString()}
Items: ${invoice.invoice_data.items.length} item(s)
    `;
    
    alert(details);
    
  } catch (error) {
    console.error('Error loading invoice details:', error);
    alert('Error loading invoice details');
  }
}

// Regenerate PDF for existing invoice
async function regenerateInvoice(invoiceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`);
    
    if (!response.ok) {
      throw new Error('Failed to load invoice data');
    }
    
    const invoice = await response.json();
    
    // Use stored invoice data to regenerate PDF
    const pdfResponse = await fetch(`${API_BASE_URL}/api/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice.invoice_data)
    });
    
    if (!pdfResponse.ok) {
      throw new Error('Failed to regenerate PDF');
    }
    
    const blob = await pdfResponse.blob();
    downloadPDF(blob, invoice.pdf_filename);
    
    showStatus('✅ PDF downloaded successfully!', 'success');
    
  } catch (error) {
    console.error('Error regenerating invoice:', error);
    showStatus('❌ Error downloading PDF: ' + error.message, 'error');
  }
}

// Delete invoice
async function deleteInvoiceItem(invoiceId) {
  if (!confirm('Are you sure you want to delete this invoice?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete invoice');
    }
    
    showStatus('✅ Invoice deleted successfully!', 'success');
    loadInvoiceHistory(); // Refresh the list
    
  } catch (error) {
    console.error('Error deleting invoice:', error);
    showStatus('❌ Error deleting invoice: ' + error.message, 'error');
  }
}

// Clear all history
async function clearHistory() {
  if (!confirm('Are you sure you want to delete ALL invoices? This cannot be undone!')) {
    return;
  }
  
  try {
    // Get all invoices first
    const response = await fetch(`${API_BASE_URL}/api/invoices`);
    const data = await response.json();
    const invoices = data.invoices || [];
    
    // Delete each invoice
    for (const invoice of invoices) {
      await fetch(`${API_BASE_URL}/api/invoices/${invoice.id}`, {
        method: 'DELETE'
      });
    }
    
    showStatus('✅ All invoices deleted successfully!', 'success');
    loadInvoiceHistory(); // Refresh the list
    
  } catch (error) {
    console.error('Error clearing history:', error);
    showStatus('❌ Error clearing history: ' + error.message, 'error');
  }
}

// -------------------- PDF Download --------------------
function downloadPDF(pdfBlob, fileName) {
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// -------------------- Status Messages --------------------
function showStatus(message, type) {
  let statusBox = document.getElementById("apiStatus");
  if (!statusBox) {
    statusBox = document.createElement("div");
    statusBox.id = "apiStatus";
    statusBox.className = "api-status";
    document.querySelector('.invoice-container').insertBefore(statusBox, document.querySelector('.tabs'));
  }
  
  statusBox.textContent = message;
  statusBox.className = `api-status status-${type}`;
  statusBox.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    statusBox.style.display = 'none';
  }, 5000);
}

// -------------------- Add/Remove Items --------------------
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

function removeItem(button) {
  const itemsContainer = document.getElementById("items");
  if (itemsContainer.children.length > 1) {
    button.parentElement.remove();
  }
}

// -------------------- Initialize --------------------
document.addEventListener('DOMContentLoaded', function() {
  // Test backend connection
  fetch(`${API_BASE_URL}/api/test`)
    .then(response => response.json())
    .then(data => {
      if (data.api_key_loaded) {
        showStatus('✅ Backend connected successfully!', 'success');
      } else {
        showStatus('⚠️ Backend connected but API key not configured', 'error');
      }
    })
    .catch(error => {
      showStatus('❌ Cannot connect to backend: ' + error.message, 'error');
    });
});
