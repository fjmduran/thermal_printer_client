export interface MessageThermalPrinterModel{
    message:string
    alignFont?:AlignFont
    heightFont?:HeightFont
    widthFont?:WidthFont
    isQR?:Boolean
}

enum AlignFont
{
    Left=0,
}

enum HeightFont
{
    Normal = 0,
}

enum WidthFont
{
    Normal = 0,
}