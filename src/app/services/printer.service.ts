import { Injectable, inject } from '@angular/core';
import { MessageThermalPrinterModel } from '../models/MessageThermalPrinter.interface';
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
