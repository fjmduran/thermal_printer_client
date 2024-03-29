import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ThermalPrinter } from '../models/ThermalPrinter';
import { ThermalTicketItemInterface } from '../models/MessageThermalPrinter.interface';

@Component({
  selector: 'app-thermal-printer',
  templateUrl: './thermal-printer.component.html',
  styleUrls: ['./thermal-printer.component.css'],
})
export class ThermalPrinterComponent {
  public selectedPrinter = '';

  public printers: string[] = [];

  public testPageStatus = RequestPrintStatus.Initial;
  public requestPrintStatus = RequestPrintStatus.Initial;
  public requestPrintStatusEnum = RequestPrintStatus;

  public textArea =
    'Esto es una línea larga para probar cómo la impresora no corta palabras';
  public maxCharacterNumber = 30;

  public ticketForm: FormGroup = new FormGroup({
    businessName: new FormControl(null, [
      Validators.required,
      Validators.maxLength(21),
    ]),
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

  async loadPrinters() {
    const printer = new ThermalPrinter();
    this.printers = await printer.GetPrinters();
  }

  async PrintTestMessage() {
    const printer = new ThermalPrinter(
      undefined,
      undefined,
      this.maxCharacterNumber,
      true
    );
    this.testPageStatus = RequestPrintStatus.Requested;
    const testStatus = await printer.PrintTestPage();
    if (testStatus) {
      this.testPageStatus = RequestPrintStatus.Successful;
    } else {
      this.testPageStatus = RequestPrintStatus.Fail;
    }
  }

  ToAsignDefaultPrinter() {
    const printer = new ThermalPrinter();
    printer.PrinterToLocalStorage(this.selectedPrinter);
  }

  async ToPrintText() {
    const printer = new ThermalPrinter(
      undefined,
      undefined,
      this.maxCharacterNumber,
      true
    );
    printer.AddMessage({
      message: this.textArea,
    });
    const printStatus = await printer.ToPrintText();

    if (printStatus) {
      console.log('OK');
      //this.testPageStatus = RequestPrintStatus.Successful;
    } else {
      console.log('Fallo');
      //this.testPageStatus = RequestPrintStatus.Fail;
    }
  }

  async ToPrintTicket() {
    const items: ThermalTicketItemInterface[] = [];
    this.itemsFormTicket.controls.forEach((item) => {
      items.push(item.value as ThermalTicketItemInterface);
    });
    const businessName = this.ticketForm.get('businessName')?.value;
    console.log(businessName);

    const printer = new ThermalPrinter(
      undefined,
      undefined,
      this.maxCharacterNumber,
      true
    );
    const printStatus = await printer.ToPrintTicket(items, {
      name: businessName,
    });
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
