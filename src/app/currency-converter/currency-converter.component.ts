import { Component, OnInit, ViewChild } from '@angular/core';
import { Currency, CURRENCYLIST, RateNode } from '../CurrencyTypes'
import { CurrencySelectorComponent } from '../currency-selector/currency-selector.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrencyGraphComponent } from '../currency-graph/currency-graph.component';
import * as moment from 'moment'; // <-- for date time stuff

//the response type from the api call
interface CurrencyRates 
{
  base: string,
  date: string,
  rates: any
}

//the response type from the api call for rate history
interface CurrencyRatesHistory
{
  base: string,
  start_at: string,
  end_at: string,
  rates: {}
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

  @ViewChild('RateGraph', {static: false})
  RateGraph: CurrencyGraphComponent;

  //list of currencies that can be picked from the selector
  CurrencyList = CURRENCYLIST;

  //not using bind for the amount, OnChangeAmount instead.
  Amount: number = 1;
  ConvertionSummary: string = "";

  RateHistory: RateNode[] = [];

  constructor(private http:HttpClient) { }

  ngOnInit() {  }

  ngAfterViewInit()
  {
    this.UpdateGraph();
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
    this.UpdateGraph();
  }

  //when the convert button is pressed
  OnSubmit()
  {
    this.ConvertionSummary = "";

    let FromCurrency: Currency = this.CurrencySelectorFrom.GetSelectedCurrency();
    let ToCurrency: Currency = this.CurrencySelectorTo.GetSelectedCurrency();
    let LastAmount: number = this.Amount;

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

  /**
   * Upodate the text at the bottom which shows the conversion result
   * @param LastAmount the amount that was entered when the user pressed the button, incase the user presses it multiple times
   * @param FromCurrency the currency type data from the dropdown
   * @param ToCurrency the currency type data from the dropdown
   * @param Data the data that was gotten from ConvertCurrency HTTP request
   */
  UpdateConvertionSummary(LastAmount: number, FromCurrency: Currency, ToCurrency: Currency, Data: CurrencyRates)
  {
    if (Data !== undefined && Data.base === FromCurrency.code && Data.rates.hasOwnProperty(ToCurrency.code))
    {
      let ConvertedAmount: number = LastAmount * Data.rates[ToCurrency.code];
      this.ConvertionSummary = `${LastAmount.toFixed(2)} ${FromCurrency.code} =\n${ConvertedAmount.toFixed(2)} ${ToCurrency.code}`;
    }
  }

  /**
   * pass in the currency code, i.e. CAD,GBP, USD etc which retruns an observable that you need to subscribe to
   * @param BaseCurrencyCode - the currency code which you are converting from CAD,GBP, USD
   * @param OtherCurrencyCode - the currency code which you are converting to  CAD,GBP, USD
   */
  ConvertCurrency(BaseCurrencyCode: string, OtherCurrencyCode: string) : Observable<any>
  {
    return this.http.get(`https://api.exchangeratesapi.io/latest?base=${BaseCurrencyCode}&symbols=${OtherCurrencyCode}`);
  }

  /**
   * bind to the currency-selector component, which emits the event.
   * @param Value the value of the changed selector, not the event itself
   */
  ChangedCurrency(Value: Currency)
  {
    this.UpdateGraph();
  }

  UpdateGraph()
  {
    let FromCurrency: Currency = this.CurrencySelectorFrom.GetSelectedCurrency();
    let ToCurrency: Currency = this.CurrencySelectorTo.GetSelectedCurrency();

    console.log(FromCurrency, ToCurrency);

    let EndDate: string = moment().format("YYYY-MM-DD");
    let StartDate: string = moment().subtract(11, 'M').startOf("month").format("YYYY-MM-DD");

    this.GetRatesOverTime(FromCurrency.code, ToCurrency.code, StartDate, EndDate).subscribe((Data: CurrencyRatesHistory) =>
    {
      this.RateHistory = [];

      //the object lists the rates by their day
      for (let Day in Data.rates)
      {
        //check if the rate has the ToCurrency code, it might have returned empty
        if (!Data.rates[Day].hasOwnProperty(ToCurrency.code))
        {
          continue;
        }

        //conver it to a string so its easier to compare or check if property exists
        let DayString = moment(Day.toString()).format("MM-YYYY");
        let Index = this.RateHistory.findIndex((Node) => 
        {
          return Node.Date === DayString;
        })

        if (Index > -1)  
        {
          this.RateHistory[Index].Sum = this.RateHistory[Index].Sum + Data.rates[Day][ToCurrency.code];
          this.RateHistory[Index].Num = this.RateHistory[Index].Num + 1;
        }  
        else
        {
          this.RateHistory.push({Date: DayString, Sum: Data.rates[Day][ToCurrency.code], Num: 1});
        }
      }

      this.RateGraph.RefreshGraph(this.RateHistory);
    });
  }

  //pass in the currency code, i.e. CAD,GBP, USD etc which retruns an observable that you need to subscribe to
  GetRatesOverTime(BaseCurrencyCode: string, OtherCurrencyCode: string, StartDate: string, EndDate: string) : Observable<any>
  {
    return this.http.get(`https://api.exchangeratesapi.io/history?start_at=${StartDate}&end_at=${EndDate}&base=${BaseCurrencyCode}&symbols=${OtherCurrencyCode}`);
  }

}
