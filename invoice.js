// ==================== INVOICE HANDLER ====================

// Keep invoice history in localStorage
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
    const invoiceData = await generateInvoiceData(formData);

    // ✅ Call API
    const pdfUrl = await callInvoiceGeneratorAPI(invoiceData);

    if (pdfUrl) {
      // Save to history
      const invoiceRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        customerName: formData.get("name"),
        type: formData.get("type"),
        total: invoiceData.total,
        pdfUrl: pdfUrl,
        status: 'success',
        data: invoiceData
      };

      invoiceHistory.unshift(invoiceRecord);
      localStorage.setItem('welderInvoices', JSON.stringify(invoiceHistory));

      showStatus('Invoice generated successfully!', 'success');

      document.getElementById('invoiceForm').reset();
    }
  } catch (error) {
    console.error('Error generating invoice:', error);
    showStatus('Error generating invoice: ' + error.message, 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.classList.remove('loading');
  }
}

// -------------------- Prepare Invoice Data --------------------
async function generateInvoiceData(formData) {
  const items = Array.from(document.querySelectorAll("#items .item")).map(item => ({
    name: item.querySelector("[name=description]").value.trim(),
    quantity: parseInt(item.querySelector("[name=quantity]").value),
    unit_cost: parseFloat(item.querySelector("[name=price]").value)
  }));

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

  return {
    from: "Welder Business", // you can change to dynamic business info
    to: formData.get("name") + "\n" + formData.get("address"),
    logo: "", // optional logo URL
    number: Math.floor(Math.random() * 10000) + 1000,
    currency: "NGN",
    date: new Date().toLocaleDateString(),
    payment_terms: "Due on receipt",
    items: items,
    total: total,
    fields: { tax: "%", discounts: true, shipping: true },
    type: formData.get("type")
  };
}

// -------------------- API Call --------------------
async function callInvoiceGeneratorAPI(invoiceData) {
  const API_KEY = "sk_Xh3mghsV7p4Evpudq6VZ1OTqRuZ2rxU0"; // put your real API key here

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
  downloadPDF(blob, `${invoiceData.type || 'Invoice'}-${invoiceData.number}.pdf`);
  return URL.createObjectURL(blob); // return for history/preview
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
  let statusBox = document.getElementById("statusBox");
  if (!statusBox) {
    statusBox = document.createElement("div");
    statusBox.id = "statusBox";
    document.body.appendChild(statusBox);
  }
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}

// -------------------- WhatsApp & Email --------------------
function sendWhatsApp() {
  const phone = prompt("Enter client WhatsApp number (e.g. 2348012345678):");
  const text = "Hello, here is your quotation/invoice. Please check the attached file.";
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
}

function sendEmail() {
  const email = prompt("Enter client email:");
  const subject = "Your Welding Quotation/Invoice";
  const body = "Hello, please find attached your quotation/invoice.";
  window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
}
