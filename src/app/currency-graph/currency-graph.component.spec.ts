import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyGraphComponent } from './currency-graph.component';

describe('CurrencyGraphComponent', () => {
  let component: CurrencyGraphComponent;
  let fixture: ComponentFixture<CurrencyGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrencyGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
