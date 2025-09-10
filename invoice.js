  // Add item button
  document.getElementById("addItem").addEventListener("click", () => {
    const div = document.createElement("div");
    div.classList.add("item");
    div.innerHTML = `
      <input type="text" name="description" placeholder="Material (e.g. 3'' Pipe)" required>
      <input type="number" name="quantity" placeholder="Qty" required>
      <input type="number" name="price" placeholder="Unit Price (₦)" required>
    `;
    document.getElementById("items").appendChild(div);
  });

  // Form submit
  document.getElementById("invoiceForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect customer info
    const form = new FormData(e.target);
    const items = Array.from(document.querySelectorAll("#items .item")).map(item => ({
      name: item.querySelector("[name=description]").value,
      quantity: parseInt(item.querySelector("[name=quantity]").value),
      unit_cost: parseFloat(item.querySelector("[name=price]").value)
    }));

    const data = {
      from: "Welder Business",
      to: form.get("name") + "\n" + form.get("address"),
      number: Math.floor(Math.random() * 10000),
      currency: "NGN",
      date: new Date().toLocaleDateString(),
      payment_terms: "Due on receipt",
      items: items,
      fields: { tax: "%", discounts: true, shipping: true },
      type: form.get("type")
    };

    // Call API
    const response = await fetch("https://invoice-generator.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Auto download PDF
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.type}-${data.number}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // WhatsApp share
  function sendWhatsApp() {
    const phone = prompt("Enter client WhatsApp number (e.g. 2348012345678):");
    const text = "Hello, here is your quotation/invoice. Please check the attached file.";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  }

  // Email share
  function sendEmail() {
    const email = prompt("Enter client email:");
    const subject = "Your Welding Quotation/Invoice";
    const body = "Hello, please find attached your quotation/invoice.";
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

