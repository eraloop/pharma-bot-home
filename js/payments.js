function getAccessToken(username, password) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    username: username,
    password: password,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("https://demo.campay.net/api/token/", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
      return {
        success: true,
        token: result["token"],
      };
    })
    .catch((error) => {
      console.log(error);
      return {
        success: false,
      };
    });
}

function mobilePayment(token, body) {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Token  " + token);
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    amount: body["amount"],
    from: body["phone_number"],
    description: body["description"],
    external_reference: "",
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("https://demo.campay.net/api/collect/", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      return {
        success: true,
        data: result,
      };
    })
    .catch((error) => {
      return {
        success: false,
      };
    });
}
