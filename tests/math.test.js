const {calculateTip, celsiusToFahrenheit, fahrenheitToCelsius} = require('../src/math');

// test('Hello World!', () => {})

// test('This should fail', () => {
//     throw new Error('Failed');
// })

test('Should calculate total with tip', () => {
    const total = calculateTip(10,0.3);
    // if (total !== 13) {
    //     throw new Error('Total tip should be 13. Got '+total);
    // }
    expect(total).toBe(13);
})

test('Should calculate total with default tip', () => {
    const total = calculateTip(10);
    expect(total).toBe(12.5);
})

test('Should convert celcius to fahrenheit', () => {
    const toFahr = celsiusToFahrenheit(0);
    expect(toFahr).toBe(32);
})

test('Should convert fahrenheit to celcius', () => {
    const toCelc = fahrenheitToCelsius(32);
    expect(toCelc).toBe(0);
})

test('Async test demo', (done) => {
    setTimeout(()=>{
        expect(2).toBe(2);
        done();
    },2000);
})