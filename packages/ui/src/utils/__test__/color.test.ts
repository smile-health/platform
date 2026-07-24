import {
  getReadableTextColor,
  generateTailwindPalette
} from '../color'

let result;

beforeEach(() => {
  // given
  result = null
})

afterAll(() => {
  result = null
})

describe('getReadableTextColor', () => {
  it('should return "light" for dark background colors', () => {
    expect.assertions(3);
    // when
    result = getReadableTextColor('#000000');
    // then
    expect(result).toBe('light');
    // when
    result = getReadableTextColor('#123456');
    // then
    expect(result).toBe('light');
    // when
    result = getReadableTextColor('#333');
    // then
    expect(result).toBe('light');
  });

  it('should return "dark" for light background colors', () => {
    expect.assertions(3);
    // when
    result = getReadableTextColor('#ffffff');
    // then
    expect(result).toBe('dark');
    // when
    result = getReadableTextColor('#abcdef');
    // then
    expect(result).toBe('dark');
    // when
    result = getReadableTextColor('#eee');
    // then
    expect(result).toBe('dark');
  });

  it('should handle shorthand hex colors', () => {
    expect.assertions(2);
    // when
    result = getReadableTextColor('#000');
    // then
    expect(result).toBe('light');
    // when
    result = getReadableTextColor('#fff');
    // then
    expect(result).toBe('dark');
  });

  it('should handle hex colors without leading #', () => {
    expect.assertions(2);
    // when
    result = getReadableTextColor('000000');
    // then
    expect(result).toBe('light');
    // when
    result = getReadableTextColor('ffffff');
    // then
    expect(result).toBe('dark');
  });

  it('should handle invalid hex colors gracefully', () => {
    // when
    result = getReadableTextColor('invalid');
    // then
    expect(result).toBe('light'); // Defaults to light for invalid input
  });
});

describe('generateTailwindPalette', () => {
  it('should generate a palette with correct keys and RGB values', () => {
    expect.assertions(2);
    // when
    result = generateTailwindPalette('#3490dc'); // A shade of blue
    // then
    expect(Object.keys(result).map(k => parseInt(k))).toEqual([0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000]);
    expect(result[500]).toBe('52 144 220'); // Approx RGB for #3490dc
  });

  it('should generate a palette for a different base color', () => {
    expect.assertions(2);
    // when
    result = generateTailwindPalette('#e3342f'); // A shade of red
    // then
    expect(Object.keys(result).map(k => parseInt(k))).toEqual([0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000]);
    expect(result[500]).toBe('227 52 47'); // Approx RGB for #e3342f
  });

  it('should handle invalid color input gracefully', () => {
    expect.assertions(2);
    // when
    result = generateTailwindPalette('invalid-color');
    // then
    expect(Object.keys(result).map(k => parseInt(k))).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
    expect(result[500]).toBe('0 73 144'); // Fallback to magenta for invalid input
  });
})