  test() {
    const test:MessageThermalPrinterModel[]=[];
    const restaurantName:MessageThermalPrinterModel={message:'Como en Casa'};
    test.push(restaurantName);
    const date:MessageThermalPrinterModel={message:'21.01.2001'}
    test.push(date);
    const time:MessageThermalPrinterModel={message:'22:03'}
    test.push(time);
    
    this.http
      .post('http://localhost:8080', test)
      .subscribe((data) => console.log(data));
  }
