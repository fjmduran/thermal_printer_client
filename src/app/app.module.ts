import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThermalPrinterComponent } from './thermal-printer/thermal-printer.component';

@NgModule({
  declarations: [AppComponent, ThermalPrinterComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,    
    FormsModule, ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
