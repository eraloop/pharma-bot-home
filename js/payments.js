
async function getAccessToken(username, password) {
  try {
    const response = await axios.post(
      'https://www.campay.net/api/token/',
      {
        username: username,
        password: password,
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
      }
    );

    const token = response.data.token;
    console.log("token from accessToken function " + token);

    if (!token) {
      return {
        success: false,
      };
    } else {
      return {
        success: true,
        token: token,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}


async function mobilePayment(token, data) {
  console.log("data entering payment function", data);
  console.log("token entering payment function", token);

  try {
    const response = await axios.post(
      'https://www.campay.net/api/collect/',
      {
        amount: "5",
        from: "237"+data['phone'],
        description: data['description'],
        external_reference: data['reference'],
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token,
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          // 'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
        },
      }
    );

    const result = response.data;
    console.log("result from payment function " + JSON.stringify(result));

    const reference = result.reference;
    const operator = result.operator;
    const status = result.status;

    if (reference === undefined || reference === '' || status === 'FAILED' ) {
      return {
        success: false,
      };
    } 
    else {
      return {
        success: true,
        reference: reference,
        operator: operator,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}


async function requestPaymentStatus(token, transactionId) {
  console.log("token ", token);
  console.log("transactionId ", transactionId);

  try {
    const response = await axios.get(`https://www.campay.net/api/transaction/${transactionId}/`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + token,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });

    const result = response.data;
    console.log("result from payment status function ", result);
    const status = result.status;
    const reference = result.reference;

    console.log(status);

    if (status === 'SUCCESSFUL') {
      return {
        success: true,
        status: status,
        reference: reference,
      };
    }else if(status === "PENDING"){
      return {
        success: true,
        status: status,
        reference: reference,
      };
    }else{
      return {
        success: false,
      };
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
    };
  }
}


async function getPaymentLink(token){
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Token " + token);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "amount": "5",
      "currency": "XAF",
      "description": "Test",
      "external_reference": "",
      "redirect_url": "https://taupe-frangollo-a700dd.netlify.app/chat"
    });
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    const response = await fetch(`https://www.campay.net/api/get_payment_link/`, requestOptions);
    const result = await response.text();

    const link = JSON.parse(result)["link"];

    if(link === undefined || link === ''){
      return {
        success: true,
        link: link
      };
    }else{
      return {
        success: true,
        link: link
      };
    }

  } catch (error) {
    console.error('Error:', error);
  }
}


async function paymentWidget(body) {
  return new Promise((resolve, reject) => {
    campay.options({
      payButtonId: "payButton",
      description: body['description'],
      amount: body['amount'],
      currency: "XAF",
      externalReference: body['reference'],
      redirectUrl: "",
    });

    campay.onSuccess = function (data) {
      console.log("payment success full", data);
      transactionId = data.reference;
      resolve(data);
    };

    campay.onFail = function (data) {
      console.log("payment failed", data);
      reject(new Error("Payment failed."));
    };
  });
}