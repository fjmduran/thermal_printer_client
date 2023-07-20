export interface MessageThermalPrinterInterface{
    message:string
    justification?:Justification
    heightFont?:HeightFont
    widthFont?:WidthFont
    isQR?:Boolean
    printerName?:string
}

export interface TicketInterface{
    items:TicketItemInterface[]
    total:number
    base:number
    iva:number
}

export interface TicketItemInterface{
    uds:number
    description:string
    eur_ud:number
}

enum Justification
{
    Left=0,
    Center=1
}

enum HeightFont
{
    Normal = 0,
}

enum WidthFont
{
    Normal = 0,
}