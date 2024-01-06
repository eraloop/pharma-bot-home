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
    const medicationPrice = medication.price;

    tableHtml += `
          <tr>
            <td>${index}</td>
            <td>${medicationName}</td>
            <td>XAF ${medicationPrice.toLocaleString()}</td>
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
          </tr>
        </thead>
        <tbody class="table-striped">
    `;

  medications.forEach((medication) => {
    const medicationName = medication.name;
    const medicationPrice = medication.price;

    tableHtml += `
        <tr>
          <td>${medicationName}</td>
          <td>XAF ${medicationPrice.toLocaleString()}</td>
        </tr>
      `;
  });

  // Add the total cost row at the bottom of the table
  tableHtml += `
        <tr>
          <td>Total Cost:</td>
          <td>XAF ${totalCost.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
    `;

  return tableHtml;
}
