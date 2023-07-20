import { Injectable, inject } from '@angular/core';
import { MessageThermalPrinterInterface } from '../models/MessageThermalPrinter.interface';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ThermalPrinter } from '../models/ThermalPrinter';

@Injectable({
  providedIn: 'root',
})
export class PrinterService {
  private http = inject(HttpClient);

  constructor() {}

  async ToPrintTest() {
    const printer=new ThermalPrinter();
    return await printer.PrintTestPage();
  }

  async ToPrint(message:MessageThermalPrinterInterface) {
    const printer=new ThermalPrinter();
    printer.AddMessage(message);
    return await printer.ToPrint();

  }

  GetPrinters(): Observable<string[]> {
    return this.http.get('http://localhost:8080').pipe(
      map((data) => {
        return data.toString().split(',');
      })
    );
  }

  SavePrinter(printerName:string){
    localStorage.setItem('printerName',printerName);
  }
}
