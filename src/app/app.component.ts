import { Component, OnInit, inject } from '@angular/core';
import { MessageThermalPrinterInterface, TicketItemInterface } from './models/MessageThermalPrinter.interface';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
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

  public testPageStatus = RequestPrintStatus.Initial;
  public requestPrintStatus = RequestPrintStatus.Initial;
  public requestPrintStatusEnum = RequestPrintStatus;

  public textArea =
    'Esto es una línea larga para probar cómo la impresora no corta palabras y suprimir los acentos';

  public ticketForm: FormGroup = new FormGroup({
    ticketItems: new FormArray([]),
  });

  ngOnInit(): void {
    this.addTicketItem();
  }

  get itemsFormTicket() {
    return this.ticketForm.get('ticketItems') as FormArray;
  }

  addTicketItem() {
    const item = new FormGroup({
      uds: new FormControl(null, [Validators.required, Validators.min(0)]),
      description: new FormControl(null, [
        Validators.required,
        Validators.maxLength(21),
      ]),
      eur_ud: new FormControl(null, [Validators.required, Validators.min(0)]),
    });

    this.itemsFormTicket.push(item);
  }

  deleteTicketItem(index: number) {
    this.itemsFormTicket.removeAt(index);
  }

  loadPrinters() {
    this.printers$ = this.printerService.GetPrinters();
  }

  async PrintTestMessage() {
    this.printerService.SavePrinter(this.selectedPrinter);
    this.testPageStatus = RequestPrintStatus.Requested;
    const testStatus = await this.printerService.ToPrintTest();
    if (testStatus) {
      this.testPageStatus = RequestPrintStatus.Successful;
    } else {
      this.testPageStatus = RequestPrintStatus.Fail;
    }
  }

  async ToPrintText() {
    const printStatus = await this.printerService.ToPrintText({
      message: this.textArea,
    });    
    
    if (printStatus) {
      console.log('OK');
      //this.testPageStatus = RequestPrintStatus.Successful;
    } else {
      console.log('Fallo');
      //this.testPageStatus = RequestPrintStatus.Fail;
    }
  }

  async ToPrintTicket() {
    const items:TicketItemInterface[] = [];
    this.itemsFormTicket.controls.forEach((item)=>{
      items.push(item.value as TicketItemInterface)
    });       
     const printStatus = await this.printerService.ToPrintTicket(items);
    if (printStatus) {
      console.log('OK');
      //this.testPageStatus = RequestPrintStatus.Successful;
    } else {
      console.log('Fallo');
      //this.testPageStatus = RequestPrintStatus.Fail;
    }
  }
}

export enum RequestPrintStatus {
  Initial = 0,
  Requested = 1,
  Successful = 2,
  Fail = 3,
}
