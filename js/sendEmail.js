async function sendMail(selectedSearchedDrugs, userInfo, orderInfo) {
  const serviceID = "service_g2s6tai";
  const templateID = "template_vcdmecb";

  let medicationsList = ``;

  selectedSearchedDrugs.forEach((medication) => {
    medicationsList += `
          ${medication.name} \n
      `;
  });

  try {
    await emailjs.send(serviceID, templateID, {
      name: userInfo["name"],
      email: "sospharma@order.com",
      message: `
        Order Details. \n
        Order Id: ${JSON.stringify(orderInfo['orderId'])} 
        Payment Reference No: ${JSON.stringify(orderInfo['paymentReference'])} 
        Payment Phone: ${JSON.stringify(orderInfo['paymentPhone'])}.

        \n List of drugs: \n 
        ${medicationsList}

        \n User Details \n
        name: ${JSON.stringify(userInfo["name"])}
        address: ${JSON.stringify(userInfo["address"])}
        phone: ${JSON.stringify(userInfo["phone"])}
      `,
    });
    return true;
  } catch (e) {
    return false;
  }
}
