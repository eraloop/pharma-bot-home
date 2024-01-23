async function getAccessToken(username, password) {
  try {

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      username: username,
      password: password,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch("https://www.campay.net/api/token/", requestOptions);
    const result = await response.text();
    const token  = JSON.parse(result)["token"];
    console.log("token from accesstoken function " + token)

    if(token === undefined || token === ''){
      return {
        success: false,
      };
    }else{
      return {
        success: true,
        token: token
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
  console.log("data entering payment function" , data)
  console.log("token entering payment function" , token)
  try {

    let myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Token  " + token);
    myHeaders.append("Access-Control-Allow-Headers", "*");

    console.log("headers for my payment function " + JSON.parse(myHeaders))

    const raw = JSON.stringify({
      amount: data['amount'],
      from: '237'+data['phone'],
      description: data['description'],
      external_reference: data['reference'],
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch("https://www.campay.net/api/collect/", requestOptions);
    const result = await response.text();
    console.log("result from payment function " + result)

    const refrence = result["reference"];
    const status = result["status"];
    console.log("status from my mobile payment " + status)
    console.log("reference code from my mobile payment " + refrence)

    if(status === 'FAILED'){
      return {
        success: false,
      };
    }else{
      return {
        success: true,
        reference: refrence
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

  console.log("token " + token)
  console.log("transactionId " + transactionId)

  try {

    let myHeaders = new Headers();
    myHeaders.append("Authorization", "Token " + token);
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Allow-Headers", "*");

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



