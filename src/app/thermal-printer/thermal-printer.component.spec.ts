import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThermalPrinterComponent } from './thermal-printer.component';

describe('ThermalPrinterComponent', () => {
  let component: ThermalPrinterComponent;
  let fixture: ComponentFixture<ThermalPrinterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThermalPrinterComponent]
    });
    fixture = TestBed.createComponent(ThermalPrinterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
