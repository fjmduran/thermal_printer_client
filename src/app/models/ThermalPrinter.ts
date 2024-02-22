import {
  BusinessDataForThermalTicket,
  JustificationEnum,
  MessageThermalPrinterInterface,
  RestaurantOrderToPrinter,
  ThermalTicketInterface,
  ThermalTicketItemInterface,
} from './MessageThermalPrinter.interface';

export class ThermalPrinter {
  private MAX_CHARACTERS_BY_LINE: number;
  private PRINTER_NAME: string;
  private URL_PLUGIN: string;
  private REMOVE_ACCENTS: boolean;
  private NUMBER_LINES_ADD_TO_END: number;

  constructor(
    pluginUrl?: string,
    printerName?: string,
    maxCharactersByLine?: number,
    removeAccents?: boolean,
    numberLineAddToEnd?: number
  ) {
    this.URL_PLUGIN = pluginUrl || 'http://localhost:7878';
    this.PRINTER_NAME = printerName || 'POS-58-Series';
    this.MAX_CHARACTERS_BY_LINE = maxCharactersByLine || 0; //30 para la POS-58-Series, 40 para la BIXOLOM
    this.REMOVE_ACCENTS = removeAccents || false;
    this.NUMBER_LINES_ADD_TO_END = numberLineAddToEnd || 0;
  }

  private messages: MessageThermalPrinterInterface[] = [];

  public AddMessage(message: MessageThermalPrinterInterface) {
    const printerName = this.PrinterName;
    if (this.REMOVE_ACCENTS)
      message.message = this.RemoveAccents(message.message);
    if (this.MAX_CHARACTERS_BY_LINE > 0)
      message.message = this.WordWrap(message.message);
    message.printerName = printerName;
    this.messages.push(message);
  }

  private get PrinterName(): string {
    return this.PRINTER_NAME;
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

  public async ToPrintRestaurantOrder(
    restaurantOrder: RestaurantOrderToPrinter
  ): Promise<any> {
    this.AddMessage({ message: `CLIENTE: ${restaurantOrder.client}` });
    this.AddBlankLine();

    restaurantOrder.products.forEach((item) => {
      this.AddMessage({ message: `${new Date(item.id).toLocaleTimeString()}` });
      this.AddMessage({ message: `${item.uds} ${item.description}` });
      if (item.observations)
        this.AddMessage({ message: `${item.observations}` });
      this.AddBlankLine();
    });

    return await this.RequestToPrinter();
  }

  public async ToPrintTicket(
    ticketItems: ThermalTicketItemInterface[],
    business: BusinessDataForThermalTicket
  ) {
    const ticket = this.ToCreateTicket(ticketItems);

    this.AddMessage({ message: `${business.name}` });
    this.AddBlankLine();
    this.AddMessage({ message: `FECHA: ${ticket.date}` });
    this.AddMessage({ message: `HORA: ${ticket.time}` });
    this.AddBlankLine();

    const spacesBetweenConceptPrice = this.MAX_CHARACTERS_BY_LINE - 20;
    this.AddMessage({
      message: `UDS CONCEPTO ${' '.repeat(spacesBetweenConceptPrice)} EU/UD`,
    });
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

    const toOpenDrawer = "\u001Bp\0";
    this.AddMessage({ message: toOpenDrawer });

    return await this.RequestToPrinter();
  }

  private GetItemTickeForPrinter(
    item: ThermalTicketItemInterface
  ): MessageThermalPrinterInterface {
    const udsWithDesiredLength = this.addSpaces(item.uds.toString(), 3);
    const descriptionWithDesiredLength = this.addSpaces(
      item.description.toString(),
      this.MAX_CHARACTERS_BY_LINE - 11,
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

  private async RequestToPrinter(): Promise<any> {
    for (let i = 0; i <= this.NUMBER_LINES_ADD_TO_END; i++) {
      this.AddBlankLine();
    }

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
        const message = `Error en la solicitud ${await response.json()}`;
        console.error(message);
        return new Error(message);
      }

      const result = await response.json();
      console.log('Respuesta del servidor:', result);
      return;
    } catch (error: any) {
      console.error('Error:', error.message);
      return;
    }
  }

  private ToCreateTicket(
    ticketItems: ThermalTicketItemInterface[]
  ): ThermalTicketInterface {
    const currentDate = new Date();
    let total = 0;
    ticketItems.forEach((item) => {
      total += item.uds * item.eur_ud;
      total = Number(total.toFixed(2));
    });
    let base = total / 1.1;
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

  private RemoveAccents(message: string): string {
    return message
      .replace(/[áäâà]/g, 'a')
      .replace(/[éëêè]/g, 'e')
      .replace(/[íïîì]/g, 'i')
      .replace(/[óöôò]/g, 'o')
      .replace(/[úüûù]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ÁÄÂÀ]/g, 'A')
      .replace(/[ÉËÊÈ]/g, 'E')
      .replace(/[ÍÏÎÌ]/g, 'I')
      .replace(/[ÓÖÔÒ]/g, 'O')
      .replace(/[ÚÜÛÙ]/g, 'U')
      .replace(/[N]/g, 'N');
  }

  private WordWrap(message: string): string {
    // Función para dividir el texto en líneas que no corten palabras
    const words = message.split(' ');
    let currentLine = '';
    let lines = '';

    words.forEach((word) => {
      if (currentLine.length + word.length > this.MAX_CHARACTERS_BY_LINE) {
        lines += `${currentLine}\n`;
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    lines += `${currentLine}\n`;
    return lines;
  }

  public PrinterToLocalStorage(printerName: string) {
    localStorage.setItem('printerName', printerName);
  }

  public async GetPrinters(): Promise<string[]> {
    try {
      const response = await fetch(this.URL_PLUGIN, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }

      const result: string[] = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error:', error.message);
      return [];
    }
  }
}
