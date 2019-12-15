export class Currency {
    code: string;
    name: string;

    //logo: string; can't add a logo next to the name in the list without wasting a lot of time
  }

export var CURRENCYLIST:Currency[] = 
[
    { code: "AUD", name: "Australian dollar"},
    { code: "BGN", name: "Bulgarian lev"},
    { code: "BRL", name: "Brazilian real"},
    { code: "CAD", name: "Canadian dollar"},
    { code: "CHF", name: "Swiss franc"},
    { code: "CNY", name: "Chinese yuan renminbi"},
    { code: "CZK", name: "Czech koruna"},
    { code: "DKK", name: "Danish krone"},
    { code: "GBP", name: "Pound sterling"},
    { code: "HKD", name: "Hong Kong dollar"},
    { code: "HRK", name: "Croatian kuna"},
    { code: "HUF", name: "Hungarian forint"},
    { code: "IDR", name: "Indonesian rupiah"},
    { code: "ILS", name: "Israeli shekel"},
    { code: "INR", name: "Indian rupee"},
    { code: "ISK", name: "Icelandic krona"},
    { code: "JPY", name: "Japanese yen"},
    { code: "KRW", name: "South Korean won"},
    { code: "MXN", name: "Mexican peso"},
    { code: "MYR", name: "Malaysian ringgit"},
    { code: "NOK", name: "Norwegian krone"},
    { code: "NZD", name: "New Zealand dollar"},
    { code: "PHP", name: "Philippine peso"},
    { code: "PLN", name: "Polish zloty"},
    { code: "RON", name: "Romanian leu"},
    { code: "RUB", name: "Russian rouble"},
    { code: "SEK", name: "Swedish krona"},
    { code: "SGD", name: "Singapore dollar"},
    { code: "THB", name: "Thai baht"},
    { code: "TRY", name: "Turkish lira"},
    { code: "USD", name: "US dollar"},
    { code: "ZAR", name: "South African rand"}
];

export interface RateNode
{
  Date: string,
  Sum: number,
  Num: number
}
