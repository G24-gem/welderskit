// ==================== INVOICE HANDLER ====================

// Load invoice history
let invoiceHistory = JSON.parse(localStorage.getItem('welderInvoices')) || [];

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

    // Render invoice preview HTML
    const invoiceHTML = buildInvoiceHTML(invoiceData);

    // Generate PDF with html2pdf.js
    const opt = {
      margin: 10,
      filename: `${invoiceData.type}-${invoiceData.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().from(invoiceHTML).set(opt).save();

    // Save to localStorage
    const invoiceRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      customerName: formData.get("name"),
      type: invoiceData.type,
      total: invoiceData.total,
      fileName: opt.filename,
      status: 'success',
      data: invoiceData
    };

    invoiceHistory.unshift(invoiceRecord);
    localStorage.setItem('welderInvoices', JSON.stringify(invoiceHistory));

    showStatus('✅ Invoice generated and saved to history.', 'success');
    e.target.reset();

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
    quantity: parseInt(item.querySelector("[name=quantity]").value),
    unit_cost: parseFloat(item.querySelector("[name=price]").value)
  }));

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

  return {
    from: "Welder Business",
    to: formData.get("name") + "<br>" + formData.get("address"),
    number: Math.floor(Math.random() * 10000) + 1000,
    currency: "₦",
    date: new Date().toLocaleDateString(),
    items: items,
    total: total,
    type: formData.get("type")
  };
}

// -------------------- Build Invoice HTML --------------------
function buildInvoiceHTML(data) {
  return `
    <div style="font-family: Arial, sans-serif; padding:20px; max-width:800px;">
      <h1 style="text-align:center;">${data.type}</h1>
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Invoice No:</strong> ${data.number}</p>
      <p><strong>From:</strong> ${data.from}</p>
      <p><strong>To:</strong><br>${data.to}</p>
      <table style="width:100%; border-collapse: collapse; margin-top:20px;">
        <thead>
          <tr>
            <th style="border:1px solid #000; padding:8px;">Item</th>
            <th style="border:1px solid #000; padding:8px;">Qty</th>
            <th style="border:1px solid #000; padding:8px;">Unit Cost</th>
            <th style="border:1px solid #000; padding:8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td style="border:1px solid #000; padding:8px;">${item.name}</td>
              <td style="border:1px solid #000; padding:8px; text-align:center;">${item.quantity}</td>
              <td style="border:1px solid #000; padding:8px; text-align:right;">${data.currency}${item.unit_cost.toFixed(2)}</td>
              <td style="border:1px solid #000; padding:8px; text-align:right;">${data.currency}${(item.quantity * item.unit_cost).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <h2 style="text-align:right; margin-top:20px;">Total: ${data.currency}${data.total.toFixed(2)}</h2>
    </div>
  `;
}

// -------------------- Status Messages --------------------
function showStatus(message, type) {
  let statusBox = document.getElementById("statusBox");
  if (!statusBox) {
    statusBox = document.createElement("div");
    statusBox.id = "statusBox";
    document.body.appendChild(statusBox);
  }
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}
