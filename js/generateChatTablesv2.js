// generates the table to display user requested medication picked from their initial request
function prepareMedicationTable(medications) {

  let tableHtml =  locale === 'en'  ? 
    `
      <table id="table table-striped medication-table">
        <thead class="thead-dark">
          <tr>
            <th class='p-3'>Medication Name</th>
            <th class='p-3'>Price</th>
            <th class='p-3'>Action</th>
          </tr>
        </thead>
        <tbody>
    ` : 
    `
      <table id="table table-striped medication-table">
        <thead class="thead-dark">
          <tr>
            <th class='p-3'>Nom du médicament</th>
            <th class='p-3'>Prix</th>
            <th class='p-3'>Action</th>
          </tr>
        </thead>
        <tbody>
  `;;

  medications.length != 0 ?
  medications.forEach((medication, index) => {
    const medicationName = medication.name;
    const medicationPrice = medication.price;

    tableHtml +=   locale === 'en'  ? `
          <tr>
            <td class='p-2'>${medicationName}</td>
            <td class='p-2'>XAF ${medicationPrice.toLocaleString()}</td>
            <td class='p-2'><button class="btn btn-success btn-sm select-medication-option" onclick="addMedicationToCart(${index})">Select</button></td>
          </tr>
      ` : 
      `
          <tr>
            <td class='p-2'>${medicationName}</td>
            <td class='p-2'>XAF ${medicationPrice.toLocaleString()}</td>
            <td class='p-2'><button class="btn btn-success btn-sm select-medication-option" onclick="addMedicationToCart(${index})">Sélectionner</button></td>
          </tr>
      `;
  }) : 

  tableHtml += `
    <tr>
      <td colspan="3" > Aucun médicament n'est disponible, veuillez retourner à la page précédente.</td>
    </tr>
  `;

  // Close the tbody and table tags outside the loop
  tableHtml += `
        </tbody>
      </table>
    `;

  return tableHtml;
}

// generates table for user medication to after user selected their qauntity and weights, it also shows them their total cost
// and cost per medication based on the unit price and quantity
function prepareMedicationDataTable(medications, totalCost, deliveryCost, sosPharmaCost) {
  let tableHtml = locale === 'en' ?`
      <table id="table table-striped medication-table">
        <thead class="thead-dark">
          <tr>
            <th class='p-3'>Medication Name</th>
            <th class='p-3'>Quantity</th>
            <th class='p-3'>Price</th>
            <th class='p-3'>Cost</th>
          </tr>
        </thead>
        <tbody class="table-striped">
    ` : 
    `
    <table id="table table-striped medication-table">
        <thead class="thead-dark">
          <tr>
            <th class='p-3'>Médicament</th>
            <th class='p-3'>Qte</th>
            <th class='p-3'>Prix</th>
            <th class='p-3'>Coût</th>
          </tr>
        </thead>
        <tbody class="table-striped">
    `
    ;

  medications.forEach((medication) => {
    const medicationName = medication.name;
    const medicationPrice = medication.price;
    const cost = medicationPrice * medication.quantity;

    tableHtml += `
        <tr>
          <td class='p-2'>${medicationName}</td>
          <td class='p-2'>${medication.quantity}</td>
          <td class='p-2'>XAF ${medicationPrice.toLocaleString()}</td>
          <td class='p-2'>XAF ${cost.toLocaleString()}</td>
        </tr>
      `;
  });

  // Add the total cost row at the bottom of the table
  tableHtml += `
        <tr>
          <td colspan="3"> ${ locale == 'en' ? 'Delivery Cost': 'Frais de service'}</td>
          <td>XAF ${deliveryCost.toLocaleString()}</td>
        </tr>
        <tr>
          <td colspan="3">${ locale == 'en' ? 'SOS Pharma Charges': 'Coût de SOS Pharma'} </td>
          <td>XAF ${sosPharmaCost.toLocaleString()}</td>
        </tr>
        <tr>
          <td class='bold-text' colspan="3">${ locale == 'en' ? 'Total Cost' : 'Montant total'} </td>
          <td>XAF ${totalCost.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
    `
    ;

  return tableHtml;
}
