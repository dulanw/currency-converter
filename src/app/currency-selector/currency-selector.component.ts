import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Currency } from '../currency';

@Component({
  selector: 'app-currency-selector',
  templateUrl: './currency-selector.component.html',
  styleUrls: ['./currency-selector.component.css']
})
export class CurrencySelectorComponent implements OnInit {

  //the currency list that should show up in this selector, can be updated i.e when a user select a currency on another list which then needs to be updated on here
  //since you should not be converting from the same currency types, i.e £ to £ or $ to $
  @Input() SelectableCurrencies:Currency[];

  //parent should bind to this event, when a value is selected then change the other dropdown list to remove the currently selected value from it
  //since you should not be converting from the same currency types, i.e £ to £ or $ to $
  @Output() ChangedCurrency = new EventEmitter<Currency>();

  //the current selected index, since the value does not hold an object
  //SelectedIndex:number = 0; 

  //instead of the selected index, bind the object itself
  SelectedCurrency: Currency;

  constructor() {
    
  }

  ngOnInit() {
    //console.log(this.SelectableCurrencies);
    //get a random index just so its not always the first currency that is selected
    let RandIndex =  Math.floor((Math.random() * this.SelectableCurrencies.length) + 0);
    this.SelectedCurrency = this.SelectableCurrencies[RandIndex];
  }


  //not currently used
  OnChange(Value)
  {
    // this.SelectedIndex = Value;
    // this.ChangedCurrency.emit(this.SelectableCurrencies[this.SelectedIndex]);
    // console.log(this.SelectedCurrency);
    console.log(Value);
  }

  //get the currently selected currency, returns type Currency
  GetSelectedCurrency():Currency
  {
    return this.SelectedCurrency;
  }

  //set the new selected currency, from parent component
  SetSelectedCurrency(InCurrency:Currency)
  {
    this.SelectedCurrency = InCurrency;
  }
}
