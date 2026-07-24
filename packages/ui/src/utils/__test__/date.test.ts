import {
    parseDateTime,
    isValidDate,
    parseValidDate,
    handleDateChange
} from "../date";

let result;

// jest.mock('dayjs')

beforeEach(() => {
    // given
    result = null
})

afterAll(() => {
    result = null
})

jest.mock('../storage/user', () => ({
    getUserStorage: jest.fn().mockReturnValue({
        view_only: 1,
    })
}))

describe('parseDateTime', () => {
    it('return params date when not valid', () => {
        // when
        result = parseDateTime('');

        // then
        expect(result).toBe('-')
    })

    it('return formatted date with default format', () => {
        // when
        result = parseDateTime('2024-10-02T06:55:31.000Z');

        // then (gmt +7)
        expect(result).toBe('02/10/2024 13:55')
    })

    it('return formatted date with expected format', () => {
        // when
        result = parseDateTime('2024-10-02T06:55:31.000Z', 'DD MM YYYY');

        // then
        expect(result).toBe('02 10 2024')
    })
})

describe('isValidDate', () => {
    it('return false when not valid - input falsy value', () => {
        expect.assertions(4);

        // assetion 1
        result = isValidDate(null);
        expect(result).toBe(false)

        // assetion 2
        result = isValidDate(undefined);
        expect(result).toBe(true)

        // // assetion 3
        result = isValidDate(1);
        expect(result).toBe(true)

        // // assetion 4
        result = isValidDate('string');
        expect(result).toBe(false)
    })

    it('return true when valid', () => {
        // when
        result = isValidDate('2024-10-02T06:55:31.000Z');

        // then (gmt +7)
        expect(result).toBe(true)
    })
})

describe('parseValidDate', () => {
    it('return null when not valid', () => {
        // when
        result = parseValidDate();

        // then (gmt +7)
        expect(result).toEqual(null)
    })

    it('return value type CalenderDate when valid', () => {
        // when
        result = parseValidDate('2025-09-22');
        // then (gmt +7)
        expect(result).toEqual({ "calendar": { "identifier": "gregory" }, "day": 22, "era": "AD", "month": 9, "year": 2025 })
    })
})

describe('handleDateChange', () => {
    let mockOnChange: jest.Mock

    beforeEach(() => {
        mockOnChange = jest.fn()
        jest.clearAllMocks()
    })

    describe('Valid date inputs', () => {
        it('should format valid Date object to YYYY-MM-DD', () => {
            // given
            const validDate = new Date('2023-12-25')
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(validDate)

            // then
            expect(mockOnChange).toHaveBeenCalledWith('2023-12-25')
            expect(mockOnChange).toHaveBeenCalledTimes(1)
        })

        it('should format valid date string to YYYY-MM-DD', () => {
            // given
            const validDateString = '2023-06-15'
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(validDateString)

            // then
            expect(mockOnChange).toHaveBeenCalledWith('2023-06-15')
        })

        it('should format ISO date string to YYYY-MM-DD', () => {
            // given
            const isoDateString = '2023-03-10T14:30:00.000Z'
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(isoDateString)

            // then
            expect(mockOnChange).toHaveBeenCalledWith('2023-03-10')
        })

        it('should format date with time to YYYY-MM-DD (ignoring time)', () => {
            // given
            const dateWithTime = new Date('2023-08-20T23:59:59')
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(dateWithTime)

            // then
            expect(mockOnChange).toHaveBeenCalledWith('2023-08-20')
        })
    })

    describe('Invalid date inputs', () => {
        it('should return null when date is invalid string', () => {
            // given
            const invalidDateString = 'invalid-date'
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(invalidDateString)

            // then
            expect(mockOnChange).toHaveBeenCalledWith(null)
        })

        it('should return null when date is empty string', () => {
            // given
            const emptyString = ''
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(emptyString)

            // then
            expect(mockOnChange).toHaveBeenCalledWith(null)
        })

        it('should return null when date is null', () => {
            // given
            const nullDate = null
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(nullDate)

            // then
            expect(mockOnChange).toHaveBeenCalledWith(null)
        })

        it('should return null when date is undefined', () => {
            // given
            const undefinedDate = undefined
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(undefinedDate)

            // then
            expect(mockOnChange).toHaveBeenCalledWith(null)
        })

        it('should return null when date is NaN', () => {
            // given
            const nanValue = NaN
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(nanValue)

            // then
            expect(mockOnChange).toHaveBeenCalledWith(null)
        })

        it('should return null when date is invalid Date object', () => {
            // given
            const invalidDate = new Date('not-a-date')
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(invalidDate)

            // then
            expect(mockOnChange).toHaveBeenCalledWith(null)
        })
    })

    describe('Edge cases', () => {
        it('should handle leap year date correctly', () => {
            // given
            const leapYearDate = '2024-02-29' // Valid leap year date
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(leapYearDate)

            // then
            expect(mockOnChange).toHaveBeenCalledWith('2024-02-29')
        })

        it('should handle date at year boundaries', () => {
            // given
            const newYearDate = '2023-01-01'
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(newYearDate)

            // then
            expect(mockOnChange).toHaveBeenCalledWith('2023-01-01')
        })

        it('should handle end of year date', () => {
            // given
            const endYearDate = '2023-12-31'
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(endYearDate)

            // then
            expect(mockOnChange).toHaveBeenCalledWith('2023-12-31')
        })

        it('should handle different date formats', () => {
            // given
            const differentFormat = 'Dec 25, 2023'
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler(differentFormat)

            // then
            expect(mockOnChange).toHaveBeenCalledWith('2023-12-25')
        })
    })

    describe('Function behavior', () => {
        it('should return a function when called with onChange', () => {
            // when
            const dateHandler = handleDateChange(mockOnChange)

            // then
            expect(typeof dateHandler).toBe('function')
        })

        it('should not call onChange when creating handler', () => {
            // when
            handleDateChange(mockOnChange)

            // then
            expect(mockOnChange).not.toHaveBeenCalled()
        })

        it('should call onChange exactly once per date input', () => {
            // given
            const dateHandler = handleDateChange(mockOnChange)
            const validDate = '2023-12-25'

            // when
            dateHandler(validDate)

            // then
            expect(mockOnChange).toHaveBeenCalledTimes(1)
        })

        it('should handle multiple calls correctly', () => {
            // given
            const dateHandler = handleDateChange(mockOnChange)

            // when
            dateHandler('2023-01-01')
            dateHandler('2023-06-15')
            dateHandler('invalid-date')

            // then
            expect(mockOnChange).toHaveBeenCalledTimes(3)
            expect(mockOnChange).toHaveBeenNthCalledWith(1, '2023-01-01')
            expect(mockOnChange).toHaveBeenNthCalledWith(2, '2023-06-15')
            expect(mockOnChange).toHaveBeenNthCalledWith(3, null)
        })
    })
})