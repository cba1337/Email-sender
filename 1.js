function sendEmail() {
    var serviceAccountEmail = 'script-svc@project1-416312.iam.gserviceaccount.com';
    var privateKey = `-----BEGIN PRIVATE KEY----------END PRIVATE KEY-----`;
    var privateKeyId = "cXXXXXXXXXXXXX";
    var userEmail = 'jessica.hirani@justeattakeaway.com';
  
    var jwt = ScriptApp.getOAuthToken();
    var headers = {
      'alg': 'RS256',
      'typ': 'JWT'
    };
    var now = Math.floor(Date.now() / 1000);
    var claims = {
      'iss': serviceAccountEmail,
      'scope': 'https://www.googleapis.com/auth/gmail.send',
      'aud': 'https://oauth2.googleapis.com/token',
      'exp': now + 3600,
      'iat': now
    };
    var jwtHeader = Utilities.base64EncodeWebSafe(JSON.stringify(headers));
    var jwtClaimSet = Utilities.base64EncodeWebSafe(JSON.stringify(claims));
    var signatureInput = jwtHeader + '.' + jwtClaimSet;
    var signature = Utilities.computeRsaSha256Signature(signatureInput, privateKey);
    var jwtSignature = Utilities.base64EncodeWebSafe(signature);
    var assertion = signatureInput + '.' + jwtSignature;
  
    var params = {
      method: 'post',
      contentType: 'application/x-www-form-urlencoded',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      payload: {
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion': assertion
      }
    };
  
    var response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', params);
    var accessToken = JSON.parse(response).access_token;
  
    var headers = {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    };
   // Constructing the MIME message
    var subject = 'Test email';
    var body = 'This is a test email from Google Apps Script using a service account.';
  
    // Create the MIME message
    var mimeMessage = {
      raw: Utilities.base64EncodeWebSafe(
        ("From: " + serviceAccountEmail + "\r\n" +
        "To: " + userEmail + "\r\n" +
        "Subject: " + subject + "\r\n\r\n" +
        body).replace(/\r\n/g, "\n") // Replace \r\n with \n for consistency
      )
    };
  
    var params = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(mimeMessage)
    };
  
    Gmail.Users.Messages.send({
      raw: mimeMessage.raw,
      to: userEmail,
      subject: subject
    }, 'me');
  }
  
  //   var response = UrlFetchApp.fetch('https://gmail.googleapis.com', {muteHttpExceptions: true});
  // Logger.log(response.getContentText());
  
  