import axios from 'axios';

/**
 * Check if phone number is valid
 * @param myPhone phone number
 * @returns result(`true`, `false`)
 */
export function checkValidationPhone(myPhone: string) {
  if (myPhone.length !== 10 && myPhone.length !== 11) {
    return false;
  } else {
    return true;
  }
}

/**
 * Get phone Token
 * @returns Token result
 */
export function getToken() {
  const myCount = 6;

  const result = String(Math.floor(Math.random() * 10 ** myCount)).padStart(
    myCount,
    '0',
  );
  return result;
}

/**
 * Send Token SMS
 * @param myPhone phone number
 * @param myToken Token
 */
export async function sendTokenToSMS(myPhone: string, myToken: string) {
  const appKey = process.env.SMS_APP_KEY;
  const XSecretKey = process.env.SMS_X_SECRET_KEY;
  const sender = process.env.SMS_SENDER;

  await axios.post(
    `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/${appKey}/sender/sms`,
    {
      body: `[Voluntier]안녕하세요. 인증번호는 ${myToken}입니다.`,
      sendNo: sender,
      recipientList: [{ internationalRecipientNo: myPhone }],
    },
    {
      headers: {
        'X-Secret-Key': XSecretKey,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  );
}
