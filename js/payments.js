
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
        amount: data['amount'],
        from: '237' + data['phone'],
        description: data['description'],
        external_reference: data['reference'],
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token,
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Origin': '*',
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


async function getPaymentLink(){
  try {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Token " + token);
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    const response = await fetch(`https://www.campay.net/api/transaction/${transactionId}/`, requestOptions);
    const result = await response.text();

    const status = JSON.parse(result)["status"];
    console.log(status)
    
    return {
      success: true,
      status: status
    };

  } catch (error) {
    console.error('Error:', error);
  }
}



