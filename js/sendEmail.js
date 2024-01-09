async function sendMail(selectedSearchedDrugs, userInfo) {
  const serviceID = "service_g2s6tai";
  const templateID = "template_vcdmecb";

  let medicationsList = ``;

  selectedSearchedDrugs.forEach((medication) => {
    medicationsList += `
          ${medication.name} \n
      `;
  });

  try {
    let response = await emailjs.send(serviceID, templateID, {
      name: "SOS Pharma BOT",
      email: "sospharma@order.com",
      message: `
        Order Details. 
        \nList of drugs \n${medicationsList}
        User Details
        \n
        name: ${JSON.stringify(userInfo["name"])}
        address: ${JSON.stringify(userInfo["address"])}
        phone: ${JSON.stringify(userInfo["phone"])}
      `,
    });
    console.log(response);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
