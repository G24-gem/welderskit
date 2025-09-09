document.getElementById("invoiceForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect form data
  const form = new FormData(e.target);
  const items = Array.from(document.querySelectorAll("#items .item")).map(item => ({
    name: item.querySelector("[name=description]").value,
    quantity: parseInt(item.querySelector("[name=quantity]").value),
    unit_cost: parseFloat(item.querySelector("[name=price]").value)
  }));

  const data = {
    from: "Welder Business",
    to: form.get("name") + "\n" + form.get("address"),
    logo: "https://your-logo-url.png", // optional
    number: Math.floor(Math.random() * 10000), // invoice number
    currency: "NGN",
    date: new Date().toLocaleDateString(),
    payment_terms: "Due on receipt",
    items: items,
    fields: { tax: "%", discounts: true, shipping: true },
    type: form.get("type") // Invoice or Quotation
  };

  // Call API
  const response = await fetch("https://invoice-generator.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  // Get PDF blob
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  // Download automatically
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.type}-${data.number}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
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
