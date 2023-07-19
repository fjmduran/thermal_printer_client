import { HttpClient } from '@angular/common/http';
import { MessageThermalPrinterModel } from './MessageThermalPrinter.interface';
import { Injectable, Injector, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThermalPrinter {
  private readonly MAX_CHARACTERS_BY_LINE = 32;
  private readonly DEFAULT_PRINTER_NAME="POS-58-Series"

  constructor() {}

  private messages: MessageThermalPrinterModel[] = [];

  public AddMessage(message: MessageThermalPrinterModel) {
    const printerName=this.PrinterName;    
    message.printerName=printerName;
    this.messages.push(message);
  }

  private get PrinterName():string{
    const printerName=localStorage.getItem("printerName");
    if(printerName) return printerName;
    console.error("No se encuentra la impresora, se asigna una por defecto");    
    return this.DEFAULT_PRINTER_NAME;
  }

  public AddBlankLine() {
    this.messages.push({
      message: `\n`,
    });
  }

  public async PrintTestPage():Promise<boolean> {
    this.AddMessage({message:'Página de prueba'})
    this.AddMessage({message:'Si ve esta impresión es que su impresora funciona correctamente.'})
   const currentTime=new Date();
    this.AddMessage({message:`${currentTime.toLocaleString()}`})
    this.AddBlankLine();
    this.AddMessage({message:'@fjmduran'});
    this.AddMessage({message:'Para más información contacte en info@fjmduran.com'});   
    return await this.ToPrint();    
  }

  private async ToPrint(): Promise<boolean> {
    const url = 'http://localhost:8080';
    const data = this.messages;

    try {
      const response = await fetch(url, {
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
}
