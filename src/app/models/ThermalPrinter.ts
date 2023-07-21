import {
  JustificationEnum,
  MessageThermalPrinterInterface,
  TicketInterface,
  TicketItemInterface,
} from './MessageThermalPrinter.interface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThermalPrinter {
  private readonly MAX_CHARACTERS_BY_LINE = 30;
  private readonly DEFAULT_PRINTER_NAME = 'POS-58-Series';
  private readonly URL_PLUGIN = 'http://localhost:8080';

  private messages: MessageThermalPrinterInterface[] = [];

  public AddMessage(message: MessageThermalPrinterInterface) {
    const printerName = this.PrinterName;
    message.message = this.WordWrap(message.message);
    message.printerName = printerName;
    this.messages.push(message);
  }

  private get PrinterName(): string {
    const printerName = localStorage.getItem('printerName');
    if (printerName) return printerName;
    console.error('No se encuentra la impresora, se asigna una por defecto');
    return this.DEFAULT_PRINTER_NAME;
  }

  public AddBlankLine() {
    this.messages.push({
      message: `\n`,
    });
  }

  public async PrintTestPage(): Promise<boolean> {
    this.AddMessage({ message: 'Página de prueba' });
    this.AddMessage({
      message:
        'Si ve esta impresión es que su impresora funciona correctamente.',
    });
    const currentTime = new Date();
    this.AddMessage({ message: `${currentTime.toLocaleString()}` });
    return await this.ToPrintText();
  }

  public async ToPrintText(): Promise<boolean> {
    return await this.RequestToPrinter();
  }

  public async ToPrintTicket(ticketItems: TicketItemInterface[]) {
    const ticket = this.ToCreateTicket(ticketItems);

    this.AddMessage({ message: 'NOMBRE RESTAURANTE' });
    this.AddBlankLine();
    this.AddMessage({ message: `FECHA: ${ticket.date}` });
    this.AddMessage({ message: `HORA: ${ticket.time}` });
    this.AddBlankLine();

    this.AddMessage({ message: `UDS CONCEPTO            EU/UD` });
    ticketItems.forEach((item) => {
      this.AddMessage(this.GetItemTickeForPrinter(item));
    });

    this.AddBlankLine();
    this.AddMessage({ message: `TOTAL A PAGAR: ${ticket.total.toFixed(2)}` });
    this.AddMessage({ message: `BASE: ${ticket.base.toFixed(2)}` });
    this.AddMessage({ message: `IVA: ${ticket.iva.toFixed(2)}` });
    this.AddBlankLine();
    this.AddMessage({
      message: `GRACIAS POR SU VISITA`,
      justification: JustificationEnum.Center,
    });
    return await this.RequestToPrinter();
  }

  private GetItemTickeForPrinter(
    item: TicketItemInterface
  ): MessageThermalPrinterInterface {
    const udsWithDesiredLength = this.addSpaces(item.uds.toString(), 3);
    const descriptionWithDesiredLength = this.addSpaces(
      item.description.toString(),
      19,
      false
    );
    const eur_udWithDesiredLenght = this.addSpaces(item.eur_ud.toFixed(2), 5);

    return {
      message: `${udsWithDesiredLength} ${descriptionWithDesiredLength} ${eur_udWithDesiredLenght}`,
    };
  }

  private addSpaces(
    input: string,
    desiredLength: number,
    spacesToStart = true
  ): string {
    //la siguiente función devolverá un string con longitud deseada
    //si el string fuera más pequeño, añadirá espacios al inicio o al final según el parámetro spacesToStart
    if (input.length >= desiredLength) {
      return input.substring(0, desiredLength);
    }

    const spacesToAdd = desiredLength - input.length;
    const spaces = ' '.repeat(spacesToAdd);
    if (spacesToStart) return spaces + input;
    return input + spaces;
  }

  private async RequestToPrinter() {
    const data = this.messages;
    try {
      const response = await fetch(this.URL_PLUGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }

      const result = await response.json();
      console.log('Respuesta del servidor:', result);
      return true;
    } catch (error: any) {
      console.error('Error:', error.message);
      return false;
    }
  }

  private ToCreateTicket(ticketItems: TicketItemInterface[]): TicketInterface {
    const currentDate = new Date();
    let total = 0;
    ticketItems.forEach((item) => {
      total += item.uds * item.eur_ud;
      total = Number(total.toFixed(2));
    });
    let base = total * 0.79;
    base = Number(base.toFixed(2));
    const iva = Number(Number(total - base).toFixed(2));
    return {
      date: currentDate.toLocaleDateString(),
      time: currentDate.toLocaleTimeString(),
      items: ticketItems,
      total: Number(total.toFixed(2)),
      base: Number(base.toFixed(2)),
      iva,
    };
  }

  private WordWrap(message: string): string {
    // Función para dividir el texto en líneas que no corten palabras

    const words = message.split(' ');
    let currentLine = '';
    let lines = '';

    words.forEach((word) => {
      if (currentLine.length + word.length + 1 > this.MAX_CHARACTERS_BY_LINE) {
        lines += `${currentLine}\n`;
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    lines += `${currentLine}\n`;
    return lines;
  }

  public PrinterToLocalStorage(printerName:string){
    localStorage.setItem('printerName',printerName);
  }

  public async GetPrinters(): Promise<string[]> {    
    try {
      const response = await fetch(this.URL_PLUGIN, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }        
      });

      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }

      const result:string[] = await response.json();      
      return result;
    } catch (error: any) {
      console.error('Error:', error.message);
      return [];
    }
  }
}
