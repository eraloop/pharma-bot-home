// generates the table to display user requested medication picked from their initial request
function prepareMedicationTable(medications) {
  let tableHtml = `
      <table id="table table-striped medication-table">
        <thead class="thead-dark">
          <tr>
            <th>No.</th>
            <th>Medication Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
    `;

  medications.forEach((medication, index) => {
    const medicationName = medication.name;
    const medicationPrice = medication.cm_price;

    tableHtml += `
          <tr>
            <td>${index}</td>
            <td>${medicationName}</td>
            <td>XAF${medicationPrice}</td>
          </tr>
      `;
  });

  // Close the tbody and table tags outside the loop
  tableHtml += `
        </tbody>
      </table>
    `;

  return tableHtml;
}

// generates table for user medication to after user selected their qauntity and weights, it also shows them their total cost
// and cost per medication based on the unit price and quantity
function prepareMedicationDataTable(medications, totalCost) {
  let tableHtml = `
      <table id="table table-striped medication-table">
        <thead class="thead-dark">
          <tr>
            <th>Medication Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody class="table-striped">
    `;

  medications.forEach((medication) => {
    const medicationName = medication.name;
    const medicationPrice = medication.price;
    const quantity = medication.quantity;
    const cost = quantity * medicationPrice;

    tableHtml += `
        <tr>
          <td>${medicationName}</td>
          <td>XAF${medicationPrice}</td>
          <td>${quantity}</td>
          <td>XAF${cost}</td>
        </tr>
      `;
  });

  // Add the total cost row at the bottom of the table
  tableHtml += `
        <tr>
          <td colspan="3">Total Cost:</td>
          <td>XAF${totalCost}</td>
        </tr>
      </tbody>
    </table>
    `;

  return tableHtml;
}
