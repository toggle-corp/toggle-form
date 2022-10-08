import { removeNull } from './nullHelper';

test('test removeNull condition', () => {
    expect(removeNull(null)).toBe(undefined);
    expect(removeNull(undefined)).toBe(undefined);
    expect(removeNull([])).toStrictEqual([]);
    expect(removeNull({})).toStrictEqual({});
    expect(removeNull([null, null])).toStrictEqual([]);
    expect(removeNull([1, null, 2, undefined, '10'])).toStrictEqual([1, 2, '10']);
    expect(removeNull([
        10,
        'tc',
        null,
        {
            name: 'John',
            age: 24,
            roll: null,
            address: undefined,
            height: '',
        },
        [
            12,
            '',
            null,
            undefined,
        ],
    ])).toStrictEqual([
        10,
        'tc',
        {
            name: 'John',
            age: 24,
            height: '',
        },
        [12, ''],
    ]);
    expect(removeNull({
        name: null, age: null, roll: undefined, address: '',
    })).toStrictEqual({ address: '' });
    expect(removeNull({ name: 'hari', age: null, roll: 2231 })).toStrictEqual({ name: 'hari', roll: 2231 });
    expect(removeNull({
        name: 'John',
        age: 24,
        office: {
            name: 'tc',
            location: 'lalitpur',
            code: null,
            type: undefined,
        },
        dressCode: undefined,
        skills: [
            'JavaScript',
            'C++',
            200,
            {
                school: 2010,
                highSchool: null,
                college: 2015,
            },
            null,
            undefined,
        ],
    })).toStrictEqual({
        name: 'John',
        age: 24,
        office: {
            name: 'tc',
            location: 'lalitpur',
        },
        skills: [
            'JavaScript',
            'C++',
            200,
            {
                school: 2010,
                college: 2015,
            },
        ],
    });
});
