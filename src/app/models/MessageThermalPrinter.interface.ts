export interface MessageThermalPrinterInterface{
    message:string
    justification?:JustificationEnum
    heightFont?:HeightFontEnum
    widthFont?:WidthFontEnum
    isQR?:Boolean
    printerName?:string
}

export interface TicketInterface{
    date:string
    time:string
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

export enum JustificationEnum
{
    Left=0,
    Center=1
}

export enum HeightFontEnum
{
    Normal = 0,
}

export enum WidthFontEnum
{
    Normal = 0,
}