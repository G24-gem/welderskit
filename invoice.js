const { jsPDF } = window.jspdf;

document.getElementById("addItem").addEventListener("click", () => {
  const div = document.createElement("div");
  div.className = "item";
  div.innerHTML = `
    <input type="text" name="description" placeholder="Material" required>
    <input type="number" name="quantity" placeholder="Qty" required>
    <input type="number" name="price" placeholder="Unit Price (₦)" required>
  `;
  document.getElementById("items").appendChild(div);
});

document.getElementById("invoiceForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const items = Array.from(document.querySelectorAll("#items .item")).map(item => ({
    description: item.querySelector("[name=description]").value,
    quantity: parseInt(item.querySelector("[name=quantity]").value),
    price: parseFloat(item.querySelector("[name=price]").value),
    total: parseInt(item.querySelector("[name=quantity]").value) * parseFloat(item.querySelector("[name=price]").value)
  }));

  const doc = new jsPDF();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.text(`Welder's ${form.get("type")}`, 20, y);
  y += 10;

  // Customer Info
  doc.setFontSize(12);
  doc.text(`Customer: ${form.get("name")}`, 20, y); y += 7;
  doc.text(`Address: ${form.get("address")}`, 20, y); y += 15;

  // Table Header
  doc.text("Description", 20, y);
  doc.text("Qty", 100, y);
  doc.text("Unit Price", 120, y);
  doc.text("Total", 170, y);
  y += 7;

  let grandTotal = 0;

  items.forEach(item => {
    doc.text(item.description, 20, y);
    doc.text(item.quantity.toString(), 100, y);
    doc.text(item.price.toFixed(2), 120, y);
    doc.text(item.total.toFixed(2), 170, y);
    grandTotal += item.total;
    y += 7;
  });

  y += 10;
  doc.setFontSize(14);
  doc.text(`Grand Total: ₦${grandTotal.toFixed(2)}`, 20, y);

  // Save PDF
  doc.save(`${form.get("type")}-${Date.now()}.pdf`);
});

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

