import { Component, OnInit, inject } from '@angular/core';
import { MessageThermalPrinterModel } from './models/MessageThermalPrinter.interface';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PrinterService } from './services/printer.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private printerService = inject(PrinterService);

  public selectedPrinter = '';

  public printers$!: Observable<string[]>;
  public testPageStatus = TestPageStatus.Initial;

  ngOnInit(): void {}

  loadPrinters() {
    this.printers$ = this.printerService.GetPrinters();
  }

  async PrintTestMessage() {
    this.printerService.SavePrinter(this.selectedPrinter);
    this.testPageStatus = TestPageStatus.Requested;
    const testStatus = await this.printerService.ToPrintTest();
    if (testStatus) {
      this.testPageStatus = TestPageStatus.Successful;
    } else {
      this.testPageStatus = TestPageStatus.Fail;
    }
  }
}

export enum TestPageStatus {
  Initial = 0,
  Requested = 1,
  Successful = 2,
  Fail = 3,
}
