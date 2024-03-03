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
      name: orderInfo['external_reference'],
      email: "sospharma@order.com",

      message: `
        Détails de la commande. \n
        Order Id : ${JSON.stringify(orderInfo['orderId'])} 
        Numéro de référence du paiement : ${JSON.stringify(orderInfo['paymentReference'])} 
        Coût total : ${totalCost}

        Liste des médicaments :
        ${medicationsList}

        Détails de l'utilisateur :
        Nom du client : ${JSON.stringify(userInfo["name"])}
        Adresse du client - ville : ${JSON.stringify(userInfo["city"])}
        Adresse du client - livrasion : ${JSON.stringify(userInfo["quarter"])}
        Numéro de téléphone du client : ${JSON.stringify(userInfo["phone"])}
      `,

    });
    return true;
  } catch (e) {
    return false;
  }
}
