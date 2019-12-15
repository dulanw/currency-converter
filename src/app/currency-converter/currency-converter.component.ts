import { Component, OnInit, ViewChild } from '@angular/core';
import { Currency, CURRENCYLIST } from '../currency'
import { CurrencySelectorComponent } from '../currency-selector/currency-selector.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

//the response type from the api call
interface CurrencyRates {
  base: string;
  date: string;
  rates: any;
}

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.css']
})
export class CurrencyConverterComponent implements OnInit {

  @ViewChild('CurrencySelectorFrom', {static: false}) 
  CurrencySelectorFrom: CurrencySelectorComponent;

  @ViewChild('CurrencySelectorTo', {static: false}) 
  CurrencySelectorTo: CurrencySelectorComponent;

  CurrencyList = CURRENCYLIST;

  //not using bind for the amount, OnChangeAmount instead.
  Amount: number = 1;
  ConvertionSummary: string = "";

  constructor(private http:HttpClient) { }

  ngOnInit() {
    
  }

  OnChangeAmount(event)
  {
    this.Amount = this.ValidateAmount(event.target.value);
    event.target.value = this.Amount;
  }

  //Validate the amount, if its a negative number or letter then return 1
  ValidateAmount(Amount: string): number
  {
    let NewAmount = parseFloat(Amount);

    //check if the value is negative or 0 then or NaN, if so then set to 1
    if (isNaN(NewAmount) || NewAmount <= 0)
    {
      return 1;
    }
    else
    {
      return NewAmount;
    }
  }

  //swap the selected currency
  OnSwap()
  {
    let FromCurrency = this.CurrencySelectorFrom.GetSelectedCurrency();
    let ToCurrency = this.CurrencySelectorTo.GetSelectedCurrency();

    this.CurrencySelectorFrom.SetSelectedCurrency(ToCurrency);
    this.CurrencySelectorTo.SetSelectedCurrency(FromCurrency);
  }

  //when the convert button is pressed
  OnSubmit()
  {
    this.ConvertionSummary = "";
    let FromCurrency = this.CurrencySelectorFrom.GetSelectedCurrency();
    let ToCurrency = this.CurrencySelectorTo.GetSelectedCurrency();
    let LastAmount = this.Amount;

    this.ConvertCurrency(FromCurrency.code, ToCurrency.code).subscribe((Data: CurrencyRates) =>
    {
      console.log("Recieved exchange rates", Data);
      this.UpdateConvertionSummary(LastAmount, FromCurrency, ToCurrency, Data);
    },
    (error) => 
    {
      //#TODO add error message
      //unhandled error for now
    });
  }

  UpdateConvertionSummary(LastAmount: number, FromCurrency: Currency, ToCurrency: Currency, Data: CurrencyRates)
  {
    if (Data !== undefined && Data.base === FromCurrency.code && Data.rates.hasOwnProperty(ToCurrency.code))
    {
      let ConvertedAmount = LastAmount * Data.rates[ToCurrency.code];
      this.ConvertionSummary = `${LastAmount.toFixed(2)} ${FromCurrency.code} =\n${ConvertedAmount.toFixed(2)} ${ToCurrency.code}`;
    }
  }

  //pass in the currency code, i.e. CAD,GBP, USD etc which then calls the callback
  ConvertCurrency(BaseCurrencyCode: string, OtherCurrencyCode: string) : Observable<any>
  {
    return this.http.get(`https://api.exchangeratesapi.io/latest?base=${BaseCurrencyCode}&symbols=${OtherCurrencyCode}`);
  }

  //not used for now, called by both selectors if the currency type is changed
  ChangedCurrency(Value: Currency)
  {

  }

}
