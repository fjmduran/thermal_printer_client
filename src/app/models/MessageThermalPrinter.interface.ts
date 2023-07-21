export interface MessageThermalPrinterInterface{
    message:string
    justification?:JustificationEnum
    heightFont?:HeightFontEnum
    widthFont?:WidthFontEnum
    isQR?:Boolean
    printerName?:string
}

export interface ThermalTicketInterface{
    date:string
    time:string
    items:ThermalTicketItemInterface[]
    total:number
    base:number
    iva:number
}

export interface ThermalTicketItemInterface{
    uds:number
    description:string
    eur_ud:number
}

export interface BusinessDataForThermalTicket{
    name:string
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