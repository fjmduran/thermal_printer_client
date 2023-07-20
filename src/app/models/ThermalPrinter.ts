import { MessageThermalPrinterInterface } from './MessageThermalPrinter.interface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThermalPrinter {
  private readonly MAX_CHARACTERS_BY_LINE = 32;
  private readonly DEFAULT_PRINTER_NAME = 'POS-58-Series';
  private readonly URL_PLUGIN="http://localhost:8080";

  private messages: MessageThermalPrinterInterface[] = [];

  public AddMessage(message: MessageThermalPrinterInterface) {
    const printerName = this.PrinterName;
    message.message=this.WordWrap(message.message);
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
    return await this.ToPrint();
  }

  public async ToPrint(): Promise<boolean> {    
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
}
